---
template: BlogPost
date: 2022-07-22
published: true
title: "Get started with Plotly - Pie Chart"
source: "https://gitlab.com/jameskolean/gatsby-plotly-piechart"
demoSite: https://jameskolean.gitlab.io/gatsby-plotly-piechart/
tags:
  - React
  - Gitlab
  - Gatsby
  - Plotly
thumbnail: /assets/line-chart-unsplash.jpg
---

Let's play with [Plotly](https://plotly.com/javascript/) today. We will start with something straightforward, Pie charts.

To get started, create a new Gatsby project following my (previous post)[https://jameskolean.tech/post/2022-05-31-gitlab-pages-gatsby/].

Add the React Plotly wrapper to our project with the types.

```
npm install react-plotly.js plotly.js
npm install --save-dev @types/plotly.js
```

Now let's add our Pie Chart.

```
// /sec/pages/index.tsx
import * as React from 'react'
import Plot from 'react-plotly.js'

const IndexPage = () => {
  const data: Array<Partial<Plotly.PlotData>> = [
    {
      values: [19, 26, 55],
      labels: ['Residential', 'Non-Residential', 'Utility'],
      type: 'pie'
    }
  ]
  const layout = {
    height: 400,
    width: 500
  }
  return (
    <main>
      <title>Home Page</title>
      <h1>My First Plotly Chart</h1>
      <Plot data={data} layout={layout} />
    </main>
  )
}

export default IndexPage
```

In development mode, this will work fine `yarn start,` but if you try to build the site `yarn build.` This error is due to Plotly being a client-side library. It can not run in a node server which is what the build process does.

One fix is to use loadable components.

Install this package

```
yarn add @loadable/component
```

Edit the page

```
// /sec/pages/index.tsx
import * as React from 'react'
import loadable from '@loadable/component'

const IndexPage = () => {
  const Plot = loadable(() => import('react-plotly.js'))
  const data: Array<Partial<Plotly.PlotData>> = [
    {
      values: [19, 26, 55],
      labels: ['Residential', 'Non-Residential', 'Utility'],
      type: 'pie'
    }
  ]
  const layout = {
    height: 400,
    width: 500
  }
  return (
    <main>
      <title>Home Page</title>
      <h1>My First Plotly Chart</h1>
      <Plot data={data} layout={layout} />
    </main>
  )
}

export default IndexPage
```

Now it works in development mode `yarn start.`
And it works in production `yarn build && yarn serve.`
