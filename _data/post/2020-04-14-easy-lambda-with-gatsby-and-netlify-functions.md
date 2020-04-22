---
template: BlogPost
date: 2020-04-07T13:02:08.662Z
title: Easy Lambda with Gatsby and Netlify Functions
thumbnail: /assets/cat-nap-unsplash.jpg
source: https://gitlab.com/jameskolean/gatsby-netlify-function/-/tree/master
---

Let’s look at how to use Netlify Functions in Gatsby. Why do we want to do this? Gatsby is a static site generator, which is excellent for many reasons, one of which is that no server is required making it easy to host and lightning-fast to run. Netlify Functions gives us a way to serve up dynamic content to Gatsby. If you are sold on this idea, then let’s build two functions: 1) a straightforward Hello World example and 2) A more complex example that makes a call to a REST API. Let’s get started.

## Create a Gatsby starter app.

If you have not installed the Gatsby CLI, nows the time

```shell
npm install -g gatsby-cli
```

Now let’s use it to create our starter app.

```shell
gatsby new gatsby-netlify-function https://github.com/gatsbyjs/gatsby-starter-hello-world

```

Let’s test our new application.

```shell
cd gatsby-netlify-function
gatsby develop
```

Open a browser to `http://localhost:8000`

## Add Hello World Function Example

Now let’s get to the reason why we are here, to build a function. First, we need to install dependencies.

```shell
npm install -D http-proxy-middleware netlify-lambda npm-run-all
```

The Run Script needs to be modified. Open package.json and replace the scripts section with this.

```javascript
"scripts": {
  "develop": "gatsby develop",
  "start": "run-p start:**",
  "start:app": "npm run develop",
  "start:lambda": "netlify-lambda serve src/functions",
  "build": "gatsby build && netlify-lambda build src/functions",
  "build:app": "gatsby build",
  "build:lambda": "netlify-lambda build src/functions",
},
```

Next we need to tell Netlify about our function. We do this in the **netlify.toml** file in the project root. Add this section.

```toml
[build]
command = "npm run build"
functions = "functions"
publish = "public"
```

Write our Hello World Function in a file **/src/functions/hello.js**.

```javascript
export function handler(event, context, callback) {
  console.log('queryStringParameters', event.queryStringParameters)
  callback(null, {
    // return null to show no errors
    statusCode: 200, // http status code
    body: JSON.stringify({
      msg: 'Hello, World! ' + Math.round(Math.random() * 10),
    }),
  })
}
```

That’s all we need to run Functions on Netlify. But wait, I want to test this locally. To run locally, we need to add a proxy export in **gatsby-config.js**. Edit the file to include the following export.

```javascript
const { createProxyMiddleware } = require('http-proxy-middleware')
module.exports = {
  developMiddleware: (app) => {
    app.use(
      '/.netlify/functions/',
      createProxyMiddleware({
        target: 'http://localhost:9000',
        pathRewrite: { '/.netlify/functions/': '' },
      })
    )
  },
}
```

Now we can add the Hello World Function to index.js.

```javascript
import React, { useState } from 'react'

const IndexPage = () => {
  const [functionMessage, setFunctionMessage] = useState('')
  const callHelloFunction = () => {
    setFunctionMessage('loading …')
    fetch('/.netlify/functions/hello')
      .then((response) => response.json())
      .then((data) => setFunctionMessage(data.msg))
  }
  return (
    <div>
      <h1>Netlify Function.</h1>
      <button type='button' onClick={callHelloFunction}>
        Run Hello Function
      </button>
      <p>Result: {functionMessage}</p>
      <button type='button' onClick={callUsersFunction}>
        Run Users Function
      </button>
      <Users users={users} />
    </div>
  )
}

export default IndexPage
```

Finally, we can run the demo. Open a terminal to the project root and run this command.

```shell
npm run start:lambda
```

Open another terminal to the project root and run this command.

```shell
gatsby develop
```

Open a browser to[ **http://localhost:8000**](http://localhost:8000/).

## Add REST Function Example

That was great, now let’s try something more interesting. Let’s use the Random User API to grab a list of users. You might want to do something like this as a proxy to avoid CORS issues or submit a form or access protected resources.

Create a new Function in **/src/function/users.js**.

```javascript
import fetch from 'node-fetch'

exports.handler = async function(event, context) {
  const headers = {
    Accept: 'application/jsonhtml',
  }

  try {
    const response = await fetch('https://randomuser.me/api/?results=3', {
      headers,
    })
    if (!response.ok) {
      return { statusCode: response.status, body: response.statusText }
    }
    const data = await response.json()
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    }
  } catch (err) {
    console.log(err) // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }), // Could be a custom message or object i.e. JSON.stringify(err)
    }
  }
}
```

Now we edit **/src/pages/index.js** to call and show the results from the Function.

```javascript
import React, { useState } from 'react'

const Users = ({ users }) => {
  const hasUsers = users && users.length > 0
  if (hasUsers) {
    const userRows = users.map((user) => (
      <tr>
        <td>
          <img src={user.picture.thumbnail} alt='thumbnail' />
        </td>
        <td>{user.name.first}</td>
        <td>{user.name.last}</td>
      </tr>
    ))
    return (
      <table>
        <tr>
          <th></th>
          <th>Firstname</th>
          <th>Lastname</th>
        </tr>
        {userRows}
      </table>
    )
  }
  return <div>Lookup users</div>
}
const IndexPage = () => {
  const [functionMessage, setFunctionMessage] = useState('')
  const callHelloFunction = () => {
    setFunctionMessage('loading ...')
    fetch('/.netlify/functions/hello')
      .then((response) => response.json())
      .then((data) => setFunctionMessage(data.msg))
  }
  const [users, setUsers] = useState([])
  const callUsersFunction = () => {
    setUsers([])
    fetch('/.netlify/functions/users')
      .then((response) => response.json())
      .then((data) => setUsers(data.results))
  }
  return (
    <div>
      <h1>Netlify Function.</h1>
      <button type='button' onClick={callHelloFunction}>
        Run Hello Function
      </button>
      <p>Result: {functionMessage}</p>
      <button type='button' onClick={callUsersFunction}>
        Run Users Function
      </button>
      <Users users={users} />
    </div>
  )
}

export default IndexPage
```

All that’s left to do is to run it as we did before. Open a terminal to the project root and run this command.

```shell
npm run start:lambda
```

\
Open another terminal to the project root and run this command.

```shell
gatsby develop
```

Open a browser to**[http://localhost:8000](http://localhost:8000/)**.

## Deploy to Netlify

Commit the code to GitLab or GitHub then log into Netlify at <https://www.netlify.com/>. Click the ‘New Site from Git’ button in the upper right of the Sites tab and select your git repository. Accept the defaults, and your application will be running in a minute.

Source code:<https://gitlab.com/jameskolean/gatsby-netlify-function/-/tree/master>
