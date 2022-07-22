---
template: BlogPost
date: 2022-07-22
published: true
title: "VSCode - prettier"
tags:
  - Tools
thumbnail: /assets/postit-lightbulb-unsplash.jpg
---

I spent way too long figuring out why Prettier was not working in VSCode.

Timo Ernst had the answer (here)[https://dev.to/timo_ernst/prettier-autoformat-for-typescript-not-working-13d8]

This is what Tim says:

First, press shift + cmd + p (Mac), enter “settings” and choose “Preferences: Open Settings (JSON)”. Then add the following:

```
"[typescript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
"[typescriptreact]": { "editor.defaultFormatter": "esbenp.prettier-vscode" }
```

Make sure you have set "editor.formatOnSave": true
