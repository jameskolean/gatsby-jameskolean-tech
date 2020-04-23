import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'gatsby'
import Img from 'gatsby-image'

const PostCards = ({ posts }) => {
  const postCards = posts
    .filter((post) => !!post.frontmatter.date)
    .map((post) => <PostCard key={post.id} post={post} />)
  return <>{postCards}</>
}

export const PostCard = ({ post }) => (
  <motion.article
    className='card '
    whileHover={{
      translateX: -4,
      translateY: -4,
    }}
    layoutId={post.fields.slug}
  >
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
      <div className='post-meta'>
        {post.frontmatter.tags && `Tags: ${post.frontmatter.tags.join(', ')}`}
      </div>
    </header>
  </motion.article>
)
export default PostCards
