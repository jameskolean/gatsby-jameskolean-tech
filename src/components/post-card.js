import React from 'react'
import { Link } from 'gatsby'
import Img from 'gatsby-image'

const PostCards = ({ posts }) => {
  const postCards = posts
    .filter((post) => !!post.frontmatter.date)
    .map((post) => <PostCard key={post.id} post={post} />)
  return <>{postCards}</>
}

export const PostCard = ({ post }) => (
  <article className='card '>
    <Link to={post.fields.slug}>
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
      <div className='post-meta'>{post.frontmatter.date}</div>
      <div className='post-excerpt'>{post.excerpt}</div>
    </header>
  </article>
)
export default PostCards
