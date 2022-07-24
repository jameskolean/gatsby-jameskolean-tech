---
template: BlogPost
date: 2022-05-31
published: true
title: "Deploy a GatsbyJS project on Gitlab Pages"
demoSite: "https://gitlab.com/jameskolean/gitlab-pages-gatsby"
tags:
  - React
  - Gitlab
  - Gatsby
thumbnail: /assets/book-pages-unsplash.jpg
site: https://jameskolean.gitlab.io/gitlab-pages-gatsby/
---

I'm not sure how useful this is in real life, but I want to use it for several demos, so I'll write it up here once and reference it later.

# Step 1: Create a Gatsby Project

Let's create a Gatsby project to get started. We can use the [Quick Start Link](https://www.gatsbyjs.com/docs/quick-start/). In this example, don't choose a CMS, Style System, or Plugins.

```javascript
npm init gatsby -ts
```

As the prompt says, start up and test out project like this.

```bash
cd gitlab-pages-gatsby
npm run develop
```

Open in [browser](http://localhost:8000/).

# Step 2: Configure CI/CD Pipeline

We need to create the file `.gitlab-ci.yml` in the project's root folder. This file tells Gitlab how to build and deploy our project. Our file is very simple.

```yaml
image: node:latest

# This folder is cached between builds
# https://docs.gitlab.com/ce/ci/yaml/README.html#cache
cache:
  paths:
    - node_modules/
    # Enables git-lab CI caching. Both .cache and public must be cached, otherwise builds will fail.
    - .cache/
    - public/

pages:
  script:
    - npm install
    - ./node_modules/.bin/gatsby build --prefix-paths
  artifacts:
    paths:
      - public
  only:
    - main
```

The file sections tell Gitlab the container we want to build with. Then it specifies some files we want cached to speed up later builds. Next, it sets the build commands and indicates which artifacts should be used by Gitlab Pages. Finally, it tells Gitlab we only want to do this when the `main` branch change.

# Step 3 Test it

After you push your code, you can watch the build from the `CD/CD > Pipelines` menu.

Once complete you can find the URL the the `Settings > Pages` menu.

My page is [here](https://jameskolean.gitlab.io/gitlab-pages-gatsby/).

# Step 4 Set pathPrefix

Gatsby assumes it is runnigg at the root, however GitLab Pages runs the site under the repo name. See previous step. We just need to tell Gatsby where we are running. Add this stanza to `gatsby-gonfig.js`

```
module.exports = {
  pathPrefix: `/gitlab-pages-gatsby`,
}
```
