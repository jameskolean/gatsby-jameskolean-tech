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
npm i koa koa-router koa-logger koa-combine-routers koa-bodyparser mongoose apollo-server-koa lodash
npm install nodemon --save-dev0
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
const Logger = require('koa-logger')
const router = require('./routes')

const PORT = process.env.PORT || 3000
const app = new Koa()
app.use(Logger())
app.use(router())

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
```

> /routes/root.js

```javascript
const Router = require('koa-router')
const router = new Router()
router.get('/', async (ctx, next) => {
  ctx.body = 'Hello'
})
module.exports = router
```

> /routes/todo.js

```javascript
const Router = require('koa-router')
const router = new Router({ prefix: '/todo' })
router.get('/', async (ctx, next) => {
  ctx.body = [
    { description: 'Do the thing', completed: false },
    { description: 'Pickup the stuff', completed: false },
    { description: 'Meet with Team', completed: true },
  ]
})
module.exports = router
```

> /routes/index.js

```javascript
const combineRouters = require('koa-combine-routers')
const rootRouter = require('./root')
const todoRouter = require('./todo')
const router = combineRouters(rootRouter, todoRouter)
module.exports = router
```

## Test It

```shell
npm run dev
```

open a browser to http://localhost:3000/data

<div id="database"><h1>MongoDB</h1></div>

For a javascript implementation, MongoDB no-SQL database seems like a natural fit. In a Java-based microservice, relational databases are more standard, and I will include a schema migration tool like Liquibase. With a no-SQL datastore, this is not as crucial, and I will omit it from this solution. To add some structure around the data access, I am including Mongoose.

```shell
# mongo
> use micro-test
> db.todos.insert({"description":"Do the thing","completed":false})
> db.todos.insert({"description":"Pickup the Stuff","completed":false})
> db.todos.insert({"description":"Meet the Team","completed":true})
> show dbs
> db.todos.find()
```

<div id="presistence"><h1>Presistence with Mongoose</h1></div>
Let's use the data.

> /models/todo.js

```javascript
const mongoose = require('mongoose')

// Declare Schema
const TodoSchema = new mongoose.Schema(
  {
    description: { type: String },
    completed: { type: Boolean },
  },
  { timestamps: true }
)

// Declare Model to mongoose with Schema
const Todo = mongoose.model('Todo', TodoSchema)

// Export Model to be used in Node
module.exports = mongoose.model('Todo')
```

> /controller/todo.js

```javascript
const Todo = require('../models/todo')

async function findAll(ctx) {
  // Fetch all Todo’s from the database and return as payload
  const todos = await Todo.find({})
  ctx.body = todos
}

module.exports = {
  findAll,
}
```

> /routes/todo.js

```javascript
const Router = require('koa-router')
const router = new Router({ prefix: '/todo' })
const controller = require('../controllers/todo')

router.get('/', controller.findAll)

module.exports = router
```

> /app.js

```javascript
const Koa = require('koa')
const Logger = require('koa-logger')
const router = require('./routes')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3000

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log('we are connected!')
})
mongoose.connect(`mongodb://localhost:27017/micro-test`, {
  useNewUrlParser: true,
})

const app = new Koa()
app.use(Logger())
app.use(router())

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
```

<div id="rest"><h1>REST</h1></div>
We can build out the remaining REST functionality now.
> /controller/todo.js

```javascript
const Todo = require('../models/todo')

async function findAll(ctx) {
  const todos = await Todo.find({})
  ctx.body = todos
}

async function create(ctx) {
  console.log('ctx.request.body', ctx.request.body)
  const newTodo = new Todo(ctx.request.body)
  const savedTodo = await newTodo.save()
  ctx.body = savedTodo
}

async function destroy(ctx) {
  const id = ctx.params.id
  const todo = await Todo.findById(id)
  const deletedTodo = await todo.remove()
  ctx.body = deletedTodo
}

