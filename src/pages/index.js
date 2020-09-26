import React from 'react'
import Helmet from 'react-helmet'
import { graphql, Link } from 'gatsby'
import Layout from '../components/layout'
import HeroHeader from '../components/hero-header'
import PostCards from '../components/post-card'
import Gauge from '../components/gauge'
import CtaCard from '../components/cta-card'

const IndexPage = ({
  data: {
    page,
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
      <HeroHeader />
      {/* <div
        className='blog-post-content'
        dangerouslySetInnerHTML={{ __html: page.html }}
      /> */}
      <div
        style={{
          margin: '2rem',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'center',
          justifyContent: 'space-between',
        }}
      >
        <CtaCard />
        <CtaCard />
        <CtaCard />
      </div>
      <div className={'cta'}>
        <div>
          <h1>About Me</h1>
          <div style={{ display: 'flex' }}>
            <Gauge percentage={90} label='Java' />
            <Gauge size={200} percentage={60} label='JavaScript' />
          </div>
          <div className='guage'>
            <div className='guageBody'>
              <div className='guageFill'></div>
              <div className='guageCover'>50%</div>
            </div>
          </div>
        </div>
        <div>
          <h1>Contact Me</h1>
        </div>
      </div>
      {/* <p>Check out my Posts. I hope they help someone.</p> */}
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
