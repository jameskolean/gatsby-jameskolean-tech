---
template: BlogPost
date: 2020-04-17
title: 'Framer Motion: Animation Clean and Simple'
tags:
  - Gatsby
  - React
  - JavaScript
thumbnail: /assets/ferriswheel-unsplash.jpg
published: true
---

I wanted to add some animation to this site. I heard good things about Framer Motion, so I gave it a try, and it exceeded my expectations. It was so clean and straightforward to add a little animation. My biggest issue was to hold myself back from going overboard on the animations since it was so easy. You can see this animation in action when you hover over any Post on https://jameskolean.tech/posts

UPDATE: There is a Beta feature 'AnimateSharedLayout' that is pretty amazing see usage information at end of Post.

The cards I wanted to animate are enclosed `<article>` tags. All I did to add animation was to replace it with `<motion.article whileHover={{scale: 1.02}}>`. That's it.

## Details

Add framer-motion package

```powershell
npm install -save framer-motion
```

In the file containing my Post Cards import motion

```javascript
import { motion } from 'framer-motion'
```

Then replace the <article> tag

```jsx
<motion.article
    className='card'
    whileHover={{
      translateX: -4,
      translateY: -4,
    }}
>
```

## AnimateSharedLayout

This is pretty amazing, you can see the animation in action on https://jameskolean.tech/posts when you apply a tag filter. All you need to do is:

1. Add the Beta dependence

`npm install framer-motion@beta`

2. First, wrap the <AnimateSharedLayout> tag around the items you want animated.
3. Then wrap the items to be animated with a <motion.XXX> tag (in my case, the item are articles so I used <motion.article>).
4. Then add a unique 'layoutId' to each <motion.XXX>. This help motion to understand which elements are related.
