import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
//import styled from 'styled-components'

// import BackgroundImage from 'gatsby-background-image'

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
      }
    `}
    render={(data) => (
      // <BackgroundImage
      //   Tag='section'
      //   className={className}
      //   fluid={imageData}
      //   backgroundColor={`#040e18`}
      // >
      <div className='hero-header'>
        <div className='headline'>{data.site.siteMetadata.home.title}</div>
        <div className='primary-content'>
          <p>{data.site.siteMetadata.home.description}</p>
        </div>
      </div>
      // </BackgroundImage>
    )}
  />
)
// const StyledHeroHeader = styled(HeroHeader)`
//   width: 100%;
//   background-position: bottom center;
//   background-repeat: repeat-y;
//   background-size: cover;
// `
// export default StyledHeroHeader
export default HeroHeader
