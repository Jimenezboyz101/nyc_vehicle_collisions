// Assign your Mapbox access token
mapboxgl.accessToken =
    'pk.eyJ1Ijoib3N3YWxkb2ppbWVuZXoiLCJhIjoiY21reGJqc3NkMDhxbTNqcHh4OGNlYm94OSJ9.OKsd-KUnhUT0HP-tWB8Yqg';

// Initialize the map centered on NYC
let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    zoom: 10,
    minZoom: 9,
    center: [-74.0060, 40.7128]
});

// Chart and data variables
let collisionChart = null,
    casualties = {},
    numCollisions = 0;

// Casualty severity classes
const grades = [0, 1, 2]; // 0, 1, 2+
const colors = ['#2DC4B2', '#F1C40F', '#E74C3C'];
const radii = [4, 8, 14];

// Legend setup
const legend = document.getElementById('legend');
let labels = ['<strong>Casualties</strong>'];

for (let i = 0; i < grades.length; i++) {
    let labelText = grades[i] === 2 ? "2+" : grades[i];
    let dotSize = 2 * radii[i];

    labels.push(
        `<p class="break">
            <i class="dot" style="background:${colors[i]};
            width:${dotSize}px;height:${dotSize}px;"></i>
            <span class="dot-label" style="top:${dotSize/2}px;">
            ${labelText}
            </span>
        </p>`
    );
}

legend.innerHTML = labels.join('');

// Fetch GeoJSON data
async function geojsonFetch() {

    let response = await fetch('assets/collisions.geojson');
    let collisions = await response.json();

    map.on('load', () => {

        // Add data source
        map.addSource('collisions', {
            type: 'geojson',
            data: collisions
        });

        // Add circle layer
        map.addLayer({
            id: 'collisions-point',
            type: 'circle',
            source: 'collisions',
            minzoom: 9,
            paint: {
                'circle-radius': [
                    'interpolate',
                    ['linear'],
                    ['get', 'Casualty'],
                    0, radii[0],
                    1, radii[1],
                    2, radii[2]
                ],
                'circle-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'Casualty'],
                    0, colors[0],
                    1, colors[1],
                    2, colors[2]
                ],
                'circle-stroke-color': 'white',
                'circle-stroke-width': 1,
                'circle-opacity': 0.7
            }
        }, 'waterway-label');

        // Popups
        map.on('click', 'collisions-point', (event) => {
            let props = event.features[0].properties;

            new mapboxgl.Popup()
                .setLngLat(event.features[0].geometry.coordinates)
                .setHTML(`
                    <strong>Injured:</strong> ${props.Injured}<br>
                    <strong>Killed:</strong> ${props.Killed}<br>
                    <strong>Casualties:</strong> ${props.Casualty}<br>
                    <strong>Factor:</strong> ${props.Factor1}<br>
                    <strong>Day:</strong> ${props.Day}<br>
                    <strong>Hour:</strong> ${props.Hour}:00
                `)
                .addTo(map);
        });

        // Start the calculation
        casualties = calCollisions(collisions, map.getBounds());
        updateSidebarAndChart();
    });

    // Update when map moves
    map.on('idle', () => {
        casualties = calCollisions(collisions, map.getBounds());
        updateSidebarAndChart();
    });
}

// Calculate collisions within the current bounds
function calCollisions(currentCollisions, currentMapBounds) {
    let collisionClasses = {
        0: 0,
        1: 0,
        2: 0
    };

    currentCollisions.features.forEach(function (d) {
        if (currentMapBounds.contains(d.geometry.coordinates)) {
            let c = d.properties.Casualty;

            if (c >= 2) {
                collisionClasses[2] += 1;
            } else {
                collisionClasses[c] += 1;
            }
        }
    });

    return collisionClasses;
}


// Update sidebar count + chart
function updateSidebarAndChart() {
    numCollisions = casualties[0] + casualties[1] + casualties[2];

    document.getElementById("earthquake-count").innerHTML = numCollisions;

    let x = ["severity", "0", "1", "2+"];
    let y = ["#", casualties[0], casualties[1], casualties[2]];

    if (!collisionChart) {
        collisionChart = c3.generate({
            size: {
                height: 350,
                width: 460
            },
            data: {
                x: 'severity',
                columns: [x, y],
                type: 'bar',
                colors: {
                    '#': (d) => colors[d["x"]]
                },
                onclick: function (d) {
                    if (d.x === 2) {
                        map.setFilter('collisions-point',
                            ['>=', ['get', 'Casualty'], 2]
                        );
                    } else {
                        map.setFilter('collisions-point',
                            ['==', ['get', 'Casualty'], d.x]
                        );
                    }
                }
            },
            axis: {
                x: {
                    type: 'category'
                }
            },
            legend: {
                show: false
            },
            bindto: "#collision-chart"
        });
    } else {
        collisionChart.load({
            columns: [x, y]
        });
    }
}

// Reset button
const reset = document.getElementById('reset');
reset.addEventListener('click', () => {

    map.flyTo({
        zoom: 10,
        center: [-74.0060, 40.7128]
    });

    map.setFilter('collisions-point', null);
});

geojsonFetch();