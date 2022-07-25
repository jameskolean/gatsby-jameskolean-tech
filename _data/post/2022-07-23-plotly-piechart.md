---
template: BlogPost
date: 2022-07-23
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

Don't forget to set the pathPrefix in `gatsby-config.ts`

```
import type { GatsbyConfig } from 'gatsby'

const config: GatsbyConfig = {
  siteMetadata: {
    title: `gatsby-plotly-piechart`,
    siteUrl: `https://jameskolean.gitlab.io`
  },
  pathPrefix: `/gatsby-plotly-piechart`,
  // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: true,
  plugins: []
}

export default config
```

So we have a pretty simple pie cart. Let's do something a bit more interesting. Let's make the slices pop out when we click them. To make this happen, we add the `pull` attribute to the plot data like this.

```
const data: Array<MyPlotData> = [
    {
      values: [19, 26, 55],
      labels: ['Residential', 'Non-Residential', 'Utility'],
      pull: [0.15, 0, 0],
      type: 'pie'
    }
  ]
```

That works fine for a static plot, but we want to make this dynamic.

Now let's make our plot data a state variable and hook up some events.

```
  const [data, setData] = React.useState<MyPlotData[]>([
    {
      values: [19, 26, 55],
      labels: ['Residential', 'Non-Residential', 'Utility'],
      pull: [0, 0, 0],
      type: 'pie'
    }
  ])
interface MyPlotData extends Partial<Plotly.PlotData> {
  pull: number[]
}
```

Change the HTML

```
 return (
    <main>
      <title>Home Page</title>
      <h1> My First Plotly Chart</h1>
      <div onClick={handleClickOffPie}>
        <Plot data={data} layout={layout} onClick={handleClickOnPie} />
      </div>
    </main>
  )
```

implement the events

```
function handleClickOnPie(e: Plotly.PlotMouseEvent) {
    const newData = [...data]
    const sliceIndex = e.points[0].pointNumber
    if (newData[0].pull[sliceIndex] > 0) {
      newData[0].pull[sliceIndex] = 0
    } else {
      newData[0].pull[sliceIndex] = 0.15
    }
    setData(newData)
  }

  function handleClickOffPie() {
    const newData = [...data]
    newData[0].pull = [0, 0, 0]
    setData(newData)
  }
```
