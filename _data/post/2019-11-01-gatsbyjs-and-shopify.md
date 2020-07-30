---
template: BlogPost
date: 2019-11-01
title: GatsbyJS and Shopify
tags:
  - Gatsby
  - E-Commerce
thumbnail: /assets/shop-open-unsplash.jpg
published: true
---

I started to look into building a POC integrating Shopify with GatsbyJS but I found an excellent starter already exists. Here are the instructions to run the demo.

If you don’t have the gatsby-cli installed, now is the time. Follow instructions at <https://www.gatsbyjs.org/tutorial/part-zero/>

Now you can run the demo:

```bash
gatsby new gatsby-shopify-starter https://github.com/AlexanderProd/gatsby-shopify-starter
cd gatsby-shopify-starter
gatsby develop
```

Open a browser to [http://localhost:8000](http://localhost:8000/) to see the demo.

The demo leans on a plugin called gatsby-source-shopify to get the product information from Shopify API. See gatsby-config.js for the plugin setup, gatsby-node.js for the product page generation setup, and src/templates/ProductPage/index.js for the product template.

The User, Cart and Checkout interaction is defined in src/providers/ContextProvider.js using the shopify-buy package.
