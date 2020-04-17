import React from 'react'
import Helmet from 'react-helmet'
import { graphql } from 'gatsby'
import Layout from '../components/layout'
import PostCards from '../components/post-card'

const PostsPage = ({
  data: {
    site,
    allMarkdownRemark: { nodes: posts },
  },
}) => {
  return (
    <Layout>
      <Helmet>
        <title>{site.siteMetadata.title}</title>
        <meta name='description' content={site.siteMetadata.description} />
        <html lang='en' />
      </Helmet>
      <h2>Posts</h2>
      <div className='grids'>
        <PostCards posts={posts} />
      </div>
    </Layout>
  )
}

export default PostsPage
export const pageQuery = graphql`
  query blogsPageQuery {
    site {
      siteMetadata {
        title
        description
      }
    }
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      filter: { frontmatter: { template: { eq: "BlogPost" } } }
    ) {
      nodes {
        id
        excerpt(pruneLength: 250)
        fields {
          slug
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          thumbnail {
            childImageSharp {
              fluid(maxWidth: 780) {
                ...GatsbyImageSharpFluid
              }
            }
          }
        }
      }
    }
  }
`
