import React from 'react'
import Helmet from 'react-helmet'
import { graphql, Link } from 'gatsby'
import styled from '@emotion/styled'

import Layout from '../components/layout'
import HeroHeader from '../components/hero-header'
import PostCards from '../components/post-card'
import CtaCard from '../components/cta-card'

const IndexPage = ({
  data: {
    page,
    site,
    allMarkdownRemark: { nodes: posts },
  },
}) => {
  const CtaSection = styled.div`
    display: flex;
    justify-content: center;
    justify-content: space-between;
  `
  const LatestPostSection = styled.div`
    margin-top: 4rem;
  `
  return (
    <Layout>
      <Helmet>
        <title>{site.siteMetadata.title}</title>
        <meta name='description' content={site.siteMetadata.description} />
        <html lang='en' />
      </Helmet>
      <HeroHeader />
      <CtaSection style={{ gap: 10 }}>
        <CtaCard
          title='What is here?'
          buttonLabel='see all posts'
          buttonUrl='/posts'
          image='82TpEld0_e4'
        >
          <p>This is where I keep my prototypes.</p>
          <p>This is where I keep my project templates.</p>
          <p>This is where I keep posts I want to reffer back to.</p>
        </CtaCard>
        <CtaCard
          title='Who is James?'
          buttonLabel='My resume (sort of)'
          buttonUrl='/about-me'
          image='8JFMYz-a8Xo'
        >
          <p>He is an Architect</p>
          <p>He is a Team Lead</p>
          <p>He is a Full Stack Developer</p>
          <p>He is a Husband</p>
          <p>He is a Father</p>
        </CtaCard>
        <CtaCard
          title='Can I help you?'
          buttonLabel='contact me.'
          buttonUrl='/contact-me'
          image='fb7yNPbT0l8'
        >
          <p>Do you have question about my articles?</p>
          <p>Can I help you build software?</p>
          <p>Drop me a note.</p>
        </CtaCard>
      </CtaSection>
      <LatestPostSection>
        <h2>Latest Posts</h2>
        <div className='three-grids'>
          <PostCards posts={posts} />
        </div>
        <div className='more-posts'>
          <Link className='button -primary' to='/posts'>
            All Posts
          </Link>
        </div>
      </LatestPostSection>
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
