# NYC Traffic Collisions Dashboard

AI was used in the debugging of this project. I did not use AI to write or complete any components where AI use is prohibited.

[Link to Project](https://jimenezboyz101.github.io/nyc_vehicle_collisions/)

## Project Overview

**Project Title:**
Visualizing Vehicle Collisions in NYC

**Project Description:**
This smart dashboard visualizes vehicle collisions across the city of New York
every circle is one collision while the size and color of the circle indicate the
severity of the collisions. The chart live updates based on whats currently visible
on the users screen. Zoom in and out to see the changes. Click on any vehicle collision
to see additional information for the incident. Note some incidents may be stacked on
top of each other due to occuring in the same location.

The choice to use proportional symbols was due to the collision data initially being
single point. I thought it would really deminish the spatial analysis potential of this
project if I had chosen to sum everything up into a choropleth. With the use of proportional
symbols we can preserve the spatial patterns such as viewing the hot spots for collisions
and at the same time understand the outcome of the collisions at a glance.

---

## Features

- Live updating chart depending on the current user view
- Clicking any severity on the chart filters the results on the map
- Collision severity based legend
- Proportional symbols map
- Ability to click any point and see additional information
