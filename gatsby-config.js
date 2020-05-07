/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */
const path = require(`path`)
const { createProxyMiddleware } = require('http-proxy-middleware')

var netlifyCmsPaths = {
  resolve: `gatsby-plugin-netlify-cms-paths`,
  options: {
    cmsConfig: `/static/admin/config.yml`,
  },
}

module.exports = {
  /* Your site config here */
  siteMetadata: {
    title: `Dev Notes from James Kolean`,
    description: `Development notes by James Kolean`,
    siteUrl: `https://jameskolean.tech/`,
    home: {
      title: `My Dev Notes`,
      description: `A place to organize and share my software development interests.`,
    },
  },
  plugins: [
    netlifyCmsPaths,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `assets`,
        path: `${__dirname}/static/assets`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `markdown-pages`,
        path: `${__dirname}/_data`,
      },
    },
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          netlifyCmsPaths,
          {
            resolve: 'gatsby-remark-code-buttons',
            options: {
              tooltipText: `Copy Code to Clipboard`,
              toasterText: 'Copied to Clipboard',
            },
          },
          `gatsby-remark-images`,
          'gatsby-remark-emojis',
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              classPrefix: 'language-',
              inlineCodeMarker: null,
              aliases: {},
              showLineNumbers: false,
              noInlineHighlight: true,
            },
          },
        ],
      },
    },
    `gatsby-plugin-sass`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-netlify-cms`,
    'gatsby-plugin-robots-txt',
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Dev Notes`,
        short_name: `Dev Notes`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#a4de02`,
        display: `standalone`,
        icon: `src/images/icon.png`,
      },
    },
    {
      resolve: `gatsby-plugin-offline`,
      options: {
        precachePages: [`/todos/`, `/posts/`, `/posts/*`],
      },
    },
  ],
  developMiddleware: (app) => {
    app.use(
      '/.netlify/functions/',
      createProxyMiddleware({
        target: 'http://localhost:9000',
        pathRewrite: { '/.netlify/functions/': '' },
      })
    )
  },
}
