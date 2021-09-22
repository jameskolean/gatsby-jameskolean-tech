---
template: BlogPost
date: 2021-09-22
published: true
title: 'Try Serverless'
source: 'https://gitlab.com/jameskolean/try-serverless'
tags:
  - AWS
  - Serverless
  - JavaScript
thumbnail: /assets/beach-chair-unsplash.jpg
---

# Let's Try Serverless

This is going to be really quick and intended to refresh my memory later.

## Install

```bash
npm install -g serverless
➜  serverless

 What do you want to make? AWS - Node.js - Starter
 What do you want to call this project? try-serverless

Downloading "aws-node" template...

Project successfully created in try-serverless folder

 What org do you want to add this service to? [Skip]

 Do you want to deploy your project? No

Your project is ready for deployment and available in ./try-serverless

  Run serverless deploy in the project directory
    Deploy your newly created service

  Run serverless info in the project directory after deployment
    View your endpoints and services

  Run serverless invoke and serverless logs in the project directory after deployment
    Invoke your functions directly and view the logs

  Run serverless in the project directory
    Add metrics, alerts, and a log explorer, by enabling the dashboard functionality
```

Let's see if it will run locally.

```bash
cd try-serverless
serverless invoke local --function hello

{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Go Serverless v2.0! Your function executed successfully!\",\n  \"input\": \"\"\n}"
}
```

## AWS Setup

You need set up some config files next .

- .aws/config

https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-region.html

and

- .aws/credentials

https://www.serverless.com/framework/docs/providers/aws/cli-reference/config-credentials

Now let's see if it will run on AWS.

```bash
serverless deploy
serverless invoke --function hello

{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Go Serverless v2.0! Your function executed successfully!\",\n  \"input\": {}\n}"
}
```

Go to the AWS CloudFormation tab to see your Serverless app.

Teardown with `serverless remove`

# Add a Queue

Started by editing the serverless.yml

Swing wide open the permission doors for SQS. Please don't do this in production!

```yaml
provider:
  name: aws
  runtime: nodejs14.x
  lambdaHashingVersion: 20201221
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - sqs:*
          Resource: '*'
```

Create a Queue with a Dead Letter Queue attached.

```yaml
resources:
  Resources:
    myDLQ:
      Type: AWS::SQS::Queue
      Properties:
        QueueName: myDLQ
        MessageRetentionPeriod: 1209600 # 14 days in seconds
    myQueue:
      Type: AWS::SQS::Queue
      Properties:
        QueueName: myQueue
        VisibilityTimeout: 270 # should be atleast 6x the lamdba timeout (45 * 6 = 270)
        MessageRetentionPeriod: 1209600 # 14 days in seconds
        RedrivePolicy:
          maxReceiveCount: 3 # three failures and send to the Dead Letter Queue
          deadLetterTargetArn:
            Fn::GetAtt:
              - myDLQ
              - Arn
```

You need to run `serverless deploy` and get the URL of MyQueue from AWS. Then update handler.js like this. Don't forget to paste in your URL. The URL should come from serverless as an Environmental Variable.

```javascript
'use strict'
const AWS = require('aws-sdk')
const sqs = new AWS.SQS({ region: 'us-east-1' })

module.exports.hello = async (event) => {
  await sqs
    .sendMessage({
      MessageAttributes: {
        Title: {
          DataType: 'String',
          StringValue: `Try Serverless`,
        },
      },
      MessageBody: `${event}`,
      QueueUrl: '<YOUR QUEUE URL>',
    })
    .promise()

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'You successfully called the function.',
        input: event,
      },
      null,
      2
    ),
  }
}
```

Redeploy and run the function.

```shell
serverless deploy
serverless invoke --function hello --data 'Hello from Serverless'
```

Confirm the message is in the Queue (probably the Dead Letter Queue)
