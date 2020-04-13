import React from 'react'
import { Link } from 'gatsby'

const PostCard = ({ post }) => (
  <article className='card '>
    <Link to={post.frontmatter.path}>
      {!!post.frontmatter.thumbnail && (
        <img
          src={post.frontmatter.thumbnail}
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
    </header>
    <blockquote class='post-excerpt'> {post.excerpt}</blockquote>
  </article>
)
export default PostCard