async function update(ctx) {
  const id = ctx.params.id
  const todo = await Todo.findById(id)
  todo.completed = !todo.completed
  const updatedTodo = await todo.save()
  ctx.body = updatedTodo
}

module.exports = {
  findAll,
  create,
  destroy,
  update,
}
```

> /routes/todo.js

```javascript
const Router = require('koa-router')
const router = new Router({ prefix: '/todo' })
const controller = require('../controllers/todo')

router.get('/', controller.findAll)
router.post('/', controller.create)
router.post('/:id', controller.update)
router.put('/:id', controller.update)
router.delete('/:id', controller.destroy)

module.exports = router
```

Add bodyParser

> /app.js

```javascript
const Koa = require('koa')
const Logger = require('koa-logger')
const router = require('./routes')
const bodyParser = require('koa-bodyparser')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3000

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log('we are connected!')
})
mongoose.connect(`mongodb://localhost:27017/micro-test`, {
  useNewUrlParser: true,
})

const app = new Koa()
app.use(bodyParser())
app.use(Logger())
app.use(router())

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
```

<div id="graphql"><h1>GraphQL</h1></div>
> /app.js

```javascript
...
const graphqlServer = require('./graphql/graphqlServer')
...
const app = new Koa()
app.use(bodyParser())
app.use(Logger())
app.use(router())
app.use(graphqlServer.getMiddleware())
...
```

> /graphql/graphqlServer.js

```javascript
const { ApolloServer, gql } = require('apollo-server-koa')
const { makeExecutableSchema } = require('graphql-tools')
const merge = require('lodash/merge')
const { typeDef: Todo, resolvers: TodoResolvers } = require('./types/todo')
const Query = gql`
  type Query {
    hello: String
  }

  type Mutation {
    null: Boolean
  }
`

const SchemaDefinition = gql`
  schema {
    query: Query
    mutation: Mutation
  }
`

const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
}

const schema = makeExecutableSchema({
  typeDefs: [SchemaDefinition, Query, Todo],
  resolvers: merge(resolvers, TodoResolvers),
})

module.exports = new ApolloServer({ schema })
```

> /graphql/types/todo.js

```javascript
const { gql } = require('apollo-server-koa')
const model = require('../../models/todo')

const typeDef = gql`
  type Todo {
    id: String
    version: Int
    description: String!
    completed: Boolean!
  }
  extend type Query {
    Todos: [Todo]
  }
  extend type Mutation {
    createTodo(description: String): Todo
    completeTodo(id: String): Todo
    deleteTodo(id: String): Todo
  }
`
const resolvers = {
  Todo: {
    id: (val) => val._id,
    version: (val) => val.__v,
  },
  Query: {
    Todos: async () => {
      return await model.find({}).lean()
    },
  },
  Mutation: {
    createTodo: async (root, { description }) => {
      const newTodo = new model({ description, completed: false })
      return await newTodo.save()
    },
    completeTodo: async (root, { id }) => {
      const todo = await model.findById(id)
      todo.completed = !todo.completed
      return await todo.save()
    },
    deleteTodo: async (root, { id }) => {
      const todo = await model.findById(id)
      if (todo) return await todo.remove()
      return null
    },
  },
}
module.exports = {
  typeDef,
  resolvers,
}
```

<div id="messaging"><h1>Messaging</h1></div>
Let's use Kafka cause it's the new hotness, but we can just as easily use ActiveMQ or some Cloud offering. For debugging, we should install the Kafka command-line tool. This install is not a requirement, but it gives visibility into the queue. I suggest using Homebrew to install.
<div id="kafka"><h1>Kafka in Docker</h1></div>
```console
brew install kafka
```

Let's use docker-compose to run Kafka.

> kafka/docker-compose.yml

```yaml
version: '3'
services:
  zookeeper:
    image: wurstmeister/zookeeper
  kafka:
    image: wurstmeister/kafka
    ports:
      - '9092:9092'
    environment:
      KAFKA_ADVERTISED_HOST_NAME: localhost
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
```

Start Kafka with this command.

```shell
docker-compose up -d
docker ps
```

Start an interactive producer with this command.

```shell
kafka-console-producer --broker-list localhost:9092 --topic test
```

Start a consumer to monitor the queue with this command.

```shell
kafka-console-consumer --bootstrap-server localhost:9092 --topic test
```

<div id="producer-consumer"><h1>Producer / Consumer</h1></div>

```shell
npm i kafkajs uuid
```

> /app.js

```javascript
...
const { kafkaServer } = require('./messaging/kafka')
...
app.use(graphqlServer.getMiddleware())
kafkaServer.run().catch(console.error)
...
```

> /routes/message.js

```javascript
const Router = require('koa-router')
const router = new Router({ prefix: '/message' })
const controller = require('../controllers/todo')

