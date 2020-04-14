import React from 'react'
import Helmet from 'react-helmet'
import { graphql } from 'gatsby'
import Layout from '../components/layout'
import HeroHeader from '../components/hero-header'

const TodosPage = ({ data: { site } }) => {
  return (
    <Layout>
      <Helmet>
        <title>{site.siteMetadata.title}</title>
        <meta name='description' content={site.siteMetadata.description} />
      </Helmet>
      <HeroHeader />
      <h2>TODOs</h2>
      <p>Things I want to look at when i get a chance</p>
    </Layout>
  )
}

export default TodosPage
export const pageQuery = graphql`
  query todosPageQuery {
    site {
      siteMetadata {
        title
        description
      }
    }
  }
`
