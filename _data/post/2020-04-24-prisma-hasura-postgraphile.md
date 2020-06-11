---
template: BlogPost
date: 2020-04-24T13:59:29.555Z
title: PostGraphile vs Hasura vs Prisma
source: 'https://gitlab.com/jameskolean/database-to-graphql/-/tree/master'
tags:
  - GraphQL
  - React
  - Docker
thumbnail: /assets/sticky-note-square-unsplash.jpg
published: true
---

# Install Postgres

Download Postgres here https://www.postgresql.org/download/ and install the application. Make sure you create a server using the button in the lower-left of the Postgres window and start it. Note that you will need to update \$PATH to use the command line tools. This command will take care of that for you.

```bash
sudo mkdir -p /etc/paths.d && echo /Applications/Postgres.app/Contents/Versions/latest/bin | sudo tee /etc/paths.d/postgresapp
```

Now we can create a Database to test.

```bash
createdb mydb
```

Let's make sure `mydb` exists using the command line tools.

```bash
psql "postgres:///"
\c mydb
select 1 + 1 as two;
quit
```

It would be great to have a UI to interact with our new database, so let's install PGAdmin. You can download it here https://www.postgresql.org/ftp/pgadmin/. There are no credentials for our database, so lease them empty.

Use PGAdmin to create the following tables:

```sql
CREATE SEQUENCE address_id_seq;
CREATE TABLE public."Address"
(
    street character varying COLLATE pg_catalog."default" NOT NULL,
    id integer NOT NULL DEFAULT nextval('address_id_seq'),
    CONSTRAINT "address_pkey" PRIMARY KEY (id)
);
CREATE SEQUENCE user_id_seq;
CREATE TABLE public."User"
(
    id integer NOT NULL DEFAULT nextval('user_id_seq'),
    name character varying COLLATE pg_catalog."default",
    CONSTRAINT "user_pkey" PRIMARY KEY (id),
    CONSTRAINT "fkAddress" FOREIGN KEY (address)
        REFERENCES public."Address" (id)
);
CREATE SEQUENCE group_id_seq;
CREATE TABLE public."Group"
(
    id integer NOT NULL DEFAULT nextval('group_id_seq'),
    name character varying COLLATE pg_catalog."default",
    address integer,
    CONSTRAINT "group_pkey" PRIMARY KEY (id)
);
CREATE SEQUENCE user_group_id_seq;
CREATE TABLE public.User_Group
(
    id integer NOT NULL DEFAULT nextval('user_group_id_seq'),
    "group" integer NOT NULL,
    "user" integer NOT NULL,
    CONSTRAINT user_group_pkey PRIMARY KEY (id),
    CONSTRAINT fkgroup FOREIGN KEY ("group")
        REFERENCES public."Group" (id),
    CONSTRAINT fkuser FOREIGN KEY ("user")
        REFERENCES public."User" (id)
);
INSERT INTO public."Address"(street) VALUES ('1600 Pennsylvania Ave');
INSERT INTO public."Address"(street) VALUES ('4 Privet Drive');
INSERT INTO public."User"(name, address) VALUES ('Don',1);
INSERT INTO public."User"(name, address) VALUES ('Harry',2);
INSERT INTO public."Group"(name) VALUES ('Wizard');
INSERT INTO public."Group"(name) VALUES ('User');
INSERT INTO public."User_Group"(user, group) VALUES (1,2);
INSERT INTO public."User_Group"(user, group) VALUES (2,1);
INSERT INTO public."User_Group"(user, group) VALUES (2,2);
```

Now you can jump to the PostGraphile or Hasura section.

# PostGraphile

Make sure you completed the 'Getting Started' section. At this point we have;

- Postgres installed.
- PGAdmin installed.
- A database called 'mydb.'
- Tables called User, Group, Address, and User_Group.

We can now create a NodeJS app to run PostGraphile. Let's create an Express application for this.

