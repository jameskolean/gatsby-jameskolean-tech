---
template: BlogPost
date: 2020-08-10T19:21:02.160Z
published: true
title: My NodeJS Microservice Recipe
source: https://gitlab.com/jameskolean/microservice-recipe-node
tags:
  - Microservice
  - Docker
  - NodeJS
  - JavaScript
thumbnail: /assets/touch-water-unsplash.jpg
---

This is my recipe for a Microservice implemented in NodeJS.

I'm fairly new to NodeJS as opposed to Java SpringBoot (see my recipe for SpringBoot Microservices [here](/post/2020-08-06-my-java-microservice-recipe/)). I look forward getting challenged on my chosen stack so I can refine and improve.

Ingredients:

- [NodeJS](#nodejs)
- [Database](#database)
- [Presistence](#persistence)
- API
  - [REST](#rest)
  - [GraphQL](#graphql)
- [Messaging](#messaging)
  - [Kafka in Docker](#kafka)
  - [Producer / Consumer](#producer-consumer)
- [Monitoring](#monitoring)
- [Configuration](#configuration)

Directions:

<div id="nodejs"><h1>NodeJS</h1></div>
I'm on the fence between using KOA or Express. KOA has some great features such as 
- It uses modern JavaScript features.
- It's modular.
- It's lightweight.
- It has slightly better performance.

Express is ubiquitous.

I'm going to see where KOA takes us, I think this will result in a cleaner implementation.

```shell
mkdir node-microservice-recipe
cd node-microservice-recipe
npm init node-microservice-recipe
npm i koa koa-router koa-logger
npm install nodemon --save-dev
```

Edit package.json

```javascript
...
  "scripts": {
    "dev": "npx nodemon app.js",
    ...
  },
...
```

> app.js

```javascript
const Koa = require('koa')
const Router = require('koa-router')
const Logger = require('koa-logger')

const app = new Koa()
const router = new Router()

// Response to GET requests
router.get('/', async (ctx) => {
  ctx.body = { context: { transactionId: '1234' }, message: 'Hello World' }
})

// Logging
app.use(Logger())

// Add routes and response to the OPTIONS requests
app.use(router.routes()).use(router.allowedMethods())

// Listening to the port
app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

## Test It

```shell
npm run dev
```

open a browser to http://localhost:3000/data

<div id="database"><h1>MongoDB</h1></div>
Comping soon
<div id="presistence"><h1>Presistence with Mongoose</h1></div>
Comping soon
<div id="rest"><h1>REST</h1></div>
Comping soon
<div id="graphql"><h1>GraphQL</h1></div>
Comping soon
<div id="messaging"><h1>Messaging</h1></div>
Comping soon
<div id="kafka"><h1>Kafka in Docker</h1></div>
Comping soon
<div id="producer-consumer"><h1>Producer / Consumer</h1></div>
Comping soon
<div id="monitoring"><h1>Monitoring</h1></div>
Comping soon
<div id="configuration"><h1>Configuration</h1></div>
Comping soon
