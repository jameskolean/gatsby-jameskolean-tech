import React from 'react'
import { StaticQuery, graphql } from 'gatsby'

import BackgroundImage from 'gatsby-background-image'

const HeroHeader = () => (
  <StaticQuery
    query={graphql`
      query HeadingQuery {
        site {
          siteMetadata {
            home {
              title
              description
            }
          }
        }
        markdownRemark(fields: { slug: { eq: "/pages/index/" } }) {
          frontmatter {
            heroBackground {
              childImageSharp {
                fluid(maxWidth: 960) {
                  ...GatsbyImageSharpFluid
                }
              }
            }
          }
        }
      }
    `}
    render={(data) => {
      const backgroundImage =
        data.markdownRemark.frontmatter.heroBackground.childImageSharp.fluid

      return (
        <BackgroundImage
          Tag='section'
          className='hero-header-background'
          fluid={backgroundImage}
        >
          <div className='hero-header'>
            <div className='headline'>{data.site.siteMetadata.home.title}</div>
            <div className='primary-content'>
              <h4>{data.site.siteMetadata.home.description}</h4>
            </div>
          </div>
        </BackgroundImage>
      )
    }}
  />
)
export default HeroHeader
