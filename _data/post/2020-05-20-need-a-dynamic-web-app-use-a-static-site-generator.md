---
template: BlogPost
date: 2020-05-20
published: true
title: Need a Dynamic Web App? Use a Static Site Generator.
thumbnail: /assets/sailing-medium-unsplash.jpg
---

If you need to build a Dynamic Web Application that must be performant, scale, and secure, then a Static Site Generator may be what you need.

**What sort of Web Applications are we talking about here?**

In the past couple of years, I worked on several projects that you would probably not consider for static site generation. However, all could have benefitted from the use of static site generation. Using static site generation would make the Web Apps easier to build, deploy, host, scale, and provided a better user experience.

- One project is an E-Commerce site with a dynamic shopping cart, checkout processes, and personalization.
- Another project is an Auction site with real-time interaction between Buyers and Sellers.
- Another project is a Document site with document uploading and approval workflows.

**What the heck is a Static Site Generator?**

Most Web Applications today require servers sitting around waiting for users to request a page. When a request comes in, they spring into action collecting data, building the HTML page, and return the page to the user's browser. The trouble is that if multiple users request the same page, the server does the same work over and over and over. We also need to worry about scaling, server failures, and how to deploy.

A Static Site Generator builds all the pages just once as part of the build process. The pre-built pages are hosted on a Content Delivery Network (CDN). There are no servers in this architecture, so worries over scaling and server failures vanish along with the cost of running all that infrastructure. It's so much simpler, faster, scalable, and secure.

**Hey, wait a minute, if all the pages are pre-built, how can it be dynamic?**

This is where modern javascript frameworks like ReactJS, Vue, and Angular come in along with service APIs. For example, GatsbyJS is a Static Site Generator that uses ReactJS to build the static pages and deliver React Components to the browser for dynamic features. Developers can seamlessly combine static page generation with rich client-side components running on the browser. In fact, only the initial page request to a GatsbyJS site will use the pre-build static page. Following the initial request, GatsbyJS will 'rehydrate' itself into a dynamic React application. It's the best of both worlds, fast downloads from a CDN, no servers to maintain or scale or secure, great SEO, and beautiful user experience.

**It can't be that easy; what about payment processing or searching or personalization?**

It really is that easy. Features like Payment Processing, Searching, and Form Processing are easily implemented using Service APIs. In recent years the number and quality of service offerings have exploded. Finding a Payment Processing Service, or and Email Service, or a Search Service, or a Data Service that automatically provides an API is easy. In cases where you need a custom API, lambda functions are an obvious choice. Lambda services are now widely available and more accessible than ever. Headless CMS (Content Management Systems) are another way to provide a custom API. There are currently dozens of Headless CMS offerings to choose from, with a variety of features.

**How do I get started?**

Take a look at one of these static site generators based on your favorite javascript framework.

- If you like to use React, then look at GatsbJS.<https://www.gatsbyjs.org/>
- If you like to use Vue, then look at NuxtJS.<https://nuxtjs.org/>
- If you like to use Angular, then look at Scully.<https://github.com/scullyio/scully>
- If you don't have a favorite, then look at GatsbJS.<https://www.gatsbyjs.org/>

There is some excellent architectural information on the JAMStack site

<https://jamstack.org/>

Want help deciding if this is the right approach for your next Web Application? Contact me by email at static.sites@codegreenllc.com
