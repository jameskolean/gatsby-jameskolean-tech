---
template: BlogPost
date: 2021-11-11
published: true
title: 'Faster Gitlab CI/CD'
source: 'https://gitlab.com/jameskolean/faster-gitlab-cicd'
tags:
  - Gitlab
  - Dev Ops
thumbnail: /assets/gas-pipes-unsplash
---

## Fast Gitlab CI/CD

When I first tried to switch to Gitlab CI/CD, I was disappointed by the slow build times. Let's see if we can do better. Let's try building a React application.

```bash
npx create-react-app faster-gitlab-cicd
cd faster-gitlab-cicd
git remote add origin <your git repo>
git add .
git commit -m "Initial commit"
```

Now add a file `gitlab-ci.yml` and let's build it.

```yaml
# .gitlab-ci.yml
image: node:14

stages:
  - test
  - build

test:
  stage: test # This stage must run before the release stage
  script:
    - yarn
    - yarn react-scripts test --watchAll=false

build:
  stage: build # This stage must run before the release stage
  script:
    - yarn
    - yarn build
```

We are using the basic node v14 image and running the Test and Build commands on our app. It takes 3 minutes and 23 seconds to run.

Now let's make some changes. First, we will use a lighter weight image.

```yaml
image: node:14-alpine
```

Then let's create a cache for the `node_modules` folder. I think Gitlab recommends creating a new cache for each pipeline build. You would have a key like this `key: $CI_COMMIT_REF_SLUG` in this case. However, we will live on the edge and use the same cache until the lock file change.

```yaml
cache:
  key:
    files:
      - package-lock.json
      - yarn.lock
  paths:
    - node_modules/
```

Now let's add a job to populate our node_modules cache only when the lock files change.

```yaml
node-modules:
  stage: prepare
  script:
    - yarn
  only:
    changes:
      - package-lock.json
      - yarn.lock
```

With that, we can remove `yarn` from the script in the `test` and `build` jobs. It should look like this now.

```yaml
# .gitlab-ci.yml
image: node:14-alpine

stages:
  - prepare
  - test
  - build

cache:
  key:
    files:
      - package-lock.json
      - yarn.lock
  paths:
    - node_modules/

setup-node:
  stage: prepare
  script:
    - yarn
  only:
    changes:
      - package-lock.json
      - yarn.lock

test:
  stage: test # This stage must run before the release stage
  script:
    - yarn react-scripts test --watchAll=false

build:
  stage: build # This stage must run before the release stage
  script:
    - yarn build
```

Make sure that `yarn.lock` is changed, so we populate the cache. My first run, which populated the cache, took 2 minutes and 57 seconds. The second run, which uses the cache, took 1 minute and 27 seconds. That's 2 and 1/3 times faster.

Let's add some other stuff to our pipeline just for fun.

## Reusable Rules

This is a resuable rules that can come in handy in complex builds.

```yaml
.release_rule:
  - if: $CI_COMMIT_TAG
    when: never # Do not run this job when a tag is created manually
  - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH # Run this job when commits are pushed or merged to the default branch
```

Here is how you can use the rule. Granted, this is a pretty silly use case. It's just an example.

```yaml
workflow:
  rules:
    - !reference [.release_rule]
```

## Variables

We can create variables like this.

```yaml
variables:
  SAMPLE_PACKAGE: 'sample.tar.gz'
```

## Environmental Variables / Images

This example shows how you can get the version from `package.json` and pass it along to other jobs as an environmental variable.

I also show how to create some artifacts.

```yaml
prepare_release:
  image: endeveit/docker-jq
  stage: prepare
  script:
    - export VERSION=$(jq -r .version package.json)
    - echo "TAG=v${VERSION}" >> variables.env
    - echo "PACKAGE_REGISTRY_URL=${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/generic/sample/${VERSION}" >> variables.env
    - mkdir sample # create some dummy files to package
    - echo "Sample 1" > sample/sample-1.txt
    - echo "Sample 2" > sample/sample-2.txt
  artifacts:
    reports:
      dotenv: variables.env # Use artifacts:reports:dotenv to expose the variables to other jobs
    paths:
      - sample
```

## Generic Packages

This example uploads a generic package. We will use this package in the Relase job.

```yaml
upload-packages:
  stage: publish
  image: curlimages/curl:latest
  needs:
    - job: prepare_release
      artifacts: true
  script:
    - tar czvf $SAMPLE_PACKAGE sample
    - |
      curl --header "JOB-TOKEN: ${CI_JOB_TOKEN}" --upload-file $SAMPLE_PACKAGE "${PACKAGE_REGISTRY_URL}/${SAMPLE_PACKAGE}"
```

## Release

That last job will perform a release. It uses the generic package created previously. Make sure to create a dummy `CHANGELOG.md.`

```yaml
release_job:
  stage: publish
  image: registry.gitlab.com/gitlab-org/release-cli:latest
  script:
    - echo "Creating release for $TAG"
  release:
    name: 'Release $TAG'
    description: './CHANGELOG.md'
    tag_name: $TAG
    assets:
      links:
        - name: 'james digital garden'
          url: 'https://jameskolean.tech'
        - name: 'samples'
          url: '${PACKAGE_REGISTRY_URL}/${SAMPLE_PACKAGE}'
```

The complete pipeline looks like this.

```yaml
# .gitlab-ci.yml
image: node:14-alpine

stages:
  - prepare
  - test
  - build
  - publish

cache:
  key:
    files:
      - package-lock.json
      - yarn.lock
  paths:
    - node_modules/

.release_rule:
  - if: $CI_COMMIT_TAG
    when: never # Do not run this job when a tag is created manually
  - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH # Run this job when commits are pushed or merged to the default branch

workflow:
  rules:
    - !reference [.release_rule]

prepare_release:
  image: endeveit/docker-jq
  stage: prepare
  script:
    - export VERSION=$(jq -r .version package.json)
    - echo "TAG=v${VERSION}" >> variables.env
    - echo "PACKAGE_REGISTRY_URL=${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/generic/sample/${VERSION}" >> variables.env
    - mkdir sample # create some dummy files to package
    - echo "Sample 1" > sample/sample-1.txt
    - echo "Sample 2" > sample/sample-2.txt
  artifacts:
    reports:
      dotenv: variables.env # Use artifacts:reports:dotenv to expose the variables to other jobs
    paths:
      - sample

setup-node:
  stage: prepare
  script:
    - yarn
  only:
    changes:
      - package-lock.json
      - yarn.lock

test:
  stage: test # This stage must run before the release stage
  script:
    - yarn react-scripts test --watchAll=false

build:
  stage: build # This stage must run before the release stage
  script:
    - yarn build

upload-packages:
  stage: publish
  image: curlimages/curl:latest
  needs:
    - job: prepare_release
      artifacts: true
  script:
    - tar czvf $SAMPLE_PACKAGE sample
    - |
      curl --header "JOB-TOKEN: ${CI_JOB_TOKEN}" --upload-file $SAMPLE_PACKAGE "${PACKAGE_REGISTRY_URL}/${SAMPLE_PACKAGE}"

release_job:
  stage: publish
  image: registry.gitlab.com/gitlab-org/release-cli:latest
  script:
    - echo "Creating release for $TAG"
  release:
    name: 'Release $TAG'
    description: './CHANGELOG.md'
    tag_name: $TAG
    assets:
      links:
        - name: 'james digital garden'
          url: 'https://jameskolean.tech'
        - name: 'samples'
          url: '${PACKAGE_REGISTRY_URL}/${SAMPLE_PACKAGE}'
```

Check the Release in your Gitlab project under Deployments > Releases.
