import React from 'react'
import Helmet from 'react-helmet'
import { graphql } from 'gatsby'
import Layout from '../components/layout'

const SourceLink = ({ source }) => (
  <>
    {source && (
      <div className='post-source'>
        <a href={source} target='_blank' rel='noopener noreferrer'>
          Link to Source Code Repository &rarr;
        </a>
      </div>
    )}
  </>
)

export default function Template({
  data, // this prop will be injected by the GraphQL query below.
}) {
  const { markdownRemark } = data // data.markdownRemark holds your post data
  const { frontmatter, html } = markdownRemark
  return (
    <Layout>
      <Helmet>
        <title>{frontmatter.title}</title>
        {/* <meta name="description" content={frontmatter.metaDescription} /> */}
        <html lang='en' />
      </Helmet>
      <div className='blog-post-container'>
        <article className='post'>
          {!frontmatter.thumbnail && (
            <div className='post-thumbnail'>
              <h1 className='post-title'>{frontmatter.title}</h1>
              <div className='post-meta'>{frontmatter.date}</div>
              <SourceLink source={frontmatter.source} />
            </div>
          )}
          {!!frontmatter.thumbnail && (
            <div
              className='post-thumbnail'
              style={{
                backgroundImage: `url(${frontmatter.thumbnail.childImageSharp.fixed.src})`,
              }}
            >
              <h1 className='post-title'>{frontmatter.title}</h1>
              <div className='post-meta'>{frontmatter.date}</div>
              <SourceLink source={frontmatter.source} />
            </div>
          )}
          <div
            className='blog-post-content'
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </div>
    </Layout>
  )
}

export const pageQuery = graphql`
  query($path: String!) {
    markdownRemark(fields: { slug: { eq: $path } }) {
      html
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        title
        source
        thumbnail {
          childImageSharp {
            fixed(width: 980) {
              src
            }
          }
        }
      }
    }
  }
`
