---
template: BlogPost
date: 2020-05-01T13:59:29.555Z
title: Gatsby + Netlify Functions + FaunaDB
source:
tags:
  - GrapgQL
  - React
  - Netlify
thumbnail: /assets/black-white-graph-unsplash.jpg
---

In this post, we will see how I added the 'Thumbs Up' functionality to this site. The challenge is, of course, that this is a Gatsby statically rendered site, which is great because it's crazy fast and only required a CDN to deploy; however, there is no server to accept post data. No worries, we have options. There are several database services out there; in this case, we will use FaunaDB. It's never a good idea to let the client talk directly to a database, so we will use Netlify Functions to stand between the client and the database. Think of it as a firewall around the database validating requests and limiting interactions. Let's get started.

# Setting up FaunaDB

Open an account at https://dashboard.fauna.com/accounts/login.
Go to 'New Database,' name it Netlify, go to Security, and add a new key. Set the role to 'Admin' and call it 'Netlify.' Save the key for use later. We can create collections by simply importing a GraphQL Schema. Create a file <b>schema.gql</b>.

```shell
type Thumb {
  slug: String!
  upCount: Int!
  downCount: Int!
}
type Comment {
  slug: String!
  body: String!
  username: String!
  approved: Boolean!
}
type Query {
  thumbBySlug(slug: String!): Thumb
    commentBySlug(slug: String!): Comment
    allCommentByUsername(username: String!): [Comment]!
}
```

Run this to import the schema. You need to substitute the key you saved in YOUR-KEY.

```shell
url -u YOUR-KEY: https://graphql.fauna.com/import --data-binary "@schema.gql"
```

Alternatively you can import this file into Insomnia

```json
{
  "_type": "export",
  "__export_format": 4,
  "__export_date": "2020-05-01T12:47:59.419Z",
  "__export_source": "insomnia.desktop.app:v7.1.1",
  "resources": [
    {
      "_id": "req_d0fc3ee4c23d4fea8666470a19079210",
      "authentication": { "token": "{{ FAUNA_TOKEN  }}", "type": "bearer" },
      "body": {
        "mimeType": "application/json",
        "text": "type Thumb {\n  slug: String!\n  upCount: Int!\n  downCount: Int!\n}\ntype Comment {\n  slug: String!\n  body: String!\n  username: String!\n  approved: Boolean!\n}\ntype Query {\n  thumbBySlug(slug: String!): Thumb\n\tcommentBySlug(slug: String!): Comment\n\tallCommentByUsername(username: String!): [Comment]!\n}"
      },
      "created": 1588333612258,
      "description": "",
      "headers": [
        {
          "id": "pair_6d2ddc9aa06948e281cd92a373c734c6",
          "name": "Content-Type",
          "value": "application/json"
        }
      ],
      "isPrivate": false,
      "metaSortKey": -1588333612258,
      "method": "POST",
      "modified": 1588336990200,
      "name": "Import Schema",
      "parameters": [],
      "parentId": "wrk_c6e2582c4bb1430e91a1b35ebdef0036",
      "settingDisableRenderRequestBody": false,
      "settingEncodeUrl": true,
      "settingFollowRedirects": "global",
      "settingRebuildPath": true,
      "settingSendCookies": true,
      "settingStoreCookies": true,
      "url": "https://graphql.fauna.com/import",
      "_type": "request"
    },
    {
      "_id": "wrk_c6e2582c4bb1430e91a1b35ebdef0036",
      "created": 1588271205927,
      "description": "",
      "modified": 1588271205927,
      "name": "faunaDB",
      "parentId": null,
      "_type": "workspace"
    },
    {
      "_id": "req_0bc24e9121694cccb05714b9eb8f2c67",
      "authentication": { "token": "{{ FAUNA_TOKEN  }}", "type": "bearer" },
      "body": {
        "mimeType": "application/graphql",
        "text": "{\"query\":\" mutation  { \\n   addFirstThumb: createThumb(data: {slug: \\\"Sample 1\\\", upCount: 1}) {\\n    slug\\n    downCount\\n    upCount\\n    _id\\n  }\\n  addSecondThumb: createThumb(data: {slug: \\\"Sample 2\\\"}) {\\n    slug\\n    downCount\\n    upCount\\n    _id\\n  }\\n}\"}"
      },
      "created": 1588271843150,
      "description": "",
      "headers": [
        {
          "id": "pair_25a17758ee8c43cbb610fc9bdd201d90",
          "name": "Content-Type",
          "value": "application/json"
        }
      ],
      "isPrivate": false,
      "metaSortKey": -1588271843150,
      "method": "POST",
      "modified": 1588337245619,
      "name": "GraphQL",
      "parameters": [],
      "parentId": "wrk_c6e2582c4bb1430e91a1b35ebdef0036",
      "settingDisableRenderRequestBody": false,
      "settingEncodeUrl": true,
      "settingFollowRedirects": "global",
      "settingRebuildPath": true,
      "settingSendCookies": true,
      "settingStoreCookies": true,
      "url": "https://graphql.fauna.com/graphql ",
      "_type": "request"
    },
    {
      "_id": "env_7c1a368d05e7a2d8614de651031197a156f39cc4",
      "color": null,
      "created": 1588271205975,
      "data": {},
      "dataPropertyOrder": null,
      "isPrivate": false,
      "metaSortKey": 1588271205975,
      "modified": 1588271205975,
      "name": "Base Environment",
      "parentId": "wrk_c6e2582c4bb1430e91a1b35ebdef0036",
      "_type": "environment"
    },
    {
      "_id": "jar_7c1a368d05e7a2d8614de651031197a156f39cc4",
      "cookies": [],
      "created": 1588271205977,
      "modified": 1588271205977,
      "name": "Default Jar",
      "parentId": "wrk_c6e2582c4bb1430e91a1b35ebdef0036",
      "_type": "cookie_jar"
    }
  ]
}
```

