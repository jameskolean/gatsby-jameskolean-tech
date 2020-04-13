import React from 'react'
import { Link } from 'gatsby'
import Img from 'gatsby-image'

const PostCard = ({ post }) => (
  <article className='card '>
    <Link to={post.frontmatter.path}>
      {!!post.frontmatter.thumbnail && (
        <Img
          fluid={post.frontmatter.thumbnail.childImageSharp.fluid}
          alt={post.frontmatter.title + '- Featured Shot'}
        />
      )}
    </Link>
    <header>
      <h2 className='post-title'>
        <Link to={post.fields.slug} className='post-link'>
          {post.frontmatter.title}
        </Link>
      </h2>
      <div class='post-meta'>{post.frontmatter.date}</div>
      <div class='post-excerpt'>{post.excerpt}</div>
    </header>
  </article>
)
export default PostCard
