import React, { useState, useEffect } from 'react'
import Helmet from 'react-helmet'
import { graphql } from 'gatsby'
import Layout from '../components/layout'
import Likes from '../components/likes'
import '../styles/blogTemplate.scss'

const PostMeta = ({ source, tags }) => (
  <>
    <div className='post-meta'>
      {tags && <div>Tags: {tags.join(', ')}</div>}
      {source && (
        <a href={source} target='_blank' rel='noopener noreferrer'>
          Link to Source Code Repository &rarr;
        </a>
      )}
    </div>
  </>
)

export default function Template({
  data, // this prop will be injected by the GraphQL query below.
}) {
  const { markdownRemark } = data // data.markdownRemark holds your post data
  const { excerpt, frontmatter, html } = markdownRemark
  const { slug } = markdownRemark.fields
  const [rating, setRating] = useState([])
  useEffect(() => {
    fetch(`/.netlify/functions/thumbs-up?slug=${slug}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setRating({
            slug,
            likes: data.upCount,
            dislikes: data.downCount,
          })
        } else {
          setRating({ slug, likes: 0, dislikes: 0 })
        }
      })
      .catch((e) =>
        setRating({
          slug,
          likes: 0,
          dislikes: 0,
        })
      )
  }, [slug])
  const handleAddLike = (slug) => {
    fetch(`/.netlify/functions/increment-thumbs-up?slug=${slug}`)
    setRating((state) => ({ ...state, likes: state.likes + 1 }))
  }
  const handleAddDislike = (slug) => {
    fetch(`/.netlify/functions/increment-thumbs-down?slug=${slug}`)
    setRating((state) => ({ ...state, dislikes: state.dislikes + 1 }))
  }

  return (
    <Layout>
      <Helmet>
        <title>{frontmatter.title}</title>
        <meta name='description' content={excerpt} />
        <html lang='en' />
      </Helmet>
      <div className='blog-post-container'>
        <article className='post'>
          {!frontmatter.thumbnail && (
            <div className='post-thumbnail'>
              <h1 className='post-title'>{frontmatter.title}</h1>
              <div className='post-meta'>{frontmatter.date}</div>
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
            </div>
          )}
          <PostMeta source={frontmatter.source} tags={frontmatter.tags} />
          <div
            className='blog-post-content'
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </div>
      <div className='post-likes-container'>
        <hr />
        <div>
          <span>Was this article helpful?</span>
          <Likes
            slug={slug}
            rating={rating}
            handleAddLike={handleAddLike}
            handleAddDislike={handleAddDislike}
          />
        </div>
      </div>
    </Layout>
  )
}

export const pageQuery = graphql`
  query($path: String!) {
    markdownRemark(fields: { slug: { eq: $path } }) {
      html
      excerpt(pruneLength: 200)
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        title
        source
        tags
        thumbnail {
          childImageSharp {
            fixed(width: 980) {
              src
            }
          }
        }
      }
      fields {
        slug
      }
    }
  }
`
