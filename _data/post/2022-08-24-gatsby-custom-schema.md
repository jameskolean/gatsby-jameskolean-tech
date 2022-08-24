---
template: BlogPost
date: 2022-08-24
published: true
title: "Customizing the GraphQL Schema"
source: "https://gitlab.com/jameskolean/gatsby-resolvers"
demoSite: https://jameskolean.gitlab.io/gatsby-resolvers/
tags:
  - React
  - Gitlab
  - Gatsby
thumbnail: /assets/custom-bike-unsplash.jpg
---

# Customizing the GraphQL Schema

This post is a reminder to my future self of how I created a generic resolver for a Headless Drupal project.

The Gatsby docs on Customizing the GraphQL Schema
is [here](https://www.gatsbyjs.com/docs/reference/graphql-data-layer/schema-customization/)

The setup for this example will follow the Gatsby docs and is close enough to what we would see from Drupal. The gatsby example gets Author info from JSON files and Book info from Markdown.

```shell
yarn add gatsby-transformer-remark gatsby-transformer-json
```

Add these files.

src/data/mark-twain.json

```json
{
  "my-id": "mark-twain",
  "name": "Mark Twain",
  "books": {
    "id": [
      "a-connecticut-yankee-in-king-arthurs-court",
      "adventures-of-huckleberry-finn"
    ]
  }
}
```

And these Markdown files.

```markdown
---
# src/markdown-pages/a-connecticut-yankee-in-king-arthurs-court.md
my-id: "a-connecticut-yankee-in-king-arthurs-court"
title: "A Connecticut Yankee in King Arthur's Court"
author:
  id: "mark-twain"
---

## <p><b>A Connecticut Yankee in King Arthur's Court</b> is an 1889 novel by American humorist and writer Mark Twain. The book was originally titled A Yankee in King Arthur's Court. Some early editions are titled A Yankee at the Court of King Arthur.

<p><b>A Connecticut Yankee in King Arthur's Court</b> is an 1889 novel by American humorist and writer Mark Twain. The book was originally titled A Yankee in King Arthur's Court. Some early editions are titled A Yankee at the Court of King Arthur.
```

```markdown
---
# src/markdown-pages/adventures-of-huckleberry-finn.md
my-id: "adventures-of-huckleberry-finn"
title: "Adventures of Huckleberry Finn"
author:
  id: "mark-twain"
---

<p><b>The Adventures of Huckleberry Finn</b>, is a novel by American author Mark Twain, which was first published in the United Kingdom in December 1884 and in the United States in February 1885.</p>
```

Start the app to see what we are starting with.

```shell
yarn start
open http://localhost:8000/___graphql
```

The GraphQL should look like this.
![Initial GraphQL view](/assets/gatsby-resolvers/inital-graphql.png)

## Add the resolvers

```jsx
// gatsby/resolvers.js

const genericResolver = function genericResolver(nodeType, targetNodeType) {
  return {
    // this is the parent node type
    [nodeType]: {
      // add a new node called referenced to add the target to.
      referenced: {
        type: targetNodeType,
        async resolve(source, args, context, info) {
          // bailout if there is no id
          if (!source.id) {
            return null;
          }
          return await context.nodeModel.findOne({
            query: {
              filter: {
                my_id: {
                  in: source.id,
                },
              },
            },
            type: targetNodeType,
          });
        },
      },
    },
  };
};

const genericArrayResolver = function genericArrayResolver(
  nodeType,
  targetNodeType
) {
  return {
    // this is the parent node type
    [nodeType]: {
      // add a new node called referenced to add the target to.
      referenced: {
        type: [targetNodeType],
        async resolve(source, args, context, info) {
          // bailout if there is no id
          if (!source.id || source.lenght === 0) {
            return [];
          }
          // selecting one at a time to maintain order
          const result = [];
          for (const id of source.id) {
            const node = await context.nodeModel.findOne({
              query: {
                filter: {
                  // this is a hack due to the example construction
                  // normally the ids will not be nested and you can delete `frontmatter`
                  frontmatter: {
                    my_id: {
                      eq: id,
                    },
                  },
                },
              },
              type: targetNodeType,
            });
            result.push(node);
          }
          return result;
        },
      },
    },
  };
};
module.exports = {
  genericArrayResolver,
  genericResolver,
};
```

## Use the resolvers

```jsx
// gatsby-node.js
const { genericArrayResolver, genericResolver } = require("./gatsby/resolvers");
exports.createResolvers = ({ createResolvers }) => {
  const resolvers = {
    ...genericResolver("MarkdownRemarkFrontmatterAuthor", "DataJson"),
    ...genericArrayResolver("DataJsonBooks", "MarkdownRemark"),
  };
  createResolvers(resolvers);
};
```

The GraphQL should look like this.
![Initial GraphQL view](/assets/gatsby-resolvers/final-graphql.png)

## Update the Index page to show our work

```jsx
import * as React from "react";
import { graphql } from "gatsby";
import Layout from "../components/layout";

const IndexPage = ({ data }) => (
  <Layout>
    <div>
      <h1>
        Welcome to <b>Resolver Example</b>
      </h1>
      {data.allDataJson.nodes.map((author) => (
        <div>
          <h4>{author.name}</h4>
          {author.books.referenced.map((book) => (
            <p>{book.frontmatter.title}</p>
          ))}
        </div>
      ))}
    </div>
  </Layout>
);

export default IndexPage;

export const pageQuery = graphql`
  query AuthorQuery {
    allDataJson {
      nodes {
        books {
          referenced {
            frontmatter {
              title
            }
            html
          }
        }
        name
      }
    }
  }
`;
```
