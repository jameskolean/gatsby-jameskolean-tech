import React from 'react'
import Helmet from 'react-helmet'
import { graphql, Link } from 'gatsby'
import Layout from '../components/layout'
import HeroHeader from '../components/hero-header'
import PostCards from '../components/post-card'

const IndexPage = ({
  data: {
    page,
    site,
    allMarkdownRemark: { nodes: posts },
  },
}) => {
  console.log('23', page)
  return (
    <Layout>
      <Helmet>
        <title>{site.siteMetadata.title}</title>
        <meta name='description' content={site.siteMetadata.description} />
        <html lang='en' />
      </Helmet>
      <HeroHeader />
      <div
        className='blog-post-content'
        dangerouslySetInnerHTML={{ __html: page.html }}
      />

      {/* <h2>About Me</h2>
      <p>
        I'm James Kolean a full stack developer located in South East Michigan.
        Most of my work has been in SpringBoot development as an Architect, Team
        Lead, and Developer. I've used SpringBoot to build applications for many
        customers (from Fortune 500 to Startups) in many industries (from
        Banking to Fantasy Sports).
      </p>
      <p>
        Recently I have become more interested in JAMStack Architecture due to
        the frustration of writing the same boilerplate code over and over.
        JAMStack offers a way to get flexible and blazingly fast applications
        into production quickly.
      </p>
      <ul>
        <li>
          It uses technologies like GraphQL, letting API clients ask for just
          the data they need. The API designer no longer needs to be clairvoyant
          of future client needs.
        </li>
        <li>
          It uses Static Site Generators Like GatsbyJS delivering blazingly
          fast, secure, SEO compliant, and PWA enabled application
          out-of-the-box. The term 'Static Site' is a bit of a misnomer since
          the site is rehydrated into a dynamic React application.
        </li>
        <li>
          It uses Headless CMS to avoid writing the same old CRUD (Create Read
          Update Delete) application code, allowing more effort to be placed on
          the highly valuable client-specific business logic.
        </li>
      </ul> */}
      <p>Check out my Posts. I hope they help someone.</p>
      <h2>Latest Posts</h2>
      <div className='three-grids'>
        <PostCards posts={posts} />
      </div>
      <div className='more-posts'>
        <Link className='button -primary' to='/posts'>
          More Posts
        </Link>
      </div>
    </Layout>
  )
}

export default IndexPage

export const pageQuery = graphql`
  query indexPageQuery {
    site {
      siteMetadata {
        title
        description
      }
    }
    page: markdownRemark(
      frontmatter: { template: { eq: "Page" } }
      fields: { slug: { eq: "/pages/index/" } }
    ) {
      html
    }
    allMarkdownRemark(
      limit: 3
      sort: { order: DESC, fields: [frontmatter___date] }
      filter: {
        frontmatter: { template: { eq: "BlogPost" }, published: { eq: true } }
      }
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
          tags
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
