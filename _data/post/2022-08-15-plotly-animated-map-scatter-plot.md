---
template: BlogPost
date: 2022-08-18
published: true
title: "Plotly - Animated Map Scatter Plot"
source: "https://gitlab.com/jameskolean/gatsby-plotly-animated-map-scatter-plot"
demoSite: https://jameskolean.gitlab.io/gatsby-plotly-animated-map-scatter-plot/
tags:
  - React
  - Gitlab
  - Gatsby
  - Plotly
thumbnail: /assets/old-map-unsplash.jpg
---

Let's do a more advanced [Plotly](https://plotly.com/javascript/) example. I don't see any tutorials on Map plot animations. It took me quite a while to get this right, although I don't know why. Now that I have the solution, it seems obvious,

To get started, create a new Gatsby project following my [previous post\(https://jameskolean.tech/post/2022-05-31-gitlab-pages-gatsby/).

Add the React Plotly wrapper to our project with the types.

```
npm install react-plotly.js plotly.js
npm install --save-dev @types/plotly.js
npm install @loadable/component
```

We need `loadable/components` because Plotly must run on the Browser. It can not be statically generated. So we need to import Plotly like this.

```javascript
const Plot = loadable(() => import("react-plotly.js"));
```

What we need to do to make this work is:
Create a Map plot as usual with some Traces.
Create `Frames` containing just the information that changes between the frames.
Configure the Layout with animation controls.

## Step 1: Create a Map Scatter Plot

```javascript
// /src/pages/index.tsx

import * as React from "react";
import loadable from "@loadable/component";
import type { HeadFC } from "gatsby";

const IndexPage = () => {
  const Plot = loadable(() => import("react-plotly.js"));
  function createTraces(): Partial<Plotly.PlotData>[] {
    return [];
  }
  function createFrames(): Partial<Plotly.Frame>[] {
    return [];
  }
  function createLayout(): Partial<Plotly.Layout> {
    return {};
  }
  function createConfiguration(): Partial<Plotly.Config> {
    return {};
  }
  return (
    <main>
      <h1>Animated Map Plot Example</h1>
      <Plot
        data={createTraces()}
        frames={createFrames()}
        layout={createLayout()}
        config={createConfiguration()}
      />
    </main>
  );
};

export default IndexPage;
```

### Create a Simple Layout

```javascript
const CENTER = { lat: 42.838249, lon: -83.200787 };
function createLayout(): Partial<Plotly.Layout> {
  return {
    datarevision: 1,
    autosize: false,
    height: 500,
    title: "Example Animated Map",
    hovermode: "closest",
    showlegend: false,
    xaxis: { visible: false },
    yaxis: { visible: false },
    mapbox: {
      style: "carto-positron",
      zoom: 10,
      center: CENTER,
    },
  };
}
```

### Create some traces

```javascript
function createTraces(): Partial<Plotly.PlotData>[] {
  return [
    {
      name: "trace1",
      text: "Trace One",
      type: "scattermapbox",
      mode: "markers",
      lat: [CENTER.lat],
      lon: [CENTER.lon],
      marker: {
        size: 30,
        color: "red",
        opacity: 0.5,
      },
      hoverinfo: "text",
    },
    {
      name: "trace2",
      text: "Trace Two",
      type: "scattermapbox",
      mode: "markers",
      lat: [42.8248],
      lon: [-83.2647],
      marker: {
        size: 20,
        color: "blue",
        opacity: 0.5,
      },
      hoverinfo: "text",
    },
  ];
}
```

At this point, you should be able to run it and see your map.

## Step 2: Create some frames

For the first trace, let's change the marker. On the second trace, we will change the position.

```javascript
function createFrames(): Partial<Plotly.Frame>[] {
  return [
    {
      name: `frame_0`,
      data: [
        {
          marker: {
            size: 30,
            color: "red",
            opacity: 0.5,
          },
        },
        {
          lat: [42.8248],
          lon: [-83.2547],
        },
      ],
    },
    {
      name: `frame_1`,
      data: [
        {
          marker: {
            size: 45,
            color: "orange",
            opacity: 0.75,
          },
        },
        {
          lat: [42.8248],
          lon: [-83.2447],
        },
      ],
    },
    {
      name: `frame_1`,
      data: [
        {
          marker: {
            size: 50,
            color: "yellow",
            opacity: 1.0,
          },
        },
        {
          lat: [42.8248],
          lon: [-83.2647],
        },
      ],
    },
  ];
}
```

## Step 3: Add controls to the Layout

```javascript
function createLayout(): Partial<Plotly.Layout> {
  return {
    datarevision: 1,
    autosize: false,
    height: 500,
    title: "Example Animated Map",
    hovermode: "closest",
    showlegend: false,
    xaxis: { visible: false },
    yaxis: { visible: false },
    mapbox: {
      style: "carto-positron",
      zoom: 10,
      center: CENTER,
    },
    updatemenus: [
      {
        x: 0,
        y: 0,
        yanchor: "top",
        xanchor: "left",
        showactive: false,
        direction: "left",
        type: "buttons",
        pad: { t: 87, r: 10 },
        buttons: [
          {
            method: "animate",
            args: [
              null,
              {
                mode: "immediate",
                fromcurrent: true,
                transition: { duration: 300 },
                frame: { duration: 500, redraw: true },
              },
            ],
            label: "Play",
          },
          {
            method: "animate",
            args: [
              null,
              {
                mode: "immediate",
                transition: { duration: 0 },
                frame: { duration: 0, redraw: false },
              },
            ],
            label: "Pause",
          },
        ],
      },
    ],
    // Finally, add the slider and use `pad` to position it
    // nicely next to the buttons.
    sliders: [
      {
        pad: { l: 130, t: 55 },
        currentvalue: {
          visible: true,
          prefix: "Frame:",
          xanchor: "right",
          font: { size: 20, color: "#666" },
        },
        steps: [
          {
            method: "animate",
            label: "0",
            value: "frame_0",
            args: [
              ["frame_0"],
              {
                mode: "immediate",
                transition: { duration: 300 },
                frame: { duration: 300, redraw: true },
              },
            ],
          },
          {
            method: "animate",
            label: "1",
            value: "frame_1",
            args: [
              ["frame_1"],
              {
                mode: "immediate",
                transition: { duration: 300 },
                frame: { duration: 300, redraw: true },
              },
            ],
          },
          {
            method: "animate",
            label: "2",
            value: "frame_2",
            args: [
              ["frame_2"],
              {
                mode: "immediate",
                transition: { duration: 300 },
                frame: { duration: 300, redraw: true },
              },
            ],
          },
        ],
      },
    ],
  };
}
```

Run the site now with `gatsby develop`, and you will be able to play the animation.

The transitions don't appear to work. I'm leaving that for another day.
