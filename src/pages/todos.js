import React from 'react'
import Helmet from 'react-helmet'
import { graphql } from 'gatsby'
import Layout from '../components/layout'

const TodosPage = ({
  data: {
    site,
    markdownRemark: {
      frontmatter: { todos },
    },
  },
}) => {
  const Todos = todos.map((todo) => (
    <div className='todo' key={todo.name}>
      <div className='todo-name'>&#x21aa;{todo.name}</div>
      <div className='todo-description'>{todo.description}</div>
    </div>
  ))
  return (
    <Layout>
      <Helmet>
        <title>{site.siteMetadata.title}</title>
        <meta name='description' content={site.siteMetadata.description} />
        <html lang='en' />
      </Helmet>
      <h3>Things I want to look at when i get a chance...</h3>
      {Todos}
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
    markdownRemark(fields: { slug: { eq: "/pages/todo/todo/" } }) {
      frontmatter {
        todos {
          description
          name
        }
      }
    }
  }
`
