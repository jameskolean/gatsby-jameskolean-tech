---
template: BlogPost
date: 2021-08-08
published: true
title: 'NPM Publish 3 ways: Local, NPM, and GitLab'
source: 'https://gitlab.com/jameskolean/my-gitlab-module'
tags:
  - Tools
  - Dev Ops
  - JavaScript
thumbnail: /assets/blue-legos-unsplash.jpg
---

# Publish MPN module 3 ways: Local, NPM, and GitLab

Let's explore publishing NPM modules. We will walk through the process of publishing a module locally, which is great for local development. Then we will try to publish a module to the NPM repository. We will make the module public since a private module requires a paid account on NPM. Finally, we will wrap it up using a Gitlab NPM repository. With Gitlab, we can publish the module privately or publically.

# Local NPM

If you are writing the module and want to test it in another project, then this is what you want. Let's create a module.

```shell
mkdir my-local-module
cd my-local-module
npm init -y
```

The previous command created a `package.json` file.

```json
{
  "name": "my-local-module",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT"
}
```

Create a file `index.js` and add this code.

```javascript
// /index.js
exports.localGreet = function() {
  console.log('Hello from module my-local-module')
}
```

Now 'publish' it with `npm link`

```shell
npm link
```

This command creates a symbolic link to the module. You can read the details [here](https://docs.npmjs.com/cli/v7/commands/npm-link)

Congratulations, you created your first module.

Now let us use it. We will create a simple node app to test our new module.

```shell
cd ..
mkdir node-app
cd node-app
npm init -y
npm link my-local-module
```

Create a file `app.js` and add this code.

```javascript
//  /app.js
var { localGreet } = require('my-local-module')
console.log('Node is running...')
localGreet()
```

Now run the node application.

```shell
node app.js
```

## cleanup

You can remove links with these command.

```shell
npm unlink my-local-module
cd ../my-local-module
npm unlink
```

# Public NPM

Now we will try to publish a public module on NPM. We get started similarly.

```shell
cd ..
mkdir my-npm-module
cd my-npm-module
npm init -y
```

Create a file `index.js` and add this code.

```javascript
// /index.js
exports.npmGreet = function() {
  console.log('Hello from module my-npm-module')
}
```

Now we have something to publish, but we need an NPM account. Head over to https://www.npmjs.com/ and signup for a free account. Once you are signed in, choose the user icon dropdown in the upper right of the screen and select packages. Add an organization; mine is `james-kolean`. Edit `package.json` to include your organization in the name. Mine looks like this `"name": "@james-kolean/my-npm-module",`. The full `package.json` looks like this.

```json
{
  "name": "@james-kolean/my-npm-module",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "James Kolean <jameskolean@gmail.com>",
  "license": "MIT"
}
```

Now run the publish command.

```shell
npm publish --access public
```

Let's test this in our node app.

```shell
cd ../node-app
npm install @james-kolean/my-npm-module
```

Update `app.js` with this code.

```javascript
//  /app.js
var { npmGreet } = require('@james-kolean/my-npm-module')
console.log('Node is running...')
npmGreet()
```

Now run it.

```shell
node app.js
```

## cleanup

You can remove a module from NPM within 72 with these command.

```shell
npm remove @james-kolean/my-npm-module
npm unpublish @james-kolean/my-npm-module --force
```

# Gitlab NPM

For Gitlab, you will need to create an account, so head over to https://gitlab.com and create a free account. Next, you need to create a project. I will create a Public project to share it, but you can create a Private one. Now that we have a project, we need to collect a few values for use in our configuration.

- Domain
- Personal Access Token (we will get this later)
- Project ID
- Project name
- Project root

![Gitlab configuration parameters](/assets/publish-npm-local-npm-gitlab/gitlab-config.png)

Clone your new repository.

```shell
cd ..
git clone git@<your domain>:<your project root>/my-gitlab-module.git
cd my-gitlab-module
npm init -y
```

Create a file `index.js` and add this code.

```javascript
// /index.js
exports.gitlabGreet = function() {
  console.log('Hello from module my-gitlab-module')
}
```

We are still missing a personal access token so go to your user dropdown in the upper right > preferences. Then choose Access Token in the left menu and create a new token with "api," "read repository," and "write repository" permissions. (I'm not sure you need all these, but it seems to work). Save off your new token since this is the last chance to do so.

Now we need to tell NPM to use our Gitlab NPM repository for this project. We do this in a file called `.npmrc` tike this.

```json
@<your project root>:registry=https://<your domain>/api/v4/projects/<your project id>/packages/npm/
//<your domain>/api/v4/projects/<your project id>/packages/npm/:_authToken=<your access token>
```

Edit the name in `project.json` to look like this `"name": "@<your project root>/my-gitlab-module",`. Here is my full `package.json` file.

```json
{
  "name": "@jameskolean/my-gitlab-module",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git+ssh://git@gitlab.com/jameskolean/my-gitlab-module.git"
  },
  "keywords": [],
  "author": "James Kolean <jameskolean@gmail.com>",
  "license": "MIT",
  "bugs": {
    "url": "https://gitlab.com/jameskolean/my-gitlab-module/issues"
  },
  "homepage": "https://gitlab.com/jameskolean/my-gitlab-module#readme"
}
```

Now we can publish.

```shell
npm publish
```

You can confirm the module was added from the Gitlab project page left menu > Packages & Registries > Package Registry.

Let's test this in our node app.

```shell
cd ../node-app
cp ../my-gitlab-module/.npmrc .
npm install @jameskolean/my-npm-module
```

Update `app.js`.

```javascript
//  /app.js
var { gitlabGreet } = require('@jameskolean/my-gitlab-module')
console.log('Node is running...')
gitlabGreet()
```

Now run it.

```shell
node app.js
```

## cleanup

You can remove a module from the Gitlab NPM registry from the UI.
