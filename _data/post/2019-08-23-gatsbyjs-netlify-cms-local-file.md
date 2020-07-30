---
template: BlogPost
date: 2019-09-23
title: GatsbyJS + Netlify CMS + Local File
thumbnail: /assets/code-on-screen-unsplash.jpg
tags:
  - Gatsby
  - Netlify
  - Headless CMS
source: https://github.com/jameskolean/local-netlify-cms
published: true
---

I looked into Netlify CMS today and am liking that it is open-source and Git based. I was surprised that when I was working locally it was making commits to the remote repository. That felt wrong to me, now I could be wrong since I have limited time with the tool and it does support Git branches. Anyway, I wanted to see if I could get it to use the local file system in development mode. Looking around I couldn’t find a tutorial that worked but after a couple hours I was able to get this example working.

You can find my source code [here](https://github.com/jameskolean/local-netlify-cms).

## Get Started

Let’s get started by creating a started App from the [Netlify CMS](https://www.netlifycms.org/docs/start-with-a-template/) site and click the Gatsby started. Follow the instructions and you will have a working app. Now clone the new GitHub repo to your files system and we can get started.

## Customization

First we need to install the[ netlify-cms-backend-fs](https://www.npmjs.com/package/netlify-cms-backend-fs) module which is the key to getting our desired functionality.

```bash
yarn add netlify-cms-backend-fs
```

Now edit gatsby-config.js to use out plugin. At the top of the file add:

```javascript
var fsApi = require('netlify-cms-backend-fs/dist/fs/fs-express-api')
```

Then update the gatsby-plugin-netlify-cms plugin.

```javascript
{
  resolve: 'gatsby-plugin-netlify-cms',
  options: {
    modulePath: `${__dirname}/src/cms/cms.js`,
    enableIdentityWidget: false,
    publicPath: 'admin',
    htmlTitle: 'Content Manager',
    manualInit: true,
  },
},
```

Finally we need to set the development middleware so we can do some development overrides. The sample already has a developmentMiddleware to deal with CORS issues while developing lambda function. I’m sure there is a way to include both, I just replaced it for now.

```javascript
developMiddleware: fsApi,
//   developMiddleware: app => {
//     app.use(
//       '/.netlify/functions/',
//       proxy({
//         target: 'http://localhost:9000',
//         pathRewrite: {
//           '/.netlify/functions/': '',
//         },
//       }),
//     );
//   },
// };
```

Now we can edit two files that are specific to Netlify CMS (static/admin/config.yml and src/cms/cms.js). Let’s start with config.yml where we provide override values that will only be used in Gatsby development mode.

```yaml
development_overrides:
  backend:
    name: file-system
    api_root: 'http://localhost:8000/api'
  publish_mode: simple
```

Now edit cms.js.

```javascript
...
import FileSystemBackend from 'netlify-cms-backend-fs';
...

// If running in development
if (process.env.NODE_ENV === 'development') {
  window.CMS_ENV = 'development_overrides'; // Set the CMS_ENV to the development_ overrides.
  CMS.registerBackend('file-system', FileSystemBackend); // Register the FileSystemBackend.
}

...

CMS.init();
```
