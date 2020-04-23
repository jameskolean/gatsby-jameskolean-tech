---
template: BlogPost
date: 2020-04-20T13:59:29.555Z
title: 'Flare Animation in Gatsby'
tags:
  - Tools
  - Gatsby
thumbnail: /assets/blue-dots-unsplash.jpg
---

Rive offers a tool called Flare for building vector designs and animations. Check out their news release [news release](https://medium.com/rive/flare-launch-d524067d34d8).

## Usage

- Export you animation as an **_\*.flr_** file.
- Place the file in the static folder
- Add the react-flare dependency \
  `npm install flare-react`
- Add your annimation to a page

```javascript
import React from 'react'
import FlareComponent from 'flare-react'

const IndexPage = () => {
  return (
    <FlareComponent
      width={200}
      height={200}
      animationName='open'
      file='sample.flr'
    />
  )
}

export default IndexPage
```
