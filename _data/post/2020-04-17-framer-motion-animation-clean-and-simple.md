---
template: BlogPost
date: 2020-04-17T13:59:29.555Z
title: 'Framer Motion: Animation Clean and Simple'
thumbnail: /assets/ferriswheel-unsplash.jpg
---

I wanted to add some animation to this site. I heard good things about Framer Motion, so I gave it a try, and it exceeded my expectations. It was so clean and straightforward to add a little animation. My biggest issue was to hold myself back from going overboard on the animations since it was so easy.

UPDATE: This example barely scratches the surface of the power of Framer Motion. I need to explore this more. See the animate attribute

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
      scale: 1.02,
    }}
>
```
