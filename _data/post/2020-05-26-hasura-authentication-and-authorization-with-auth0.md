---
template: BlogPost
date: 2020-05-26T19:37:55.030Z
published: true
source:
tags:
  - Authentication & Authorization
  - Dev Ops
  - GraphQL
  - React

title: Hasura Authentication and Authorization with Auth0.
thumbnail: /assets/locked-gate-unsplash.jpg
---

I had to hunt for this solution, so while it's easy to implement, finding the correct incantation is not. Reference my previous post on setting up Gatsby with Auth0 for a complete solution. https://jameskolean.tech/post/2019-08-27-gatsbyjs-authentication-with-auth0/

Hasura has several ways to do Authentication and Authorization. You can find the documentation here https://hasura.io/docs/1.0/graphql/manual/auth/authentication/index.html.

## Setting up custom JWT

We want to use a JWT (JSON Web Token) provided by Auth0. To make this happen, we need Auth0 to add some extra information to the JWT. We do this with Auth0 Rules. Go to the Dashboard and choose Rules on the lefthand menu. Create a new Rule with any name that makes sense and paste in this code.

```javascript
function (user, context, callback) {
  const assignedRoles = (context.authorization || {}).roles;
  const namespace = "https://hasura.io/jwt/claims";
  context.idToken[namespace] =
    {
      'x-hasura-default-role': 'user',
      'x-hasura-allowed-roles': assignedRoles,
      'x-hasura-user-id': user.user_id
    };
  callback(null, user, context);
}
```

Note: When we make the GraphQL call to Hasura, we need to provide a user role that the the query will be executed as. This needs to be one of the assigned roles. If we don't specify a Role the the Role will default to 'user',

## Setting Up Roles and Users

Go to the Auth0 Dashboard and choose Users & Roles > Roles on the lefthand menu. Create a new test Role here. Now go to Users & Roles > Users and add the new Role to a user.

## Try it

To test, all we need to do is log into the Gatsby and print out the JWT. Copy the JWT and paste it into https://jwt.io/ to decode it and see the additional fields.

Now you can set up Hasura table permissions using the new Role.

## Securing Hasura Admin and JWT mode activation

You need to crate a `HASURA_GRAPHQL_JWT_SECRET` and add it to our environmental varaibles in Heroku. Use this like to create the secret.

https://hasura.io/jwt-config/

Now add the environmental variable. Go to the Settings tab and click 'Receal Config Vars'.

You can also add an `HASURA_GRAPHQL_ADMIN_SECRET` to override the Admin Console authentication.

![Set Table Permission](/assets/hasura-auth0/hasura-permissions.png) You can set the table permissions like this.

![Test GraphQL](/assets/hasura-auth0/hasura-test-auth.png) Use these headers to test the GrqphQL.
