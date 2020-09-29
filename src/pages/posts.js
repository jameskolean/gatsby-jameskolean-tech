/* eslint jsx-a11y/label-has-associated-control: 0 */
import React, { useState } from 'react'
import Helmet from 'react-helmet'
import { AnimateSharedLayout } from 'framer-motion'
import { graphql } from 'gatsby'
import Select from 'react-select'
import Layout from '../components/layout'
import PostCards from '../components/post-card'

const PostsPage = ({ data: { site, allPosts, allTags } }) => {
  const posts = allPosts.nodes
  const options = allTags.nodes.map((n) => ({
    value: n.frontmatter.title,
    label: n.frontmatter.title,
  }))
  const containsAll = (array1, array2) => {
    if (array1 && array2 && array1.length > 0 && array2.length > 0) {
      return array2.every((value) => array1.includes(value))
    }
    return false
  }
  const [filtedPosts, setFiltedPosts] = useState(posts)
  const filterChanged = (e) => {
    if (!e || e.length === 0) {
      setFiltedPosts(posts)
      return
    }
    const filterTags = e.map(({ value }) => value)
    const filtered = posts.filter((post) => {
      return (
        post.frontmatter.tags && containsAll(post.frontmatter.tags, filterTags)
      )
    })
    setFiltedPosts(filtered)
  }
  return (
    <Layout>
      <Helmet>
        <title>Posts</title>
        <meta
          name='description'
          content='Posts of Prototypes, Templates, and Articles I wrote.'
        />
        <html lang='en' />
      </Helmet>
      <div className='post-filter'>
        <label htmlFor='react-select-2-input'>Tag Filter:</label>
        <div className='filter-input'>
          <Select
            options={options}
            isMulti
            name='tags'
            className='basic-multi-select'
            classNamePrefix='select'
            onChange={filterChanged}
          />
        </div>
      </div>
      <h2>Posts</h2>
      <AnimateSharedLayout type='crossfade'>
        <div className='grids'>
          <PostCards posts={filtedPosts} />
        </div>
      </AnimateSharedLayout>
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
    allTags: allMarkdownRemark(
      sort: { order: ASC, fields: [frontmatter___title] }
      filter: { frontmatter: { template: { eq: "Tag" } } }
    ) {
      nodes {
        frontmatter {
          title
        }
      }
    }
    allPosts: allMarkdownRemark(
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
              fluid(maxWidth: 330) {
                ...GatsbyImageSharpFluid
              }
            }
          }
        }
      }
    }
  }
`
