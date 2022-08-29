---
template: BlogPost
date: 2022-08-29
published: true
title: "Exploe Prisma with REST and GraphQL API"
source: "https://gitlab.com/jameskolean/prisma-rest-graphql"
tags:
  - React
  - Rest
  - GraphQL
thumbnail: /assets/plasma-unsplash.jpg
---

# Easy REST and GraphQL with Prisma

Prisma is an Object to Relational Mapper (ORM) that makes working with databases more accessible and consistent. Prisma supports both Relational Databased like PostgreSQL and Document Databases MongoDB.

Let's use Prisma to see how we can set up a simple REST API and a GrapgQL API for the same data model. We will use the model with one-to-one, one-to-many, and many-to-many relationships to see how these are managed in the ORM.

Model
Author
books (many)
biography (one)
Biography
subject (one)
Book
author (one)
category (many)
Category
book (many)

Relationships
'one-to-one' relationship is Author to Biography
'one-to-many' relationship is Author to Books
'many-to-many' relationship is Categories to Books

We will tackle this in 5 parts.
Run Relational Database locally.
Implement CRUD (Create Read Update Delete) on the Book model with Prisma.
Add additional models and relationships.
Create a REST API with the Book Model.
Create a GraphQL API with the Book Model.

## Run Relational Database locally.

We will use PostgreSQL running in a Docker container to make this easy.

To start the Database, run:

```shell
docker-compose up -d
```

To Confirm the Database is running, run:

```shell
docker exec -it prism-example bash
psql -U test
\l
\q
exit
```

To stop the Database, run:

```shell
docker-compose down
```

## Implement CRUD (Create Read Update Delete) on the Book model with Prisma.

### Initialize project and install dependencies

```shell
npm init -y
npm install --save-dev prisma typescript ts-node @types/node
npm install --save-dev nodemon
```

### Setup Typescript

