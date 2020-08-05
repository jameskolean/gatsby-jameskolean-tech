---
template: BlogPost
date: 2020-08-05T14:24:00.000Z
published: true
title: Clean up your Enterprise APIs with a Apollo Federated GraphQL
tags:
  - GraphQL
  - Microservice
  - REST
  - Tools
thumbnail: /assets/hub-unsplash.jpg
---
# The Problem 

Your Business Unit has developed several independent services, probably using REST, probably designed by separate teams, and possibly implemented with different technology stack. Your troubles start when you want to create an application that uses these inherently inconsistent and fine-grained APIs. Your app must make many API calls across many REST endpoints to present a single page resulting in a slow and buggy app.  

# Problems Continue

So you reach for an API gateway, maybe some expensive proprietary tool, perhaps a cloud offering in any case you now need to write and maintain adapter code bring the inconsistent APIs into a consistent gateway. 
The trouble is you have not addressed the fine-grained nature of the APIs, so your app is still slow and buggy.

# Enter Apollo Federation

Apollo Federation allows teams to build their services independently and merge them into a single GraphQL gateway. The merge operation not only joins the root graphQL node but also builds relationships between nodes. For example, given independent Product and Invoice services, you can access Product information inside an Invoice query. Now your app can get all the data (and only the data) it needs consistently, resulting in a faster, more reliable app. You also get all the benefits inherent to graphQL, such as a schema-based API(worth the admission price, in my opinion).

More info: https://www.apollographql.com/docs/apollo-server/federation/introduction/
