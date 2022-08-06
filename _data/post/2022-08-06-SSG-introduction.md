---
template: BlogPost
date: 2022-08-06
published: true
title: "Not So Static Sites - SSG Introduction"
source: "https://gitlab.com/jameskolean/not-so-static-sites"
demoSite: https://jameskolean.gitlab.io/not-so-static-sites/
tags:
  - React
  - Gatsby
thumbnail: /assets/speedodometer-unsplash.jpg
---

# Not So Static Sites

Meetup tutorial intro to GatsbyJS static generator

## Prerequisites

Following this tutorial requires having node version 14.19.2 or higher installed.

Check if Node is installed.

```
node -v
```

There are many ways to install Node if you do not have it.

- general: install Node from a download at https://nodejs.org/en/download/
- macOS: install with homebrew `brew install node`
- windows: install with chocolatey `choco install nodejs`
- gatsby: Gatsby has node install instructions [here](https://www.gatsbyjs.com/docs/tutorial/part-0/)

## What is a Static Site Generator?

The most simplistic way to think of Static Site Generators (SSGs) are tools that generate every website page as part of a build process. Generated pages are typically deployed on Content Delivery Networks (CDNs). No server is required.

![Simple SSG architecture](/assets/not-so-static-sites/ssg_archutecture.drawio.png)

## Why?

- [ ] Blazingly fast.
- [ ] Scales (Almost) Infinitely.
- [ ] Secure since there is no server.
- [ ] Image optimization.
- [ ] SEO friendly.
- [ ] Best practice out of the box. 100% Lighthouse score.

## Seems restrictive

At this point, you are thinking, "That's great for the simplest of sites. Any modern site is dynamic."

However, the static site can include javascript to provide dynamic features. As an example, the GatsbyJS architecture looks more like this.

![GatsbyJS architecture](/assets/not-so-static-sites/gatsby_archutecture.drawio.png)

## Getting started

Let's build something. Make sure we have `yarn` installed because I like `yarn` and will use it in the demo.

```
yarn -v
```

If you need to install it, run this.

```
npm install --global yarn
```

Now let's get GatsbyJS set up. The GastbyJS documentation is [here](https://www.gatsbyjs.com/docs/tutorial)

Install the GatsbyCLI and verify the installation.

```
npm install -g gatsby-cli
gatsby --version
gatsby --help
```

## Create a site

Open a terminal and change the directory to the folder where you want to create your project. Then run this.

```
gatsby new not-so-static-site
cd not-so-static-site
gatsby develop
```

Instead of `gatsby develop,` you can run `yarn start.` You may need to run `yarn` once to initialize the lock file.

You did it! <font size="5">🎉🎉🎉</font>

See what you built.

```
open http://localhost:8000/
```

Explore data sources here.

```
open http://localhost:8000/___graphql
```

## Add data source

For this tutorial, we will use Markdown files as our data source. GatsbyJS supports multiple simultaneous data sources, merging them into a single GraphQL schema. For most data sources, there are existing plugins. Custom plugins can be written with some Node code.

```
yarn add  gatsby-transformer-remark
```

Now edit `gatsby-config.js.` Adding the `gatsby-source-filesystem` stanza telling Gatsby where to find our Markdown files. Then, add the `gatsby-transformer-remark` plugin to transform the Markdown into the GraphQL schema.

```javascript
...
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `markdown-pages`,
        path: `${__dirname}/src/markdown-pages`,
      }
    },
    `gatsby-transformer-remark`,
    `gatsby-transformer-remark`,
...
```

Now add a Markdown file `src/markdown-pages/first-post.md`

```markdown
---
slug: "/blog/first-post"
date: "2019-05-04"
title: "My first blog post"
---

<h2>Hello World</h2>
<p>This is my first blog post.</p>
```

Start Gatsby and inspect the schema

```
yarn start
open http://localhost:8000/___graphql
```

![Markdown in GraphQL](/assets/not-so-static-sites/remarkGraphQL.png)

Let's wrap this up by creating a template to render the blog post. Create a new file `src/pages/{MarkdownRemark.frontmatter__slug}.js`

```jsx
import React from "react";
import { graphql } from "gatsby";

export default function Template({
  data, // this prop will be injected by the GraphQL query below.
}) {
  const { markdownRemark } = data; // data.markdownRemark holds your post data
  const { frontmatter, html } = markdownRemark;
  return (
    <div className="blog-post-container">
      <div className="blog-post">
        <h1>{frontmatter.title}</h1>
        <h2>{frontmatter.date}</h2>
        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

export const pageQuery = graphql`
  query($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        slug
        title
      }
    }
  }
`;
```

Restart the app to see your page.

```
yarn start
open http://localhost:8000/blog/first-post/
```

### Lighthouse score

![Markdown in GraphQL](/assets/not-so-static-sites/lighthouse.png)
