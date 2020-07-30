---
template: BlogPost
date: 2020-07-22
published: true
source: https://gitlab.com/jameskolean/gatsby-reservation
tags:
  - Authentication & Authorization
  - Gatsby
  - GraphQL
title: Template for building a Gatsby project with Hasura and Auth0
thumbnail: /assets/green-net-unsplash.jpg
---

This post is a quickstart template for new projects that are written in Gatsby and use Hasura for data persistence and Auth0 for Authentication and Authorization. Other posts go into details of setting up Gatsby and Hasura and Auth0. This post's purpose is to provide a working example and show where settings in Netlify, Hasura, and Auth0 are.

## Auth0 settings

![Auth0 App Setup](/assets/gatsby-hasura-auth-quickstart/auth0-app-2.png)

![Auth0 App URL Setup](/assets/gatsby-hasura-auth-quickstart/auth0-app-2.png)

![Auth0 Rule Setup](/assets/gatsby-hasura-auth-quickstart/auth0-rules.png)

```javascript
function (user, context, callback) {
  const defaultUser = 'user';
  let assignedRoles = (context.authorization || {}).roles;
  if (! assignedRoles) {
    assignedRoles = [defaultUser];
   } else if (assignedRoles.indexOf(defaultUser) === -1) {
     assignedRoles.push(defaultUser);
   }

  const namespace = "https://hasura.io/jwt/claims";
  context.idToken[namespace] =
    {
      'x-hasura-default-role': defaultUser,
      // do some custom logic to decide allowed roles
      'x-hasura-allowed-roles': assignedRoles,
      'x-hasura-user-id': user.user_id
    };
  callback(null, user, context);
}
```

## Netlify settings

![Netlify Environmental Variables](/assets/gatsby-hasura-auth-quickstart/netlify-env-vars.png)

## Hasura settings

![Example Hasura Permission](/assets/gatsby-hasura-auth-quickstart/hasura-premission.png)
