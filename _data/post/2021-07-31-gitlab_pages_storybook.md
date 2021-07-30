---
template: BlogPost
date: 2021-07-31
published: true
title: 'GitLab Pages + GitLab CI/CD + Storybook + React'
source: 'https://gitlab.com/jameskolean/storybook-pages'
tags:
  - React
  - Dev Ops
  - Tools
  - JavaScript
thumbnail: /assets/pages-unsplash.jpg
---

Let's have a have at look at Gitlab Pages. In this example, we will create a sim[ple React app, add Storybook, and publish the static Storybook pages to Gitlab Pages. Let's get started.

## Create a React app

We can use crate-react-app for this

```shell
npx create-react-app storybook-pages
cd storybook-pages
```

Make sure everything is working.

```shell
yarn start
```

## Add Storybook

```shell
npx Storybook init
```

Make sure everything is working.

```shell
yarn storybook
```

Now build the Storybook static pages.

```shell
yarn build-storybook
```

The previous command will create a folder called storybook-static. If you use VSCode and have the Live Server plugin, open the folder, select index.html and start your server.

## Commit Code to GitLab

Create a new project in Gitlab called 'storybook pages and follow the instructions in the Repository section to check in your code. Be sure to add the following to your '.gitignore' file.

```
/storybook-static
```

## Publish to GitLab Pages

To publish our Storybook static site to Pages, we need to use Gitlab CI. We do this by creating a file called '.gitlab-ci.yml' in the root folder of our project. When this file is committed and pushed to the remote Gitlab repository, Gitlab will kick off a build using the instruction in the file. The file has several sections; let's look at them one at a time.

```yaml
image: node:latest
```

This command tells Gitlab which docker image to use for the build.

```yaml
workflow:
  rules:
    - if: "$CI_PIPELINE_SOURCE == 'push' && ($CI_COMMIT_REF_SLUG == $CI_DEFAULT_BRANCH || $CI_COMMIT_REF_SLUG == 'develop')"
      when: always
    - if: "$CI_PIPELINE_SOURCE == 'push' && $CI_COMMIT_REF_SLUG =~ /^feature/ && $CI_COMMIT_MESSAGE =~ /^@publish /"
      when: always
    - when: never
```

This command tells Gitlab we only want to trigger a build when either the Main or Develop branches are Pushed or if a Feature is Pushed with '@publish ' at the beginning of the commit message. You can get creative here.

```yaml
stages:
  - setup
  - build-and-test
  - deployment
  - pages
```

This section defines the stages.

```yaml
variables:
  PAGES_URL: 'https://jameskolean.gitlab.io/test-storybook/$CI_COMMIT_REF_SLUG/storybook/'
  PAGES_MAIN_URL: 'https://jameskolean.gitlab.io/test-storybook/$CI_DEFAULT_BRANCH/storybook/'
```

This section sets up some variables. You will need to change these values for your environment.

```yaml
setup:
  stage: setup
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
  artifacts:
    paths:
      - node_modules/
  script:
    - yarn
```

This section initializes the node modules in our container. It uses a cache to minimize downloads. Note the cache key of \${CI_COMMIT_REF_SLUG}; this instructs Gitlab to keep a unique cache for each branch.

```
build:
  stage: build-and-test
  script:
    - echo "Nothing to build or test"
```

This section builds and tests the project. We don't have anything to build or test in the example so we will echo a message.

```yaml
storybook:
  stage: build-and-test
  artifacts:
    expire_in: 2 weeks
    when: always
    paths:
      - storybook-static/
  script:
    - yarn build-storybook
```

This section builds the Storybook static site to the default folder.

```yaml
deploy-storybook:
  stage: deployment
  script:
    - echo "This job configures an environment."
  environment:
    name: storybook/$CI_COMMIT_REF_SLUG
    url: $PAGES_URL
    on_stop: remove-storybook
  only:
    - branches
```

This section sets up environmental variables.

```yaml
remove-storybook:
  stage: deployment
  cache:
    key: 'sp-storybook'
    paths:
      - public
  script:
    - rm -rf "public/$CI_COMMIT_REF_SLUG/storybook"
  when: manual
  variables:
    GIT_STRATEGY: none # needed to prevent "Couldn't find remote ref" error
  environment:
    name: storybook/$CI_COMMIT_REF_SLUG
    action: stop
```

