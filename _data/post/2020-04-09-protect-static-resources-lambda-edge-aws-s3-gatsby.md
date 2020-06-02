---
template: BlogPost
date: 2020-04-09T18:35:03.465Z
title: Protect Static Resources => Lambda@Edge + AWS S3 + Gatsby
thumbnail: /assets/cloud-sunray-unsplash.jpg
tags:
  - AWS
  - React
  - Gatsby
source: https://gitlab.com/jameskolean/gatsby-cloudflare-gated
published: true
---

Source:[https://gitlab.com/jameskolean/gatsby-lambda-edge](https://gitlab.com/jameskolean/gatsby-cloudflare-gated)

## Create a Gatsby starter app.

If you have not installed the Gatsby CLI, nows the time

```powershell
npm install -g gatsby-cli
```

Now let’s use it to create our starter app.

```bash
gatsby new gatsby-lambda-edge-gated https://github.com/gatsbyjs/gatsby-starter-default
```

Let’s test our new application.

```bash
cd gatsby-lambda-edge-gated
gatsby develop
```

Open a browser to**[http://localhost:8000](http://localhost:8000/)**

Let’s do some customization setting things up for our test. First edit /src/pages/index.js

```javascript
import React from 'react'
import { Link } from 'gatsby'

import Layout from '../components/layout'
import SEO from '../components/seo'

const IndexPage = () => (
  <Layout>
    <SEO title='Home' />
    <h1>Protecting Static Content</h1>
    <Link to='/public-page/'>Public Page</Link>
    <br />
    <Link to='/protected-page/'>Protected Page</Link>
  </Layout>
)

export default IndexPage
```

Add a page /src/pages/public-page.js

```javascript
import React from 'react'
import { Link } from 'gatsby'

import Layout from '../components/layout'
import SEO from '../components/seo'

const PublicPage = () => (
  <Layout>
    <SEO title='Public Page' />
    <h1>Hi from the public page</h1>
    <p>Welcome to public page</p>
    <Link to='/'>Go back to the homepage</Link>
  </Layout>
)

export default PublicPage
```

Add a page /src/pages/protected-page.js

```javascript
import React from 'react'
import { Link } from 'gatsby'

import Layout from '../components/layout'
import SEO from '../components/seo'

const ProtectedPage = () => (
  <Layout>
    <SEO title='Protected Page' />
    <h1>Hi from the protected page</h1>
    <p>Welcome to protected page</p>
    <Link to='/'>Go back to the homepage</Link>
  </Layout>
)

export default ProtectedPage
```

Go ahead and test out the pages before we try to publish to S3.

## Publish on AWS S3

We need credentials to access the S3 bucket so go back to Services in the AWS management console and search for IAM. In the menu choose ‘Users’ then click ‘Add User’. Choose a names and select programmatic access type. Create a permission group and search for S3 and add AmazonS3FullAccess. When finished save the Access Key Id and Secret Access Key for use later. Make sure the User is assign the group we just created with full access to S3.\
\
We could manually build and push the built Gatsby site but let’s use a plugin. Install the plugin.

```bash
npm install gatsby-plugin-s3 gatsby-plugin-config dotenv
```

Now configure it in **/gatsby-config.js**

```javascript
require("dotenv").config()
...
plugins: [
  {
    resolve: "gatsby-plugin-s3",
    options: {
      bucketName: process.env.AWS_S3_BUCKET_NAME,
    },
  },
...
]
...
```

Next add a script to deploy in package.json.

```javascript
"scripts": {
    ...
    "deploy": "npx -n \"-r dotenv/config\" gatsby-plugin-s3 deploy"
}
```

Create a new file called **/.env** and add your values. Note that your bucket name must be the subdomain we will be using for the site. Example: sample.mydomain.com. Where mydomain.com is the domain that Cloudflare is controlling.

```properties
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret
```

We can now build and deploy.

```bash
gatsby build
npm run deploy
```

If everything is successful, the URL to your new site will be printed in the console. It should look like **[http://your-bucket.s3-website-us-east-1.amazonaws.com](http://your-bucket.s3-website-us-east-1.amazonaws.com/)**

## CloudFront setup

Go to the AWS Console, choose the services tab, and search for CloudFront. Click ‘Create Distribution, then ‘Get Started’ under Web. In Origin Domain Name and Origin ID enter the domain of the S3 static site. This is displayed in the console when you ran **npm run deploy**. Make sure this is just the domain name. Remove the ['http://](http://%26/#8217)' and any trailing ‘/’, and it should look like **your-bucket-name.s3-website-us-east-1.amazonaws.com**. Accept the rest of the default settings and wait a few minutes for the deployment, then open a browser to the Domain Name listed in the CloudFront Distributions page.

## Lambda@Edge

Go to the AWS Console, choose the services tab, and search for Lambda.\
Click ‘Create Function,’ choose ‘Author from scratch,’ choose a function name, and create the function. In the code editor, copy in the following and save it.

```javascript
exports.handler = function(event, context, callback) {
  const request = event.Records[0].cf.request
  var noCacheHeaders = {
    'cache-control': [
      {
        key: 'Cache-Control',
        value: 'no-cache',
      },
    ],
    pragma: [
      {
        key: 'Pragma',
        value: 'no-cache',
      },
    ],
    'content-type': [
      {
        key: 'Content-Type',
        value: 'text/html',
      },
    ],
  }
  if (request.uri.startsWith('/protected-page') === true) {
    console.log('protected area')
    const response = {
      status: '401',
      statusDescription: 'OK',
      headers: noCacheHeaders,
      body: '',
      bodyEncoding: 'base64',
    }
    callback(null, response)
    return
  }
  callback(null, request)
  return
}
```

Under Actions, select ‘Deploy to Lambda@Edge.’ Set CloudFront event to ‘Viewer Request,’ acknowledge the action and Deploy the Lambda.

Let’s test our Lambda by entering the URL to the protected page. You should get a 401 Unauthorized response, Great! Now enter the Home Page URL and navigate to the protected page. What happened? It allowed you to access the protected page? We can fix this. The issue is that in a Gatsby static site, only the initial page load is fetched from Cloudflare. Gatsby then rehydrates a REACT application making the site extremely fast. Let’s fix this by changing /src/pages/index.js to use plain old html links instead to Gatsby Links forcing the page to load from Cloudflare.

```javascript
import React from 'react'

import Layout from '../components/layout'
import SEO from '../components/seo'

const IndexPage = () => (
  <Layout>
    <SEO title='Home' />
    <h1>Protecting Static Content</h1>
    <a href='/public-page/'>Public Page</a>
    <br />
    <a href='/protected-page/'>Protected Page</a>
  </Layout>
)

export default IndexPage
```

Build and deploy the application again.

```bash
gatsby build
npm run deploy
```

Success!
