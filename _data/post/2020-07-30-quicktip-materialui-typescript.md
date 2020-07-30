---
template: BlogPost
date: 2020-07-30
published: true
source:
tags:
  - Material-UI
  - Gatsby
  - Typescript
  - Quick Tip
title: 'Quick tip: Custom Material-UI styles with Typescript'
thumbnail: /assets/keyboard-mac-unsplash.jpg
---

I recently started to use Typescript with Material-UI. I wanted to add color instances to the palette for the AppBar and Hero background. No problem, just edit `/src/gatsby-theme-material-ui-top-layout/theme.js` like this.

```javascript
import { createMuiTheme } from '@material-ui/core'

const theme = createMuiTheme({
  palette: {
    background: {
      appbar: '#0c052e',
    },
  },
})

export default theme
```

Dang, now I have errors in my file.
![VSCode Errors](/assets/quicktip-materialui-typescript/error.png)

Alright, we can fix this. Let's first find out where the issue is by hovering over the error.
![VSCode error source](/assets/quicktip-materialui-typescript/error-detail.png)

So `TypeBackground` is the culprit, let's find it in node_modules. Opening `@material-ui/core/styles/createPalette` you will find it.

```javascript
import { Color, PaletteType } from '..';
...
export interface TypeBackground {
  default: string;
  paper: string;
}
...
export default function createPalette(palette: PaletteOptions): Palette;
```

Now create a new file where we can extend the type `/src/types/createPalette.d.ts`.

```javascript
import * as createPalette from "@material-ui/core/styles/createPalette"
declare module "@material-ui/core/styles/createPalette" {
  export interface TypeBackground {
    default: string
    paper: string
    appbar: string
  }
}
```

Great, now we need to import this file somewhere. I have no idea what the best practice is, but I would like all the types to get imported into one file. I'm going to do it in index.tsx until someone tells me why I shouldn't.

```javascript
import TypeBackground from '../types/createPalette'
```

VSCode is happy again!
