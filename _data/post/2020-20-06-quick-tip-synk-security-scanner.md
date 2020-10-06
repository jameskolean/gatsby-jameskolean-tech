---
template: BlogPost
date: 2020-10-06
published: true
title: 'Quick Tip: Snyk security scanner'
tags:
  - Quick Tip
  - NodeJS
  - JavaScript
thumbnail: /assets/woman-magnifingglass-unsplash.jpg
---

I recently ran across a slick tool called Snyk at https://app.snyk.io. This tool will watch for and report security and license issues in your NodeJS dependency. It will also help create pull requests to resolve any problems.

I started [here](https://support.snyk.io/hc/en-us/categories/360000598398-Integrations) following the GitLab integration. Follow the instructions to create a GitLab Personal Access Token with API access. Then choose the projects you want to monitor.

I tried the VSCode extension _Vuln Cost - Security Scanner_, but it didn't install properly.

The command-line interface is pretty simple. One install option is with NPM like this.

```bash
npm install -g snyk
```

Usage requires you to authenticate.

```bash
snyk auth
```

Now you can scan your project.

```bash
snyk test
```

Go [here](https://support.snyk.io/hc/en-us/articles/360003812578-CLI-reference) for more information on the command options. The most common commands are these.

```bash
snyk auth
snyk test
snyk wizard
snyk protect
snyk monitor
```