This section manually removes Storybook from a branch. Note that we will be deploying each Storybook branch under the root, so all are available. This will make more sense later. Just notice that we are using a project scoped cache so we can persist artifacts across builds.

```yaml
pages:
  stage: pages
  cache:
    key: 'sp-storybook'
    paths:
      - public
  script:
    - if [ "$CI_COMMIT_REF_NAME" = "master" ]; then
      mkdir -p public;
      touch public/index.html;
      echo "<!DOCTYPE HTML><script>window.location.href = '$PAGES_MAIN_URL'</script>" > public/index.html;
      fi;
    - rm -rf "public/$CI_COMMIT_REF_SLUG"
    - mkdir -p "public/$CI_COMMIT_REF_SLUG";
    - mv storybook-static "public/$CI_COMMIT_REF_SLUG"
  artifacts:
    paths:
      - public
```

We finally get to the point where we publish to Pages. We first pull down the project scoped cache with the previous Storybook publish for each branch. The Script section adds a page to the root that redirects to the Main branch of Storybook. Then it copies over the Storybook static site into a branch-specific path.

The complete file looks like this.

```yaml
image: node:latest

workflow:
  rules:
    - if: "$CI_PIPELINE_SOURCE == 'push' && ($CI_COMMIT_REF_SLUG == $CI_DEFAULT_BRANCH || $CI_COMMIT_REF_SLUG == 'develop')"
      when: always
    - if: "$CI_PIPELINE_SOURCE == 'push' && $CI_COMMIT_REF_SLUG =~ /^feature/ && $CI_COMMIT_MESSAGE =~ /^@publish /"
      when: always
    - when: never

stages:
  - setup
  - build-and-test
  - deployment
  - pages

variables:
  PAGES_URL: 'https://jameskolean.gitlab.io/test-storybook/$CI_COMMIT_REF_SLUG/storybook/'
  PAGES_MAIN_URL: 'https://jameskolean.gitlab.io/test-storybook/$CI_DEFAULT_BRANCH/storybook/'

setup:
  stage: setup
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
  artifacts:
    paths:
      - node_modules/
  script:
    - yarn

build:
  stage: build-and-test
  script:
    - echo "Nothing to build or test"

storybook:
  stage: build-and-test
  artifacts:
    expire_in: 2 weeks
    when: always
    paths:
      - storybook-static/
  script:
    - yarn build-storybook

deploy-storybook:
  stage: deployment
  script:
    - echo "This job configures an environment."
  environment:
    name: storybook/$CI_COMMIT_REF_SLUG
    url: $PAGES_URL
    on_stop: remove-storybook
  only:
    - branches

remove-storybook:
  stage: deployment
  cache:
    key: 'sp-storybook'
    paths:
      - public
  script:
    - rm -rf "public/$CI_COMMIT_REF_SLUG/storybook"
  when: manual
  variables:
    GIT_STRATEGY: none # needed to prevent "Couldn't find remote ref" error
  environment:
    name: storybook/$CI_COMMIT_REF_SLUG
    action: stop

pages:
  stage: pages
  cache:
    key: 'sp-storybook'
    paths:
      - public
  script:
    - if [ "$CI_COMMIT_REF_NAME" = "master" ]; then
      mkdir -p public;
      touch public/index.html;
      echo "<!DOCTYPE HTML><script>window.location.href = '$PAGES_MAIN_URL'</script>" > public/index.html;
      fi;
    - rm -rf "public/$CI_COMMIT_REF_SLUG"
    - mkdir -p "public/$CI_COMMIT_REF_SLUG";
    - mv storybook-static "public/$CI_COMMIT_REF_SLUG"
  artifacts:
    paths:
      - public
```

Go to Gitlab > your project > CI/CD > Pipelines to monitor the build. The is a YAML linter there to help verify your pipeline file.

The Pages setting are at Gitlab > your project > Settings > Pages.

My page is https://jameskolean.gitlab.io/storybook-pages
