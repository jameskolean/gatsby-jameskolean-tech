---
template: BlogPost
date: 2020-11-18T00:00:00.000Z
published: true
title: 'Learn Javascript the fun way, Build a Game'
source: 'https://gitlab.com/jameskolean/first-phaser3-game'
tags:
  - JavaScript
  - Game
thumbnail: /assets/gamers-unsplash.jpg
---

Here is a fun way to practice our programming skills; let's build a simple game. We will use Phaser3, a Javascript 'framework' for creating all sorts of games.

![Game Screenshot](/assets/build-a-game/game-screenshot.png)
[Play 'game' is here](https://first-phaser3-game.netlify.app/)

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
npm install parcel-bundler --save-dev 
npm install eslint parcel-plugin-clean-easy parcel-plugin-static-files-copy --save-dev
npm install babel-core babel-eslint --save-dev
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

# Add some Physics

In `src/main.js`, we set physics to 'Arcade.' Let's turn on debug so we can see what's going on.

> src/main.js

```javascript
// omitted code
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 100 },
      debug: true,
    },
  },
// omitted code
```

You'll notice that our dog sprite does not obey the laws of physics. He just floats in space. Let's fix that by changing the way we add our dog to the scene.

> src/main.js

```javascript
// omitted code
  create() {
    this.dog = this.physics.add.sprite(100, 100, 'dog')
// omitted code
```

There we go, now our dog falls out of the game, so let's add ground.

> src/main.js

```javascript
// omitted code
  preload() {
    this.load.image('dog', 'assets/doggy/Tiles/dogBrown.png')
    this.load.image('ground', 'assets/doggy/Tiles/grassHalfCenter.png')

    this.cursors = this.input.keyboard.createCursorKeys()
  }

  create() {
    this.dog = this.physics.add.sprite(100, 100, 'dog')
    this.dog.body.collideWorldBounds = true

    const platforms = this.physics.add.staticGroup()
    const gameWidth = this.physics.world.bounds.width
    const groundTileWidth = this.game.textures.get('ground').source[0].width
    const tilesToCoverGround = Math.ceil(gameWidth / groundTileWidth)

    for (let index = 0; index < tilesToCoverGround; index++) {
      platforms.create(
        index * groundTileWidth,
        this.physics.world.bounds.bottom,
        'ground',
      )
    }
    this.physics.add.collider(this.dog, platforms)
  }
// omitted code
```

We can do a better job of moving our dog too.

> src/main.js

```javascript
// omitted code
  update() {
    const speed = 4
    const jumpPower = -200
    if (this.cursors.up.isDown && !this.dog.body.touching.none) {
      this.dog.setVelocityY(jumpPower)
    }
    if (this.cursors.left.isDown) {
      this.dog.x -= speed
    }
    if (this.cursors.right.isDown) {
      this.dog.x += speed
    }
  }
// omitted code
```

# Practice Javascript skill with a refactor

The code to build the ground is messy in `my-scene.js`, so let's move it into its own file.

> src/components/ground.js

```javascript
/**
 * @param {Phaser.Scene} scene
 * @param {string} groundTileTexture
 */
const createGround = (scene, groundTileTexture) => {
  const platforms = scene.physics.add.staticGroup()
  const gameWidth = scene.physics.world.bounds.width
  const groundTexture = scene.game.textures.get(groundTileTexture)
  const groundTileWidth = groundTexture.source[0].width
  const tilesToCoverGround = Math.ceil(gameWidth / groundTileWidth)

  for (let index = 0; index < tilesToCoverGround; index++) {
    platforms.create(
      index * groundTileWidth,
      scene.physics.world.bounds.bottom,
      groundTexture
    )
  }
  return platforms
}

export default createGround
```

Now use this component in our scene.

> src/scenes/my-scene.js

```javascript
import Phaser from 'phaser'
import createGround from '../components/ground'

export default class MyScene extends Phaser.Scene {
  constructor() {
    super('MyScene')
  }

  preload() {
    this.load.image('dog', 'assets/doggy/Tiles/dogBrown.png')
    this.load.image('ground', 'assets/doggy/Tiles/grassHalfCenter.png')

    this.cursors = this.input.keyboard.createCursorKeys()
  }

  create() {
    this.dog = this.physics.add.sprite(100, 100, 'dog')
    this.dog.body.collideWorldBounds = true

    const ground = createGround(this, 'ground')
    this.physics.add.collider(this.dog, ground)
  }

  update() {
    const speed = 4
    const jumpPower = -200
    if (this.cursors.up.isDown && !this.dog.body.touching.none) {
      this.dog.setVelocityY(jumpPower)
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

That's great, but we can do more. Let's play with classes to clean up the Dog code.

> src/components/dog.js

```javascript
import Phaser from 'phaser'

export default class Dog extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} texture
   */
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture)
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.body.collideWorldBounds = true
  }

  /**
   * @param {Phaser.Scene} scene
   * **/
  update(scene) {
    const speed = 4
    const jumpPower = -200
    if (scene.cursors.up.isDown && !scene.dog.body.touching.none) {
      scene.dog.setVelocityY(jumpPower)
    }
    if (scene.cursors.left.isDown) {
      scene.dog.x -= speed
    }
    if (scene.cursors.right.isDown) {
      scene.dog.x += speed
    }
  }
}
```

Now use it.

> src/scenes/my-scene.js

```javascript
import Phaser from 'phaser'
import createGround from '../components/ground'
import Dog from '../components/dog'

export default class MyScene extends Phaser.Scene {
  constructor() {
    super('MyScene')
  }

  preload() {
    this.load.image('dog', 'assets/doggy/Tiles/dogBrown.png')
    this.load.image('ground', 'assets/doggy/Tiles/grassHalfCenter.png')

    this.cursors = this.input.keyboard.createCursorKeys()
  }

  create() {
    this.dog = new Dog(this, 100, 100, 'dog')

    const ground = createGround(this, 'ground')
    this.physics.add.collider(this.dog, ground)
  }

  update() {
    this.dog.update(this)
  }
}
```

I like that!

# Next

There is so much more we could do. I hope this was inspirational.
