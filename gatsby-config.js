/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */
const path = require(`path`)

var netlifyCmsPaths = {
  resolve: `gatsby-plugin-netlify-cms-paths`,
  options: {
    cmsConfig: `/static/admin/config.yml`
  }
}

module.exports = {
  /* Your site config here */
  siteMetadata: {
    title: `Dev Notes from James Kolean`,
    description: `Development notes by James Kolean`,
    siteUrl: `https://jameskolean.tech/`,
    home: {
      title: `My Dev Notes`,
      description: `Hi, I'm James Kolean and these are my development notes. I use them to share topics that interest me. I'm posting them here in the chance that it might help someone else.`
    }
    /* W3Layouts domain verification key for contact forms https://my.w3layouts.com/Forms/ */
  },
  plugins: [
    netlifyCmsPaths,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `assets`,
        path: `${__dirname}/static/assets`
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `markdown-pages`,
        path: `${__dirname}/_data`
      }
    },
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          netlifyCmsPaths,
          `gatsby-remark-relative-images`,
          `gatsby-remark-images`,
          'gatsby-remark-emojis',
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              classPrefix: 'language-',
              inlineCodeMarker: null,
              aliases: {},
              showLineNumbers: false,
              noInlineHighlight: false
            }
          }
        ]
      }
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        // The property ID; the tracking code won't be generated without it
        trackingId: 'UA-30027142-1',
        head: true
      }
    },
    `gatsby-plugin-sass`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-netlify-cms`
  ]
}