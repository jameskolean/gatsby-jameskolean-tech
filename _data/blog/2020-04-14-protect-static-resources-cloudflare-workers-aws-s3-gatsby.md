---
template: BlogPost
date: 2020-04-08T12:36:44.093Z
title: Protect Static Resources => Cloudflare Workers + AWS S3 + Gatsby
thumbnail: /assets/cloud-sunray-unsplash.jpg
---
## Setup Cloudflare

The way Cloudflare works is that it manages an entire domain. For this test you may want to purchase a domain. Once the domain is purchased, the process of bring it into Cloudflare is very simple but will take time for the DNS records to propagate so let’s do this first. Just log into Cloudflare and click ‘Add Site’ giving it you new domain. Cloudflare makes it super simple (unlike other vendors, I’m talking to you AWS), just follow the instruction.

Source:<https://gitlab.com/jameskolean/gatsby-cloudflare-gated>

## Create a Gatsby starter app.

If you have not installed the Gatsby CLI, nows the time.

```shell
npm install -g gatsby-cli
```

Now let’s use it to create our starter app.

```shell
gatsby new gatsby-cloudflare-gated https://github.com/gatsbyjs/gatsby-starter-default

```

Let’s test our new application.

```shell
cd gatsby-netlify-function
gatsby develop
```

Open a browser to **[http://localhost:8000](http://localhost:8000/)**

Let’s do some customization setting things up for our test. First edit /src/pages/index.js

```javascript
import React from "react"
import { Link } from "gatsby"
 
import Layout from "../components/layout"
import SEO from "../components/seo"
 
const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <h1>Protecting Static Content</h1>
    <Link to="/public-page/">Public Page</Link>
    <br />
    <Link to="/protected-page/">Protected Page</Link>
  </Layout>
)
 
export default IndexPage
```

Add a page /src/pages/public-page.js

```javascript
import React from "react"
import { Link } from "gatsby"
 
import Layout from "../components/layout"
import SEO from "../components/seo"
 
const PublicPage = () => (
  <Layout>
    <SEO title="Public Page" />
    <h1>Hi from the public page</h1>
    <p>Welcome to public page</p>
    <Link to="/">Go back to the homepage</Link>
  </Layout>
)
 
export default PublicPage
```

Add a page /src/pages/protected-page.js

```javascript
import React from "react"
import { Link } from "gatsby"
 
import Layout from "../components/layout"
import SEO from "../components/seo"
 
const ProtectedPage = () => (
  <Layout>
    <SEO title="Protected Page" />
    <h1>Hi from the protected page</h1>
    <p>Welcome to protected page</p>
    <Link to="/">Go back to the homepage</Link>
  </Layout>
)
 
export default ProtectedPage
```

Go ahead and test out the pages before we try to publish to S3.

## Publish on AWS S3

We need credentials to access the S3 bucket so go back to Services in the AWS management console and search for IAM. In the menu choose ‘Users’ then click ‘Add User’. Choose a names and select programmatic access type. Create a permission group and search for S3 and add AmazonS3FullAccess. When finished save the Access Key Id and Secret Access Key for use later. Make sure the User is assign the group we just created with full access to S3.\
\
We could manually build and push the built Gatsby site but let’s use a plugin. Install the plugin

```shell
npm install gatsby-plugin-s3 gatsby-plugin-config dotenv
```

Now configure it in**/gatsby-config.js**

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

Next add a script to deploy in package.json

```javascript
"scripts": {
    ...
    "deploy": "npx -n \"-r dotenv/config\" gatsby-plugin-s3 deploy"
}
```

Create a new file called **/.env** and add your values. Note that your bucket name must be the subdomain you will be using for the site. Example: sample.mydomain.com. Where mydomain.com is the domain that Cloudflare is controlling.

```properties
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret
```

We can now build and deploy.

```shell
gatsby build
npm run deploy
```

If everything is successful, the URL to your new site will be printed in the console. It should look like **[http://your-bucket.s3-website-us-east-1.amazonaws.com](http://your-bucket.s3-website-us-east-1.amazonaws.com/)**

## Cloudflare

Add a CNAME DNS record to get our Site running on your domain. 

Open your Site in Cloudflare and go to the DNS tab. Click Add Record, choose the Type of CNAME. The Name will be the subdomain so if you set your bucket name to sample.mydomain.com you would enter ‘sample’ as the Name. Set Target to the S3 bucket domain. It should look like this ‘your-bucket.s3-website-us-east-1.amazonaws.com. You can now view your site at: **[https://sample.mydomain.com](https://sample.mydomain.com/)**

## Cloudflare Workers

Wow, that was a ton of setup, but we are finally ready to look at Cloudflare Workers. Log into Cloudflare, select your site, and open the Workers tab. Click ‘Manage Workers’ then click Create a Worker. A development environment will open where you can test out your workers. The default worker returns ‘hello world.’ We want a worker that protects a route. We will use a simplistic example that always protects a route. In a real application, we might test if a JWT is present, is valid, and includes the proper roles. That is beyond the scope of this test, so change the worker code to this.

```javascript
/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request) {
  return new Response('you are not authorized', {status: 401})
}
```

Test the worker with the ‘Send’ button. When you are happy click ‘Save and Deploy’. At this point, you might want to rename the Worker to better track them. The last step is to associate the Worker with a route. Click ‘Add route’ to open a screen where you can associate a route.

Let’s test our Worker by entering the URL to the protected. You should get a 401 Unauthorized response, Great! Now enter the Home Page URL and navigate to the protected page. What happened? It allowed you to access the protected page. We can fix this. The issue is that in a Gatsby static site, only loads the initial fetch from Cloudflare. Gatsby then rehydrates into a REACT application making the site extremely fast. Let’s fix this by changing /src/pages/index.js to use plain old html links instead to Gatsby Links forcing the page to load from Cloudflare.

```javascript
import React from "react"
 
import Layout from "../components/layout"
import SEO from "../components/seo"
 
const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <h1>Protecting Static Content</h1>
    <a href="/public-page/">Public Page</a>
    <br />
    <a href="/protected-page/">Protected Page</a>
  </Layout>
)
 
export default IndexPage
```

Build and deploy the application again.

```shell
gatsby build
npm run deploy

```

Success!
