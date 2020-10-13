---
template: BlogPost
date: 2020-10-13
published: true
title: 'Quick Tip: Node JS profiling'
tags:
  - Quick Tip
  - Netlify
  - Tools
thumbnail: /assets/caliper-unsplash.jpg
---

Clinic is a tool to profile your node apps. https://clinicjs.org/

You should visit the site to learn how to use the tool. Following is just a cheat sheet.

### Install Autocannon

Autocannon is a benchmarking tool written in node

```bash
yarn global add autocannon
gatsby develop
autocannon -c 2 -d 5 localhost:8000
```

### Install Clinic

```bash
yarn global add clinic
clinic -h
```

### Run Clinic

```bash
clinic doctor --autocannon [ -c 20 -d 5 -m GET 'http://localhost:3000/' ] -- node app.js
clinic bubble --autocannon [ -c 20 -d 5 -m GET 'http://localhost:3000/' ] -- node app.js
clinic flame --autocannon [ -c 20 -d 5 -m GET 'http://localhost:3000/' ] -- node app.js
```
