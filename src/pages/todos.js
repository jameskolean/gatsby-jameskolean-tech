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
  const Todos = ({ todos }) => (
    <table class='todo-table'>
      <tr>
        <th>Name</th>
        <th>Description</th>
      </tr>

      {todos.map((todo) => (
        <tr className='todo' key={todo.name}>
          <td>{todo.name}</td>
          <td>{todo.description}</td>
        </tr>
      ))}
    </table>
  )

  return (
    <Layout>
      <Helmet>
        <title>{site.siteMetadata.title}</title>
        <meta name='description' content={site.siteMetadata.description} />
        <html lang='en' />
      </Helmet>
      <h3>Things I want to look at when i get a chance...</h3>
      <Todos todos={todos} />
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
