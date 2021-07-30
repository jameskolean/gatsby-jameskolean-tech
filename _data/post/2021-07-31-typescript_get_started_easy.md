---
template: BlogPost
date: 2021-07-31
published: true
title: 'Typescript - Get started the easy way'
tags:
  - Typescript
  - JavaScript
thumbnail: /assets/types-unsplash.jpg
---

Do you want to get started with Typescript but don't want to deal with Bable configs. Maybe your Team is not fully onboard with Typescript, and you want to provide a gentle nudge. Maybe converting your entire project over to Typescript is more effort htan you want to take on. Well, it's easier than you might think to get started in VSCode. Just add this comment to the top of your file.

```javascript
// @ts-check
```

That's all you need to get started.

Suppose you have a that adds numbers in the file:

```javascript
function add(value1, value2) {
  return value1 + value2
}
```

Just add this comment, and VSCode will pick up the types.

```javascript
/**
 * Adds two numbers
 * @param {number} value1
 * @param {number} value2
 * @returns {number}
 */
function add(value1, value2) {
  return value1 + value2
}
```

Maybe you want to define the type of an object; try this.

```javascript
// @type {{x: number,y: number}}
const point = { x: 0, y: 0 }
```

There is no need to spend days migrating every file in your application to Typescript. Just add what is most helpful.

For more information on Typescript, go here https://www.typescriptlang.org/
For details on JSDoc, go here https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html

Happy coding.
