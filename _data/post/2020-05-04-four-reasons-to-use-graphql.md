---
template: BlogPost
date: 2020-05-04T13:59:29.555Z
title: Four reasons you should use GraphQL instead of REST
source:
tags:
  - GraphQL
thumbnail: /assets/sr-professor-unsplash.jpg
published: true
---

1. Clients can ask for only the data it needs. REST typically forces clients to consume a predefined payload. GraphQL allows clients to ask for only the information they need. Smaller information payloads result in lower latency and less work in the client to filter unwanted elements. Clients may also ask the server to perform transformations such as date formatting or currency conversions.
2. Clients can get all the data they need in one request. A REST request targets a specific resource, such as a product. GraphQL allows a client to create a single query gathering data from independent resources. The resulting client code much easier to develop, maintain, and likely faster running.
3. GraphQL has more flexible and natural semantics. REST semantics, based on HTTP methods, falls apart when pushed beyond simple CRUD operations. GraphQL semantics have no such inherent restrictions. GraphQL API operations are grouped into Queries for fetching data, Mutations for performing operations, and Subscriptions for monitoring streams of data.
4. GraphQL APIs are based on a schema. The Schema is essentially an interface definition of your API based on a standard DSL. Having a complete description of an API makes it possible for tooling to help with IntelliSense, validation, and documentation.

For more information on GraphQL, check out these links.

- https://graphql.org/
- https://www.youtube.com/watch?v=VjXb3PRL9WI
- https://hasura.io/ Instantly create GraphQL from a Database
- https://jameskolean.tech/post/2020-04-16-springboot-mongobd-rest-graphql/ Tutorial for Java developers demonstrating REST and GraphQL API.