router.post('/todo', controller.sendMessage)

module.exports = router
```

> /routes/index.js

```javascript
const combineRouters = require('koa-combine-routers')
const rootRouter = require('./root')
const todoRouter = require('./todo')
const messageRouter = require('./message')

const router = combineRouters(rootRouter, todoRouter, messageRouter)

module.exports = router
```

> /messaging/kafka.js

```javascript
const { Kafka } = require('kafkajs')
const model = require('../models/todo')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
})

const producer = kafka.producer()
const consumer = kafka.consumer({ groupId: 'group_id' })
const kafkaServer = {
  run: async () => {
    // Consuming
    await consumer.connect()
    await consumer.subscribe({ topic: 'todo', fromBeginning: true })

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log({
          partition,
          offset: message.offset,
          value: message.value.toString(),
        })
        const payload = JSON.parse(message.value.toString())
        const newTodo = new model({
          description: payload.description,
          completed: false,
        })
        const savedTodo = await newTodo.save()
      },
    })
  },
}

module.exports = { kafkaServer, producer }
```

> /controllers/todo.js

```javascript
const { v4: uuidv4 } = require('uuid')
const { producer } = require('../messaging/kafka')
...
async function sendMessage(ctx) {
  // place a new Todo message on the topic
  const todoMessage = {
    description: ctx.request.body.description,
    transactionId: uuidv4(),
  }
  await producer.send({
    topic: 'todo',
    messages: [{ value: JSON.stringify(todoMessage) }],
  })

  ctx.body = { success: true }
}

module.exports = {
  findAll,
  create,
  destroy,
  update,
  sendMessage,
}
```

<div id="monitoring"><h1>Monitoring</h1></div>

Just like in the [Java Microservice stack](/post/2020-08-06-my-java-microservice-recipe/), I think the best option for monitoring and log aggregation is to use a service. [Datadog](https://www.datadoghq.com/) as an example, supports multiple languages, monitor server performance, and does log aggregation all at a very reasonable subscription price. There is so much competition in this space. I'm sure you can find a service that meets your needs and removes the cognitive load of dealing with monitoring in your architecture.

Enough about the tooling, whatever way you choose you **_MUST LOG MESSAGE CONTEXT_**. Failing to log message context necessarily render your aggregated log useless, and I've seen this in so many organizations. What does it take to do this correctly?
When an event enters your microservice network is must be assigned a globally unique identifier.
The identifier must be part of the messages passed between microservices. A microservice that transforms a message must respond with the same identifier that was received.
All aggregated logging must consistently include the identifier.
A unique identifier is the MINIMAL contextual information that is included in a message and requires consistent logging. Your organization will need to determine what additional fields are required to trace message processing within your microservice network.

<div id="configuration"><h1>Configuration</h1></div>
From my experience, NodeJS servers use Environmental Variables for configuration. In the Development environment, the values will come from a property file. Other environments will have these set by a CI/CD pipeline.

In my post [Java Microservice stack](/post/2020-08-06-my-java-microservice-recipe/) we use a SpringBoot Configuration Server to serve properties consistently across a server array. NodeJS has client modules for SpringBoot Configuration Server. It's another option.
