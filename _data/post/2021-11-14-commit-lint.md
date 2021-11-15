---
template: BlogPost
date: 2021-11-14
published: true
title: 'Generate CHANGELOG.md and enforce commit message standards.'
source: 'https://gitlab.com/jameskolean/commit-lint'
tags:
  - Dev Ops
  - JavaScript
  - Tools
thumbnail: /assets/bookshelf-unsplash.jpg
---

# Generate CHANGELOG.md and enforce commit message standards.

I'm pressed for time today, so I'm only including the `README.md.` I'm not going to add much in the way of explanation. The document should be sufficient to help my future self remember how to do this. I played with many tools that Didn't do what I wanted until arriving at this setup.

Note: After you clone the project be sure to run

```bash
yarn
yarn husky install
```

# Install

## Commitlint

```bash
yarn add -D @commitlint/cli @commitlint/config-conventional
echo "module.exports = { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js
```

# Husky

```bash
yarn add husky --D
yarn husky install
yarn husky add .husky/commit-msg 'yarn commitlint --edit $1'
```

# Commitizen prompt

```bash
 yarn add -D @commitlint/cz-commitlint commitizen
 yarn add @commitlint/config-conventional @commitlint/cli -D
```

Add to package.json

```json
{
  "scripts": {
    "commit": "git-cz"
  },
  "config": {
    "commitizen": {
      "path": "@commitlint/cz-commitlint"
    }
  }
}
```

## Try it

```bash
git commit -m "invalid commit message"
git commit -m "chore: valid commit message"
yarn commit
```

Reference

- https://www.npmjs.com/package/@commitlint/cz-commitlint
- https://commitlint.js.org/#/guides-local-setup

# Auto-Changelog

```bash
npm install -g auto-changelog
yarn auto-changelog -p
```

reference -https://www.npmjs.com/package/auto-changelog

# Generate-Changelog

```bash
yarn add generate-changelog -D
yarn changelog
```

reference

- https://www.npmjs.com/package/generate-changelog
