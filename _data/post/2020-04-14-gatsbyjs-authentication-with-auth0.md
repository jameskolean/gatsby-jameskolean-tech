---
template: BlogPost
date: 2019-08-27T15:40:56.186Z
title: GatsbyJS Authentication with Auth0
thumbnail: /assets/desk-unsplash.jpg
source: https://gitlab.com/jameskolean/nohingo/-/tags/Auth0
---

This post describes how I added Authentication to my [GatsbyJS](https://www.gatsbyjs.org/) application using [Auth0](https://auth0.com/). The source is [here](https://gitlab.com/jameskolean/nohingo/-/tags/Auth0). I’d like to thank Jason Langsdorf for his [Live Stream](https://www.gatsbyjs.org/blog/2019-03-21-add-auth0-to-gatsby-livestream/) that I used to build my solution. I highly recommend checking out his videos.

## Getting Started

Let’s get right into it then. The tasks we need to accomplish to get this working are:

- Load the auth0-js library.
- Create a utility class that we can call:

  - login
  - logout
  - renew session
  - get user information

- Add authenticated URLs with client-side routing.
- Add code to renew the session.

## Loading auth0-js

This is a little tricky since it will throw an error if loaded during GatsbyJS build, we only need this on the client. To correctly load auth0-js we first need to tell Webpack not to load it by adding this snippet to gatsby-node.js

```javascript
exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  if (stage === 'build-html') {
    /*
     * During the build step, `auth0-js` will break because it relies on
     * browser-specific APIs. Fortunately, we don’t need it during the build.
     * Using Webpack’s null loader, we’re able to effectively ignore `auth0-js`
     * during the build. (See `src/utils/auth.js` to see how we prevent this
     * from breaking the app.)
     */
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /auth0-js/,
            use: loaders.null(),
          },
        ],
      },
    })
  }
}
```

Then we can add a flag to auth.js (see next section) and only create a WebAuth if we are running in the browser.

```javascript
export const isBrowser = typeof window !== 'undefined'

const auth = isBrowser
  ? new auth0.WebAuth({
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENTID,
      redirectUri: process.env.AUTH0_CALLBACK,
      responseType: 'token id_token',
      scope: 'openid profile email',
    })
  : {}
```

## Create auth.js

Now we need to create a file /src/utils/auth.js which will hold all the utility functions (login, handleAuthentication, logout, checkSession, isAuthenticated, and getProfile).

### login

This function passes off login responsibility to Auth0. Note that we only want to call this if we are running in the client browser.

```javascript
export const login = () => {
  if (!isBrowser) {
    return
  }
  auth.authorize()
}
```

### handleAuthentication

This function is used in the login callback page to populate the user state.

```javascript
export const handleAuthentication = (callback) => {
  auth.parseHash(setSession(callback))
}
```

We call the shared function setSession which gets a little complicated by all the callbacks. This might be refactored for better readability and extensibility.

```javascript
const setSession = (cb = () => {}) => (err, authResult) => {
  if (err) {
    if (err.error === 'login_required') {
      login()
    }
  }
  if (authResult && authResult.accessToken && authResult.idToken) {
    tokens.idToken = authResult.idToken
    tokens.accessToken = authResult.accessToken

    auth.client.userInfo(tokens.accessToken, (_err, userProfile) => {
      user.nickname = userProfile.nickname
      user.name = userProfile.name
      user.picture = userProfile.picture
      window.localStorage.setItem('isLoggedIn', true)

      cb()
    })
  }
}
```

### logout

Here we just need to reset the user state and tell Auth0 to do the same.

```javascript
export const logout = () => {
  tokens.accessToken = false
  tokens.idToken = false
  user.name = ''
  user.nickname = ''
  user.picture = ''
  window.localStorage.setItem('isLoggedIn', false)

  auth.logout({
    returnTo: window.location.origin,
  })
}
```

### checkSession

This function is responsible for renewing the session. When we change pages we need Auth0 to use their cookie to renew the session and return the user information so we can populate the user state.

```javascript
export const isProtectedRoute = () => {
  const protectedRoutes = [`/student`, `/welcome`]
  return protectedRoutes
    .map((route) => window.location.pathname.includes(route))
    .some((route) => route)
}

export const checkSession = (callback) => {
  const isLoggedIn = window.localStorage.getItem('isLoggedIn')
  console.log(`checkSession isLoggedIn: ${isLoggedIn}`)
  if (isLoggedIn === 'false' || isLoggedIn === null) {
    callback()
  }
  if (isProtectedRoute()) {
    auth.checkSession({}, setSession(callback))
  }
}
```

### isAuthenticated

This is a very simple function that returns true if the authentication tokens are set.

```javascript
export const isAuthenticated = () => tokens.idToken !== false
```

### getProfile

This is a getter for the user information.

```javascript
export const getProfile = () => user
```

## Add authenticated URLs with client-side routing

Now we need to set up some dynamic authenticated pages. We will use [Reach Router](https://reach.tech/router) for this.

Let’s start by telling GatsbyJS about these pages by adding the following snippet to gatsby-node.js

```javascript
// Implement the Gatsby API “onCreatePage”. This is
// called after every page is created.
exports.onCreatePage = async ({ page, actions }) => {
  const { createPage } = actions

  // page.matchPath is a special key that's used for matching pages
  // only on the client.
  if (page.path.match(/^\/student/)) {
    page.matchPath = '/student/*'

    // Update the page.
    createPage(page)
  }
}
```

Now we can go into src/pages/student.js and add some routing.

```javascript
const Student = () => {
  if (!isAuthenticated()) {
    login()
    return <p>Redirecting to login...</p>
  }

  return (
    <>
      <Layout>
        <nav>
          <Link to='/student/'>My Dashboard</Link> <br />
          <Link to='/student/courses'>My Courses</Link>
          <br />
        </nav>
        <Router>
          <Dashboard path='/student/*' />
          <Courses path='/student/courses'>
            <CourseIndex path='/' />
            <Course path=':courseId' />
          </Courses>
        </Router>
      </Layout>
    </>
  )
}
```

Note that we call login() if the user has not authenticated.

Once the user is logged in, Auth0 will redirect them to the src/pages/welcome.js where we can call handleAuthentication like this.

```javascript
const Welcome = () => {
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    if (isAuthenticated()) {
      setIsLoading(false)
    } else {
      handleAuthentication(() => setIsLoading(false))
    }
  }, [isLoading])
  if (isLoading) {
    return <p>Loading Profile</p>
  }
  return <Layout>...</Layout>
}
```

## Renew the Session

The last thing we need to do is add the code that will trigger the session renewal. We do this with Gatsby Browser API. Create the file gatsby-browser.js in the project root. This code ensures that checkSession is only called once when a page loaded by the browser.

```javascript
import React, { useState, useEffect } from 'react'
import { checkSession } from './src/utils/auth'

// Try to renew the session when the page reloads
const SessionCheck = ({ children }) => {
  const [loading, stillLoading] = useState(true)
  useEffect(() => checkSession(() => stillLoading(false)))
  return loading === false && <>{children}</>
}

export const wrapRootElement = ({ element }) => {
  if (isProtectedRoute()) {
    return <SessionCheck>{element}</SessionCheck>
  }
  return <>{element}</>
}
```

## Followup

When deploying with Netlify we want to define the Environmental Variables in Netlify and not in .env.production. This would protect any secret keys we might have. In this case all the keys are public keys. We set the environmental variables in Netlify by going to Deploys > Deployment Settings > Environment. The trick here is that the variables must be prefixed with GATSBY\_ which tell GatsbyJS to make them accessible on the client side as well as the build side.
