---
template: BlogPost
date: 2021-02-02
published: true
title: 'AWS Lambda Layers'
source: 'https://gitlab.com/jameskolean/aws-lambda-layers'
tags:
  - AWS
  - NodeJS
  - JavaScript
thumbnail: /assets/layer-cake-unsplash.jpg
---

I need to create several Lambdas in AWS that are all similar. I want to share some code between them. I could publish an NPM module, but it would probably need to be private, so I would need to create a paid account. Let's try Lambda Layers instead. As you'll see, Layers have issues too.

# Install AWS CLI and SAM CLI

I'm using AWS CLI and SAM CLI to test locally and deploy so get those installed first.

##Install AWS CLI
Follow the directions [here](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-mac.html)

##AWS Serverless Application Model (SAM) CLI  
Follow the directions [here](https://aws.amazon.com/serverless/sam/)

The Mac install with Homebrew looks like this.

```shell
brew tap AWS/tap
brew install aws-sam-cli
```

I ran into this error

```shell
Your CLT does not support macOS 11.
It is either outdated or was modified.
Please update your CLT or delete it if no updates are available.
Update them from Software Update in System Preferences or run:
  softwareupdate --all --install --force

If that doesn't show you any updates, run:
  sudo rm -rf /Library/Developer/CommandLineTools
  sudo xcode-select --install

Alternatively, manually download them from:
  https://developer.apple.com/download/more/.
```

My fix was heavy-handed, reinstall the command line tools.

```shell
sudo rm -rf /Library/Developer/CommandLineTools
sudo xcode-select --install
```

#Create a Lambda
Cool, we can now create a Lambda. Just run `sam init` and answer the questions as follows.

```shell
> sam init
Which template source would you like to use?
        1 - AWS Quick Start Templates
        2 - Custom Template Location
Choice: 1
What package type would you like to use?
        1 - Zip (artifact is a zip uploaded to S3)
        2 - Image (artifact is an image uploaded to an ECR image repository)
Package type: 1

Which runtime would you like to use?
        1 - nodejs12.x
        2 - python3.8
        3 - ruby2.7
        4 - go1.x
        5 - java11
        6 - dotnetcore3.1
        7 - nodejs10.x
        8 - python3.7
        9 - python3.6
        10 - python2.7
        11 - ruby2.5
        12 - java8.al2
        13 - java8
        14 - dotnetcore2.1
Runtime: 1

Project name [sam-app]: sample

Cloning app templates from https://github.com/aws/aws-sam-cli-app-templates

AWS quick start application templates:
        1 - Hello World Example
        2 - Step Functions Sample App (Stock Trader)
        3 - Quick Start: From Scratch
        4 - Quick Start: Scheduled Events
        5 - Quick Start: S3
        6 - Quick Start: SNS
        7 - Quick Start: SQS
        8 - Quick Start: Web Backend
Template selection: 1

    -----------------------
    Generating application:
    -----------------------
    Name: sample
    Runtime: nodejs12.x
    Dependency Manager: npm
    Application Template: hello-world
    Output Directory: .

    Next steps can be found in the README file at ./sample/README.md
```

At this point, we can run our Lambda locally.

```shell
sam local invoke HelloWorldFunction --event events/event.json
```

#Add Layers
I want to add two layers. One simple layer with a single function to create data transport objects (model-layer) and another that simplifies data fetching from a REST API (fetch-layer). The fetch layer includes a dependency on node-fetch.

Add these directories.

![Directories](/assets/aws-lambda-layers/layer-directory.png)

Now initialize the layers

```shell
cd model-layer/node.js
npm init -y
npm install
cd ../../fetch-layer/nodejs
npm init -y
npm install -save node-fetch
npm install
cd ..
```

Now add the custom code.

> model-layer/nodejs/node_modules/messages.js

```javascript
module.exports = {
  createCharacter: (data) => {
    return {
      name: data.name,
      species: data.species,
      origin: data.gender.name,
    }
  },
}
```

> fetch-layer/nodejs/node_modules/fetcher.js

```javascript
const nodeFetch = require('node-fetch')

module.exports = async (url) => {
  const res = await nodeFetch(url)
  const json = await res.json()
  return json
}
```

The next step is to change the configuration to use our new layers. The HelloWorldFunction now has a Layers property. Those layers have their resource definitions added.

> template.yaml

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: >
  adapter-example

  Sample SAM Template for adapter-example

# More info about Globals: https://github.com/awslabs/serverless-application-model/blob/master/docs/globals.rst
Globals:
  Function:
    Timeout: 3

Resources:
  HelloWorldFunction:
    Type: AWS::Serverless::Function # More info about Function Resource: https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
    Properties:
      CodeUri: hello-world/
      Handler: app.lambdaHandler
      Layers:
        - !Ref FetchLayer
        - !Ref ModelLayer
      Runtime: nodejs12.x
      Events:
        HelloWorld:
          Type: Api # More info about API Event Source: https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#api
          Properties:
            Path: /hello
            Method: get
  FetchLayer:
    Type: AWS::Serverless::LayerVersion
    Properties:
      LayerName: fetch-layer
      Description: Dependencies and middlewares for sam app
      ContentUri: fetch-layer/
      CompatibleRuntimes:
        - nodejs12.x
  ModelLayer:
    Type: AWS::Serverless::LayerVersion
    Properties:
      LayerName: model-layer
      Description: Dependencies and middlewares for sam app
      ContentUri: model-layer/
      CompatibleRuntimes:
        - nodejs12.x
Outputs:
  # ServerlessRestApi is an implicit API created out of Events key under Serverless::Function
  # Find out more about other implicit resources you can reference within SAM
  # https://github.com/awslabs/serverless-application-model/blob/master/docs/internals/generated_resources.rst#api
  HelloWorldApi:
    Description: 'API Gateway endpoint URL for Prod stage for Hello World function'
    Value: !Sub 'https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/hello/'
  HelloWorldFunction:
    Description: 'Hello World Lambda Function ARN'
    Value: !GetAtt HelloWorldFunction.Arn
  HelloWorldFunctionIamRole:
    Description: 'Implicit IAM Role created for Hello World function'
    Value: !GetAtt HelloWorldFunctionRole.Arn
```

Great, now let's edit the HelloWorldFunction to do something with our new layers. Let's change the function, making a call to a public API and then transforming the results. It looks like this.

> hello-world/app.js

```javascript
const fetcher = require('fetcher')
const { createCharacter } = require('messages')

let response
exports.lambdaHandler = async (event, context) => {
  try {
    const json = await fetcher(
      'https://rickandmortyapi.com/api/character/?page=1'
    )
    const characters = json.results.map((c) => createCharacter(c))
    response = {
      statusCode: 200,
      body: JSON.stringify(characters),
    }
  } catch (err) {
    console.log(err)
    return err
  }
  return response
}
```

Now build and run it. (You may need to do a deployment the first time.)

```shell
sam build
sam local invoke HelloWorldFunction --event events/event.json
```
