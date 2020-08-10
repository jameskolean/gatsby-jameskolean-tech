---
template: BlogPost
date: 2020-04-17
title: Code Blocks in Gatsby Markdown
tags:
  - Gatsby
  - JavaScript
thumbnail: /assets/alphabet-blocks-unsplash.jpg
published: true
---

I have a lot of code blocks in my posts, so let's see if we can make them a bit prettier and easier to use.

Let's add two dependencies. The first will make the blocks look better and give us a better editor experience in Netlify CMS.

```bash
npm install -save gatsby-remark-prismjs
npm install gatsby-remark-code-buttons --save-dev
```

To setup just edit /gatsby-plugin.js adding the plugins like this.

```javascript
plugins: [
    ...
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          ...
          {
            resolve: 'gatsby-remark-code-buttons',
            options: {
              tooltipText: 'Copy Code to Clipboard',
              toasterText: 'Copied to Clipboard',
            },
          },
          {
            resolve: `gatsby-remark-prismjs`,
              options: {
              classPrefix: 'language-',
              inlineCodeMarker: null,
              aliases: {},
              showLineNumbers: false,
              noInlineHighlight: false,
            },
          },
        ],
      },
    },
    ...
  ]
```

That will get us close but let's make a small style change to get the copy icon in a better position. Start by creating src/styles/custom-code-buttons.scss

```scss
.gatsby-code-button {
  transform: translateY(-15px);
}
```

Then edit /gatsby-browser.js to use the style.

```javascript
import './src/styles/custom-code-buttons.scss'
```
