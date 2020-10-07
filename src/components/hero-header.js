import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import Helmet from 'react-helmet'
import styled from '@emotion/styled'

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
      const Sunflower = styled.div`
        position: absolute;
        top: -0.5rem;
        left: 20rem;
        user-select: none;
        .sample {
          -webkit-box-flex: 1;
          -ms-flex: 1 0 100%;
          flex: 1 0 100%;
          font-size: 5em;
          line-height: 1.2;
          letter-spacing: 0.2em;
          padding: 0.2em 0;
        }
        .z-text {
          transform: rotateX(15deg) rotateY(-15deg);
          transition: transform 1s;
        }
        [data-z]:hover .z-text {
          transform: rotateX(-15deg) rotateY(15deg);
        }
        @media only screen and (max-width: 500px) {
          display: none;
        }
      `
      return (
        <BackgroundImage
          Tag='section'
          className='hero-header-background'
          fluid={backgroundImage}
        >
          <Helmet>
            <script defer src='/ztext.min.js' />
          </Helmet>
          <Sunflower>
            <span
              className='sample'
              aria-label='test'
              role='img'
              data-z
              data-z-layers='20'
              data-z-depth='10px'
            >
              🌻
            </span>
          </Sunflower>
          <div className='hero-header' style={{ height: '60px' }}>
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
