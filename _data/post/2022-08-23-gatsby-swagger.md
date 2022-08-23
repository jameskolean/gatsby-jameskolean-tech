---
template: BlogPost
date: 2022-08-23
published: true
title: "Swagger API in Gatsby"
source: "https://gitlab.com/jameskolean/gatsby-swagger"
demoSite: https://jameskolean.gitlab.io/gatsby-swagger/
tags:
  - React
  - Gitlab
  - Gatsby
  - Swagger
thumbnail: /assets/circuitboard-unsplash-unsplash.jpg
---

Let's add Swagger to a GatsbjyJS site. SwaggerUI does not have a handy Gatsby plugin or a React wrapper, but that's no problem.

Create a new Gatsby site

```shell
gatsby new gatsby-swagger
```

I deleted all non-essentials. I want a simple index page. Reference this repo to see everything I deleted.

Now we install some dependencies.

```
yarn add swagger-ui
yarn add react-helmet
```

Now let's add SwaggerUI to the `window` object.

```javascript
// gatsby-browser.js
/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/browser-apis/
 */

import SwaggerUI from "swagger-ui";
window.SwaggerUI = SwaggerUI;
```

With that in place, we can create a component. Additionally, we want to add some custom styles.

```javascript
// src/components/swagger.js
import React from "react";
import Helmet from "react-helmet";

export default class Swagger extends React.Component {
  componentDidMount() {
    const { componentId, url } = this.props;
    window.SwaggerUI({
      dom_id: `#${componentId}`,
      url: url,
    });
  }
  render() {
    return (
      <>
        <Helmet>
          // NOTE: I append /gatsby-swagger to support gitlab pages. // I'm sure
          there is a better way to do this
          <link
            href="/gatsby-swagger/swagger/theme-newspaper.css"
            rel="stylesheet"
          />
        </Helmet>
        <div id={this.props.componentId} />
      </>
    );
  }
}
```

Finally, we use the component.

```javascript
// src/pages/index.js

import * as React from "react";
import Swagger from "../components/swagger";

const IndexPage = () => (
  <Swagger
    componentId="petstore-api"
    url="https://petstore.swagger.io/v2/swagger.json"
  />
);

export default IndexPage;
```
