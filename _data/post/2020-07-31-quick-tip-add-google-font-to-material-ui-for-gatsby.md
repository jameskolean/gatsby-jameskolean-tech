---
template: BlogPost
date: 2020-07-31T16:20:45.082Z
published: true
title: 'Quick Tip: Add Google Font to Material-UI for Gatsby'
tags:
  - Gatsby
  - Material-UI
  - Quick Tip
  - React
  - JavaScript
thumbnail: /assets/fonts-unsplash.jpg
---

In this Quick Tip, let's add a Google Font to our Gatsby application using Material-UI. First, let's choose a font, so head over to https://fonts.google.com/ and pick something you like. Now that we have a font, we need to import it into the project. We can do this with the <Helmet> component.

```javascript
...
import { Helmet } from "react-helmet"
...
<Helmet>
  <link href="https://fonts.googleapis.com/css?family=Permanent+Marker" rel="stylesheet"/>
</Helmet>
...
```

Now use it.

```javascript
import {
  makeStyles,
  Theme,
  createStyles,
  withStyles,
} from "@material-ui/core/styles"
...
const useStyles = makeStyles(({ breakpoints, palette, spacing }: Theme) =>
  createStyles({
    title: {
      fontFamily: '"Permanent Marker", "Roboto", sans-serif'
    },
  })
)
...
<p className={classes.title}>Hello World</p>
...
```

That's all there is to it.