```bash
mkdir postgraphile
cd postgraphile
npx express-generator
npm install
yarn add postgraphile @graphile-contrib/pg-many-to-many
npx postgraphile --append-plugins @graphile-contrib/pg-many-to-many
```

Now edit app.js

```javascript
const { postgraphile } = require('postgraphile')
const PgManyToManyPlugin = require('@graphile-contrib/pg-many-to-many')
...
app.use(
  postgraphile(
    process.env.DATABASE_URL || 'postgres://localhost:5432/mydb',
    'public',
    {
      appendPlugins: [PgManyToManyPlugin],
      watchPg: true,
      graphiql: true,
      enhanceGraphiql: true,
    }
  )
)
...
```

Start the Express

```bash
npm start
```

Open a browser to http://localhost:3000/graphiql

### Subscriptions

Subscriptions don't come for free, and the setup is more than I want to dig into at this time. However, This will demonstrate that it is possible.

```bash
yarn add @graphile/pg-pubsub
npx postgraphile \
 --plugins @graphile/pg-pubsub \
 --subscriptions \
 --simple-subscriptions \
 -c mydb
```

Open a browser to http://localhost:5000/graphiql and Subscription query like this:

```json
subscription MySubscription {
  listen(topic: "hello") {
    query {
      nodeId
      allGroups {
        nodes {
          name
          id
        }
      }
    }
  }
}
```

Now we can trigger the update using a Postgres command. First, enter the command console with `postgres:///,` running this will trigger The Group with id 1 to be updated.

```sql
mydb=# select pg_notify(
	'postgraphile:hello',
	json_build_object('__node__', json_build_array('User', 1))::text                                                                              );
```

Go ahead and change the row and rerun the trigger.

# Hasura

Hasura feels like a more polished version of PostGraphile, as we will see from the install. There are several ways we can get started; there is a 'one-button' deployment to Heroku that installs everything you need, including a Postgres database. Let's choose a docker install that uses the database we already created to get a better comparison. The following command will start Harusa on a Mac, for other Operating systems go [here](https://hasura.io/docs/1.0/graphql/manual/deployment/docker/index.html#step-1-get-the-docker-run-sh-bash-script)

```bash
docker run -p 8080:8080 \
  -e HASURA_GRAPHQL_DATABASE_URL=postgres://postgres:@host.docker.internal:5432/mydb \
  -e HASURA_GRAPHQL_ENABLE_CONSOLE=true \
  hasura/graphql-engine:latest
```

Open a browser to http://localhost:8080/console and tell Harusa to start tracking the existing Tables and Foreign Keys.

![Track Tables](/assets/prisma-hasura-postgraphile/hasura-track-tables.png) On the Data tab click button to add all tables

![Track Tables](/assets/prisma-hasura-postgraphile/hasura-track-relations.png) Now you will see the relationships to can track with Hasura, choose any you like, and test them out on the Query tab.

Subscription will also be working out-of-the-box.

# Prisima

Unlike the previous two examples that a targeted at being GraphQL servers, Prisma seems to be target more at something you add to your application. It's probably better classified as an Object to Relational Mapping (ORM) tool. It manages the connection to the database and generates a client that your application uses. I think you need to add something like GraphQL Yoga to have something similar to the other two tools.

Let's run through a quick setup the follows the [tutorial](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project-typescript-postgres)

```bash
npm init
npm install @prisma/cli --save-dev
npx prisma init
```

Edit the **_prisma/.env_** file to point to our database.

```properties
DATABASE_URL="postgres://postgres:@localhost:5432/mydb?schema=public"
```

```bash
npx prisma introspect
npm install @prisma/client
npx prisma generate
```

Create an **_index.js_** file

```javascript
var { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
  const allUsers = await prisma.user.findMany()
  console.log(allUsers)
}
main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.disconnect()
  })
```

Run Node

```bash
node index.js
```

# Summary

If I was going to start a project that needed a tool like this, Hasura would be the tool I would reach for first. It seems to have the 'sharp edges' taken off. The support for Subscriptions and Authorization make it seem like the pick to focus on first.