Once imported, set your key in the environment like this.

```json
{
  "FAUNA_TOKEN": "YOUR-KEY"
}
```

Go to the indexes and make sure that both commentBySlug and thumbBySlug are unique.

# Add Netlify Functions to Gatsby

See my previous post [Easy Lambda with Gatsby and Netlify Functions](/post/2020-04-07-easy-lambda-with-gatsby-and-netlify-functions/)

# Add Netlify Function calls to FaunaDB

Let's create the Netlify Function that well connect to FaunaDB. Create a file called <b>/src/functions/thumbs-up</b>

```javascript
import gql from 'graphql-tag'
import { createClient } from './fauna-apollo'

export function handler(event, context, callback) {
  const slug = event.queryStringParameters['slug']
  const client = createClient()
  const APOLLO_QUERY = gql`
    query getThumbBySlug($slug: String!) {
      thumbBySlug(slug: $slug) {
        _id
        slug
        upCount
        downCount
      }
    }
  `
  client
    .query({ query: APOLLO_QUERY, variables: { slug } })
    .then(({ data }) => {
      console.log(data)
      callback(null, {
        // return null to show no errors
        statusCode: 200,
        body: JSON.stringify(data.thumbBySlug),
      })
    })
    .catch((error) => callback(e))
}
```

That's pretty simple. The utility function at <b>/src/functions/fauna-apollo.js</b> looks like this.

```javascript
import ApolloClient from 'apollo-boost'
import fetch from 'isomorphic-fetch'

export function createClient() {
  const client = new ApolloClient({
    uri: 'https://graphql.fauna.com/graphql',
    fetch,
    request: (operation) => {
      operation.setContext({
        headers: {
          authorization: 'Bearer fnADqxEZpwACFNEF-NS41mUGXHUdjfkzefYwOLGC',
        },
      })
    },
  })
  return client
}
```

To test it out you can add something like this code to a page, I think you get the idea.

```javascript
const [thumb, setThumb] = useState({ slug: '', upCount: 0, downCount: 0 })
const callHelloFunction = () => {
  fetch('/.netlify/functions/thumbs-up?slug=Sample 1')
    .then((response) => response.json())
    .then((data) => {
      setThumb(data)
    })
}
```
