---
template: BlogPost
date: 2020-11-18
published: true
title: 'Learn Javascript the fun way, Build a Game'
source: https://gitlab.com/jameskolean/first-phaser3-game
tags:
  - JavaScript
  - Game
thumbnail: /assets/gamers-unsplash.jpg
---

Here is a fun way to practice our programming skills; let's build a simple game. We will use Phaser3, a Javascript 'framework' for creating all sorts of games.

# Prerequisites

You will need these to install before you start.

- NodeJS
- NPM
- VSCode (or other IDE)

# Set up the project.

Let's set up a boilerplate Javascript project with the Parcel Bundler (so we can use modern Javascript), ESLint (so our code isn't crappy), and Prettier (so the code looks nice). In your terminal console, move to a folder you want to create the game below.

```shell
mkdir first-paser3-game
cd first-paser3-game
npm init -y
npm install parcel-bundler eslint babel-eslint parcel-plugin-clean-easy parcel-plugin-static-files-copy --save-dev
mkdir public
mkdir src
touch src/index.html
touch src/main.js
code .
```

Now add this content to the files we just created.

> src/index.html

```html
<html>
  <head>
    <title>First Phaser3 Game</title>
  </head>
  <body>
    <h1>Hello from Html</h1>
    <script src="main.js"></script>
  </body>
</html>
```

> src/main.js

```javascript
console.log('hello')
```

Add scripts and parcel configuration to package.json

> package.json

```json
{
  "name": "first-phaser3-game",
  "version": "1.0.0",
  "description": "",
  "main": "index.html",
  "scripts": {
    "start": "parcel src/index.html -p 8000",
    "build": "parcel build src/index.html --out-dir dist",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "eslint": "^7.13.0",
    "parcel-bundler": "^1.12.4"
  },
  "parcelCleanPaths": ["dist"],
  "staticFiles": {
    "staticPath": "public",
    "watcherGlob": "**"
  }
}
```

Now let's add some Prettier and ESLint configuration.

> .prettierrc

```json
{
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": false,
  "singleQuote": true
}
```

> .eslintrc.js

```json
(module.exports = {
  "root": true,
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module"
  },
  "env": {
    "es6": true,
    "browser": true
  },
  "extends": ["eslint:recommended"],
  "rules": {}
})
```

## Test it

Run the application.

```bash
npm start
```

Open a browser to http://localhost:8000/ and inspect the console for our 'hello' message.

#Make the Game
Let's add Phaser3 to the project.

```bash
npm install phaser
```

Download some free assets from https://itch.io. I'm using https://audrey.itch.io/doggy-; you can find it by searching for 'Doggy game assets.' If you are following along, then your file stricture should look like this.

![Asset File Structure](/assets/build-a-game/file-structure.png)

If you are looking for a tutorial on Phaser3, there are many out there. Our goal is to have fun with Javascript, so we will only be placing a sprite on the screen and moving it around. It's just a taste that will hopefully get you interested in playing more.

Create the Phaser game by editing main.js.

> src/main.js

```javascript
import Phaser from 'phaser'
import MyScene from './scenes/my-scene'

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 100 },
    },
  },
  scene: [MyScene],
}

export default new Phaser.Game(config)
```

Now create a simple scene.

> src/scenes/my-scene.js

```javascript
import Phaser from 'phaser'

export default class MyScene extends Phaser.Scene {
  constructor() {
    super('MyScene')
  }

  preload() {
    this.load.image('dog', 'assets/doggy/Tiles/dogBrown.png')

    this.cursors = this.input.keyboard.createCursorKeys()
  }

  create() {
    this.dog = this.add.sprite(100, 100, 'dog')
  }

  update() {
    const speed = 1
    if (this.cursors.up.isDown) {
      this.dog.y -= speed
    }
    if (this.cursors.down.isDown) {
      this.dog.y += speed
    }
    if (this.cursors.left.isDown) {
      this.dog.x -= speed
    }
    if (this.cursors.right.isDown) {
      this.dog.x += speed
    }
  }
}
```

Phaser has lifecycle methods called on the scene (a scene is like a stage in a game). In `preload()` we load our assets. in `create()` we use assets to create game entities like sprites in this case. Phaser calls `update()` in a loop while the scene is active. This loop is where we get a chance to move the sprites and detect state changes.

## Test it

Run the application.

```bash
npm start
```

Open a browser to http://localhost:8000/ and use the arrow keys to move the dog.

# Next

There is so much more we could do. I hope this was inspirational.
