---
template: BlogPost
date: 2020-10-12
published: true
title: 'Quick Tip: Easy Search with Netlify'
tags:
  - Quick Tip
  - Netlify
  - Tools
thumbnail: /assets/napping-kitty-unsplash.jpg
---

I just love Netlify; they always have something interesting. I found this extension for [adding search to your site](https://github.com/sw-yx/netlify-plugin-search-index). You can use it either client-side or server-side. It's a step you can add to the build that indexes your pages into a JSON file.

For a client-side implementation, you need to ship the file to the client, probably not optimal. Note: there are several client-side tools out there that have more features.

For a server-side implementation, Netlify will spin up a lambda function for you. Granted, this is probably not a production-ready solution but the concept perfect from many uses cases.

## How to.

Tell Netlify you want it to index your site and create a function by adding this to `netlify.toml`.

> netlify.toml

```javascript
;[[plugins]]
package = 'netlify-plugin-search-index'[plugins.inputs]
generatedFunctionName = 'mySearchFunction'
publishDirJSONFileName = 'null'
```

That's it! You can now use a URL like this to search your site.

```
https://yoursite.netlify.com/.netlify/functions/mySearchFunction?search=foo
```