Documentation to configure typescript for Prisma is [here](https://www.prisma.io/docs/getting-started/quickstart)

Create `tsconfig.json`

```shell
touch tsconfig.json
```

Add this

```json
{
  "compilerOptions": {
    "sourceMap": true,
    "outDir": "dist",
    "strict": true,
    "lib": ["esnext"],
    "esModuleInterop": true
  }
}
```

### Install VSCode extension

The extension you want is `Prisma v4.2.0`

To enable, add to the VSCode settings JSON file. To get to the settings, go here: Code > Preferences > Settings, then switch to the JSON view in the upper right.

```json
  "[prisma]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "Prisma.prisma"
  }
```

### Initialize Prisma

```shell
npx prisma init
```

update `.env`

```
DATABASE_URL="postgresql://test:test@localhost:5432/test?schema=public"
```

Add the book Model

```json
// prisma/schema.prisma

// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Author {
  id          String  @id @default(uuid())
  title       String  @unique
  description String?
}
```

Let Prisma set up the Database, and let's see what we have.

```shell
npx prisma migrate dev
npx prisma studio
```

Now let's use prisma-client to access the Database.

```shell
npm install @prisma/client
npx prisma generate
```

Create our node app

```shell
mkdir src && touch src/app.ts
```

Add this

```typescript
// src/app.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log(
    await prisma.book.create({
      data: {
        title: "My First Book",
      },
    })
  );
}

main()
  .catch((e) => {
    console.log(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Now we need a way to run our Node application, so edit `package.json.`

```json
  "scripts": {
    "dev:simple": "nodemon ./src/app.ts",
...
```

Add run it

```shell
npm run dev:simple
```

Let's try full CRUD. Edit `src/app.ts`.

```typescript
async function main() {
  // remove all
  await prisma.book.deleteMany();
  const firstBook = await prisma.book.create({
    data: {
      title: "My First Book",
    },
  });
  console.log("After adding First book.", await prisma.book.findMany());
  const firstBookUpdates = await prisma.book.update({
    where: { id: firstBook.id },
    data: {
      title: "My First Book!!!",
    },
  });
  console.log("After updating First book.", await prisma.book.findMany());
  await prisma.book.delete({
    where: { id: firstBook.id },
  });
  console.log("After deleting First book.", await prisma.book.findMany());
}
```

## Add additional models and relationships.

Let's build a richer schema.

```typescript
// prisma/schema.prisma

// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Author {
  id        String     @id @default(uuid())
  name      String     @unique
  books     Book[]
  biography Biography?
}

model Biography {
  id       String   @id @default(uuid())
  dob      DateTime
  author   Author   @relation(fields: [authorId], references: [id])
  authorId String   @unique
}

model Book {
  id          String     @id @default(uuid())
  title       String     @unique
  description String?
  author      Author?    @relation(fields: [authorId], references: [id])
  authorId    String?
  categories  Category[]
}

model Category {
  id    String @id @default(uuid())
  name  String @unique
  books Book[]
}
```

We can seed the Database for our testing by creating a seed file and pointing to it in `package.json.`

Add this to `package.json.`

```json
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
```

Create this seed script.

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  // create Categories
  const [fiction, nonFiction] = await Promise.all([
    prisma.category.create({
      data: {
        name: "fiction",
      },
    }),
    prisma.category.create({
      data: {
        name: "non-fiction",
      },
    }),
  ]);

  // create Author and Biography
  const markTwain = await prisma.author.create({
    data: {
      name: "Mark Twain",
      biography: {
        create: {
          dob: new Date("November 30, 1835"),
        },
      },
    },
  });

  // create books
  await Promise.all([
    prisma.book.create({
      data: {
        title: "The Adventures of Tom Sawyer",
        authorId: markTwain.id,
        categories: { connect: { id: fiction.id } },
        description:
          "The Adventures of Tom Sawyer is an 1876 novel by Mark Twain about a boy growing up along the Mississippi River. It is set in the 1840s in the town of St. Petersburg, which is based on Hannibal, Missouri, where Twain lived as a boy.",
      },
    }),
    prisma.book.create({
      data: {
        title: "Adventures of Huckleberry Finn",
        authorId: markTwain.id,
        categories: { connect: { id: fiction.id } },
        description:
          "The Adventures of Huckleberry Finn, is a novel by American author Mark Twain, which was first published in the United Kingdom in December 1884 and in the United States in February 1885.",
      },
    }),
  ]);
}

seed()
  .catch((e) => {
    console.log(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run the script and verify the results.

```shell
npx prisma migrate reset
npx prisma studio
```

## Create a REST API with the Book Model.

For the REST API, we will use Fastify, so let's install the dependencies.

```shell
npm install fastify
```

Create our REST API Application.

```typescript
// src/rest.ts
import Fastify from "fastify";
const server = Fastify({
  logger: true,
});
import authorV1Routes from "./modules/author/author.v1.routes";
import bookV1Routes from "./modules/book/book.v1.routes";

async function main() {
  server.register(authorV1Routes, { prefix: "/v1" });
  server.register(bookV1Routes, { prefix: "/v1" });

  // Run the server!
  server.listen({ port: 3000 }, function(err, address) {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    console.log(`Server is now listening on ${address}`);
  });
}
main();
```

```typescript
// src/modules/author/author.v1.routes.ts

import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function authorRoutes(server: FastifyInstance) {
  server.get("/author", async function(request, reply) {
    reply.send(await prisma.author.findMany());
  });
  server.post("/author", async (request, reply) => {
    const user = request.body as AuthorCreate;
    reply.send(
      await prisma.author.create({
        data: {
          name: user.name,
        },
      })
    );
  });
  server.put("/author", async (request, reply) => {
    const author = request.body as AuthorUpdate;
    reply.send(
      await prisma.author.update({
        data: {
          name: author.name,
        },
        where: { id: author.id },
      })
    );
  });
  server.delete("/author", async (request, reply) => {
    const author = request.body as AuthorDelete;
    reply.send(
      await prisma.author.delete({
        where: { id: author.id },
      })
    );
  });
}

export default authorRoutes;

interface AuthorCreate {
  name: string;
}
interface AuthorDelete {
  id: string;
}
interface AuthorUpdate {
  id: string;
  name: string;
}
```

```typescript
// src/modules/user/book.v1.routes.ts

import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function bookRoutes(server: FastifyInstance) {
  server.get("/book", async function(request, reply) {
    reply.send(await prisma.book.findMany());
  });
  server.post("/book", async (request, reply) => {
    const book = request.body as BookCreate;
    reply.send(
      await prisma.book.create({
        data: {
          title: book.title,
          description: book.description,
        },
      })
    );
  });
  server.put("/book", async (request, reply) => {
    const book = request.body as BookUpdate;
    reply.send(
      await prisma.book.update({
        data: {
          title: book.title,
          description: book.description,
        },
        where: { id: book.id },
      })
    );
  });
  server.delete("/book", async (request, reply) => {
    const book = request.body as BookDelete;
    reply.send(
      await prisma.book.delete({
        where: { id: book.id },
      })
    );
  });
}

export default bookRoutes;

interface BookCreate {
  title: string;
  description?: string;
}
interface BookDelete {
  id: string;
}
interface BookUpdate {
  id: string;
  title: string;
  description?: string;
}
```

Create a script in `package.json.`

```json
  "scripts": {
    "dev:rest": "ts-node ./src/rest.ts",
...
```

Run and test it.

```shell
npm run dev:rest
curl --request GET  --url http://localhost:3000/v1/book
```

## Create a GraphQL API with the Book Model.

Install dependencies

```shell
npm install type-graphql graphql-fields class-validator ref
lect-metadata graphql apollo-server
npm install --save-dev typegraphql-prisma
```

Add generator to `schema-prism.`

```json
generator typegraphql {
  provider = "typegraphql-prisma"
}
```

Generate

```shell
npx prisma generate
```

Create our App

```typescript
// src/typeGraphql.ts
import "reflect-metadata";
import { PrismaClient } from "@prisma/client";
import { ApolloServer } from "apollo-server";
import { resolvers } from "@generated/type-graphql";
import * as tq from "type-graphql";

const prisma = new PrismaClient();

const app = async () => {
  const schema = await tq.buildSchema({ resolvers, emitSchemaFile: true });
  const server = new ApolloServer({
    schema,
    context: { prisma },
  });
  server.listen().then(async ({ url }) => {
    console.log(`Server ready at: ${url}`);
  });
};

app();
```

Add a run script in `package.json.`

```json
  "scripts": {
    "dev:graphql": "ts-node ./src/typeGraphql.ts",
```

Open a browser [here](http://localhost:4000/)

## Extra

Let's go back to the REST example and use `Zod` to do some validation.

Install dependencies

```shell
npm install  fastify-zod
```

Add some schema files.

```typescript
// src/modules/book/book.schema.ts
import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const bookCore = {
  title: z.string({ required_error: "Title is required." }),
};

const createBookSchema = z.object({
  ...bookCore,
});

const createBookResponseSchema = z.object({
  ...bookCore,
  id: z.string(),
});

const deleteBookSchema = z.object({
  id: z.string(),
});

const deleteBookResponseSchema = z.object({
  ...bookCore,
  id: z.string(),
});

const updateBookSchema = z.object({
  ...bookCore,
  id: z.string(),
});
const updateBookResponseSchema = z.object({
  ...bookCore,
  id: z.string(),
});

export const { schemas: bookSchemas, $ref } = buildJsonSchemas({
  createBookSchema,
  createBookResponseSchema,
  deleteBookSchema,
  deleteBookResponseSchema,
  updateBookSchema,
  updateBookResponseSchema,
});
```

Add the Schemas in the Routes

```typescript
// src/modules/user/book.v1.routes.ts

import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { $ref } from "./book.schema";

const prisma = new PrismaClient();

async function bookRoutes(server: FastifyInstance) {
  server.get("/book", async function(request, reply) {
    reply.send(await prisma.book.findMany());
  });
  server.post(
    "/book",
    {
      schema: {
        body: $ref("createBookSchema"),
        response: { 201: $ref("createBookResponseSchema") },
      },
    },
    async (request, reply) => {
      const book = request.body as BookCreate;
      reply.send(
        await prisma.book.create({
          data: {
            title: book.title,
            description: book.description,
          },
        })
      );
    }
  );
  server.put(
    "/book",
    {
      schema: {
        body: $ref("updateBookSchema"),
        response: { 200: $ref("updateBookResponseSchema") },
      },
    },
    async (request, reply) => {
      const book = request.body as BookUpdate;
      reply.send(
        await prisma.book.update({
          data: {
            title: book.title,
            description: book.description,
          },
          where: { id: book.id },
        })
      );
    }
  );
  server.delete(
    "/book",
    {
      schema: {
        body: $ref("deleteBookSchema"),
        response: { 200: $ref("deleteBookResponseSchema") },
      },
    },
    async (request, reply) => {
      const book = request.body as BookDelete;
      reply.send(
        await prisma.book.delete({
          where: { id: book.id },
        })
      );
    }
  );
}

export default bookRoutes;

interface BookCreate {
  title: string;
  description?: string;
}
interface BookDelete {
  id: string;
}
interface BookUpdate {
  id: string;
  title: string;
  description?: string;
}
```

And finally, wire it all together in the server.

```typescript
// src/rest.ts
import Fastify from "fastify";
const server = Fastify({
  logger: true,
});
import authorV1Routes from "./modules/author/author.v1.routes";
import bookV1Routes from "./modules/book/book.v1.routes";
import { bookSchemas } from "./modules/book/book.schema";

async function main() {
  for (const schema of bookSchemas) {
    server.addSchema(schema);
  }

  server.register(authorV1Routes, { prefix: "/v1" });
  server.register(bookV1Routes, { prefix: "/v1" });

  // Run the server!
  server.listen({ port: 3000 }, function(err, address) {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    console.log(`Server is now listening on ${address}`);
  });
}
main();
```

Adding the schemas seems exceptionally tedious.
