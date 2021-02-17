---
template: BlogPost
date: 2021-02-02
published: true
title: 'AWS S3 + DynamoDB + API Gateway + Lambda'
source: 'https://gitlab.com/jameskolean/james-upload-download-s3'
tags:
  - AWS
  - NodeJS
  - JavaScript
thumbnail: /assets/powerlines-unsplash.jpg
---

Today I want to look at a way to interact with S3 securely and at scale. I want to run everything locally if possible to make it faster to develop. I also want to keep information on files I have Uploaded/Downloaded, and I'll use DynamoDB for this.

# DynamoDB

Let's start with DynamoDB. There is a docker image we can use to run DynamoDB locally. Just running the image is not enough since we will be using AWS SAM to run the API Gateway and Lambda Functions later, and this runs in its own Docker container. To make this happen, we need to do networking in docker.

```shell
docker network create --driver bridge lambda-local
```

Great, now we have a network that DynamoDB and SAM can communicate over. We can now start DynamoDB.

```shell
docker run  -p 8000:8000 --network lambda-local --name dynamodb amazon/dynamodb-local
```

Now Let's add a table.

```shell
aws dynamodb create-table \
    --table-name Upload \
    --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=fileName,AttributeType=S \
    --key-schema AttributeName=userId,KeyType=HASH AttributeName=fileName,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
    --endpoint-url http://localhost:8000 \
    --global-secondary-indexes '[ { "IndexName": "fileNameIndex", "KeySchema": [{"AttributeName":"fileName","KeyType":"HASH"}], "ProvisionedThroughput": {"ReadCapacityUnits": 10, "WriteCapacityUnits": 5 }, "Projection": { "ProjectionType":"ALL" } } ]'
```

We just created a table called `Upload` that has a primary key of UserId / FileName. This pair uniquely identifies a document. We can also easily select all the documents associated with a user using the `userId` partition key. We also add a secondary index on just the `fileName` to lookup files directly.

# SAM CLI

We need to install the `sam cli` following [these instructions](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-getting-started.html). Follow the [tutorial here](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-getting-started-hello-world.html) to set up an application to start testing. We can start 'sam' like this, notice we are using the network that DynamoDB is on.

```shell
sam local start-api --docker-network lambda-local
```

# API Gateway

In `template.yaml` is where we define API endpoints and Lambda Functions. Let's add an endpoint to generate a Presigned Upload Url. Using Presigned URLs has several advantages over uploading through the API, including scaling, simplicity, and minimizes API Gateway data transfer charges. We can add a new endpoint like this.

> template.yaml

```yaml
CreateDownloadUrlFunction:
  Type: AWS::Serverless::Function
  Properties:
    CodeUri: hello-world/
    Handler: createDownloadUrl.lambdaHandler
    Runtime: nodejs12.x
    Events:
      HelloWorld:
        Type: Api
        Properties:
          Path: /create-download-url
          Method: post
```

Now add the Lambda Function to handle the endpoint requests

> createUploadUrl.js

```javascript
require('dotenv').config()
const AWS = require('aws-sdk')
const { v4: uuid } = require('uuid')
const { region, bucket, endpoint, signatureVersion } = require('./awsConfig')
const accessKeyId = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_KEY
const userId = 'User123'

let response

AWS.config.update({ region, signatureVersion })
const s3 = new AWS.S3({
  accessKeyId,
  secretAccessKey,
})

const getSingedUrlforPut = async (bucket, key) => {
  const params = {
    Bucket: bucket,
    Key: key,
    Expires: 60 * 5,
    Metadata: { 'Cache-Control': 'no-store, max-age=0' },
  }
  try {
    return await new Promise((resolve, reject) => {
      s3.getSignedUrl('putObject', params, (err, url) => {
        err ? reject(err) : resolve(url)
      })
    })
  } catch (err) {
    if (err) {
      console.log(err)
    }
  }
}

exports.lambdaHandler = async (event, context) => {
  const config = {
    region: region,
    endpoint: 'http://dynamodb:8000',
  }

  const docClient = new AWS.DynamoDB.DocumentClient(config)
  const table = 'Upload'
  const fileName = `${userId}/${uuid()}.pdf`

  const url = await getSingedUrlforPut(bucket, fileName)

  const params = {
    TableName: table,
    Item: {
      fileName: fileName,
      userId: userId,
      downloadStatus: 'upload-link-created',
    },
  }
  const r = await docClient.put(params).promise()

  try {
    response = {
      statusCode: 200,
      body: JSON.stringify({
        URL: url,
      }),
    }
  } catch (err) {
    console.log(err)
  }
  return response
}
```

In this function, we create a signed upload URL and then make an entry in DynamoDB to record the fact.

But wait, we are not using a local S3 bucket, so we need to create one in the AWS Management Console. Go ahead and do that now. Don't forget the Permissions 'Bucket Policy' and 'CORS.'

That should do it.

Getting a Download Presigned URL is more of the same. I have examples in the referenced GitLab repository.

# Run it

Restart the API like this.

```shell
sam local start-api --docker-network lambda-local
```

I created a simple REACT app using Material-UI to test the upload. The basics of the page include the following.

```javascript
...
  const fetchUploadUrl = async () => {
    return await fetch('http://localhost:3000/create-upload-url', {
    method: 'GET',
    headers: {
       'Content-Type': 'application/json',
    }
  })
    .then((response) => {
      return response.json()
    })
  }


  const handleFileUpload = async (event) => {
    const file = selectedFile.file
    const {URL: url} = await fetchUploadUrl()
      const formData = new FormData();
      formData.append("file", file);
      await fetch(url, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/pdf',
        },
        body: formData
      }).then((response) => {
        refreshUploadsList()
        console.log('response',response)
      })
  }

  return (
    <Box>
        <Input type='file' onChange={onFileChange} />
        </Box>
        <Box>
        <Button variant="contained" color="primary" onClick={handleFileUpload}>Upload!</Button>
      </Box>
  )
...
```

You might get complaints about CORS if you don't add this stanza to 'template.yaml.'

```yaml
Globals:
  Function:
    Timeout: 10
  Api:
    Cors:
      AllowHeaders: "'Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization'"
      AllowOrigin: "'*'"
      AllowMethods: "'*'"
```
