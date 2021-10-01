---
template: BlogPost
date: 2021-10-01
published: true
title: 'More Serverless'
source: 'https://gitlab.com/jameskolean/serverles-api'
tags:
  - AWS
  - Serverless
  - JavaScript
thumbnail: /assets/cloud-rays-unsplash.jpg
---

# More Serverless

In the post let's look at more complex example than the previous post.

In this example let's create a stack like this:

API Gateway --> Lambda --> SQS --> Lambda --> Dynamo DB

# Install

```bash
➜ npm update -g serverless
➜ serverless config --autoupdate

➜ serverless

 What do you want to make? AWS - Node.js - HTTP API
 What do you want to call this project? serverless-api

Downloading "aws-node-http-api" template...

Project successfully created in serverless-api folder

 What org do you want to add this service to? jameskolean
 What application do you want to add this to? [create a new app]
 What do you want to name this application? serverless-api

Your project has been setup with org jameskolean and app serverless-api

 Do you want to deploy your project? No

Your project is ready for deployment and available in ./serverless-api

 Run serverless deploy in the project directory
  Deploy your newly created service

 Run serverless info in the project directory after deployment
  View your endpoints and services

 Open Serverless Dashboard after deployment
  Invoke your functions and view logs in the dashboard
```

To emulate API Gateway and Lambda locally, use the `serverless-offline` plugin.

```bash
serverless plugin install -n serverless-offline
```

It will add the `serverless-offline` plugin to `devDependencies` in `package.json` file as well as will add it to `plugins` in `serverless.yml`.

After installation, you can start local emulation with:

```bash
serverless offline
```

To learn more about the capabilities of `serverless-offline`, please refer to its [GitHub repository](https://github.com/dherault/serverless-offline).

# Add Lambdas

Delete handler.js and add logApiHandler.js. These Lambdas are attached to the API Gateway.

```javascript
// logApiHandler.js
const AWS = require('aws-sdk')

const sqs = new AWS.SQS({ region: 'us-east-1' })
const ddb = new AWS.DynamoDB({ region: 'us-east-1', apiVersion: '2012-08-10' })

exports.get = async (event) => {
  var params = {
    ExpressionAttributeValues: {
      ':appId': { S: 'sweet-app' },
      ':eventDateTime': { S: '2021-10-01T01:00:00.000Z' },
    },
    KeyConditionExpression: 'appId = :appId and eventDateTime > :eventDateTime',
    ProjectionExpression: 'appId, eventDateTime, message',
    TableName: 'Logs',
  }
  const data = await ddb.query(params).promise()

  console.log('data', data)
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v2.0! Your GET executed successfully!',
      log: data.Items,
    }),
  }
}

exports.post = async (event) => {
  await sqs
    .sendMessage({
      MessageAttributes: {
        Title: {
          DataType: 'String',
          StringValue: `Sample Serverless`,
        },
      },
      MessageBody: event.body,
      QueueUrl: process.env.SA_LOG_QUEUE_URL,
    })
    .promise()
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Your data was added to Queue ${process.env.SA_LOG_QUEUE_URL}`,
      data: event.body,
    }),
  }
}
```

Now add the Lambda we will attach to SQS. This Lambda will insert log messaged into DynamoDB.

```javascript
// logApiHandler.js
const AWS = require('aws-sdk')

const sqs = new AWS.SQS({ region: 'us-east-1' })
const ddb = new AWS.DynamoDB({ region: 'us-east-1', apiVersion: '2012-08-10' })

exports.get = async (event) => {
  var params = {
    ExpressionAttributeValues: {
      ':appId': { S: 'sweet-app' },
      ':eventDateTime': { S: '2021-10-01T01:00:00.000Z' },
    },
    KeyConditionExpression: 'appId = :appId and eventDateTime > :eventDateTime',
    ProjectionExpression: 'appId, eventDateTime, message',
    TableName: 'Logs',
  }
  const data = await ddb.query(params).promise()

  console.log('data', data)
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v2.0! Your GET executed successfully!',
      log: data.Items,
    }),
  }
}

exports.post = async (event) => {
  await sqs
    .sendMessage({
      MessageAttributes: {
        Title: {
          DataType: 'String',
          StringValue: `Sample Serverless`,
        },
      },
      MessageBody: event.body,
      QueueUrl: process.env.SA_LOG_QUEUE_URL,
    })
    .promise()
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Your data was added to Queue ${process.env.SA_LOG_QUEUE_URL}`,
      data: event.body,
    }),
  }
}
```

# Define the Stack in `Serverless.yml`

Replace the contents of `Serverless.yml` with the following.

```yaml
org: jameskolean
app: serverless-api
service: serverless-api
frameworkVersion: '2'

provider:
  name: aws
  runtime: nodejs14.x
  lambdaHashingVersion: '20201221'
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - sqs:*
            - dynamodb:*
          Resource: '*'
  environment:
    SA_LOG_QUEUE_URL: !Ref SaLogQueue

functions:
  # REST API definition
  getLog:
    handler: logApiHandler.get
    events:
      - httpApi:
          path: /log
          method: get
  addLog:
    handler: logApiHandler.post
    events:
      - httpApi:
          path: /log
          method: post
  saLogHandler:
    handler: logQueueHandler.handle
    events:
      - sqs:
          batchSize: 1
          arn:
            Fn::GetAtt:
              - SaLogQueue
              - Arn

resources:
  # Create our resources with separate CloudFormation templates
  Resources:
    SaLogDlq:
      Type: AWS::SQS::Queue
      Properties:
        QueueName: SaLogDlq
        MessageRetentionPeriod: 1209600 # 14 days in seconds
    SaLogQueue:
      Type: AWS::SQS::Queue
      Properties:
        QueueName: SaLogQueue
        VisibilityTimeout: 270 # should be atleast 6x the lamdba timeout (45 * 6 = 270)
        MessageRetentionPeriod: 1209600 # 14 days in seconds
        RedrivePolicy:
          maxReceiveCount: 3 # three failures and send to the Dead Letter Queue
          deadLetterTargetArn:
            Fn::GetAtt:
              - SaLogDlq
              - Arn
    LogTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: Logs
        AttributeDefinitions:
          - AttributeName: appId
            AttributeType: S
          - AttributeName: eventDateTime
            AttributeType: S
        KeySchema:
          - AttributeName: appId
            KeyType: HASH
          - AttributeName: eventDateTime
            KeyType: RANGE
        # Set the capacity to auto-scale
        BillingMode: PAY_PER_REQUEST

plugins:
  - serverless-offline
  - serverless-cloudside-plugin
```

The file `Serverless.yml` defines the entire stack. Here is a quick overview of the sections.

### provider

In this section, we create an IAM role. NOTE: in production, you want to be more specific when adding `Actions.` We also export an Environmental Variable for use in a Lambda.

### functions

In this section, we wire Lambda functions to the API Gateway and SQS. The actual Lambda functions are in `logApiHandler.js` and `logQueueHandler.js.`

### resources

In this section, we create a Queue with a Dead Letter Queue according to best practices. We also create a table in DynamoDB to store our log messages.

# Run It

Deploy the stack like this.

```bash
sls deploy
```

Clean up after yourself like this.

```bash
sls remove
```

- GET to https://<AWS Gateway host>/log to get a list of log messages.
- POST to https://<AWS Gateway host>/log to add a log message.
