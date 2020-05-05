import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'gatsby'
import Img from 'gatsby-image'
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi'

const PostCards = ({ posts }) => {
  const [ratings, setRatings] = useState([])
  useEffect(() => {
    fetch('/.netlify/functions/all-thumbs-up')
      .then((response) => response.json())
      .then((data) => {
        const processedRatings = posts.map((post) => {
          const currRating = data.find(
            (rating) => rating.slug === post.fields.slug
          )
          if (currRating) {
            return {
              slug: post.fields.slug,
              likes: currRating.upCount,
              dislikes: currRating.downCount,
            }
          }
          return { slug: post.fields.slug, likes: 0, dislikes: 0 }
        })
        setRatings(processedRatings)
      })
  }, [posts])
  const handleAddLike = (slug) => {
    fetch(`/.netlify/functions/increment-thumbs-up?slug=${slug}`)
    setRatings(
      ratings.map((rating) => {
        if (rating.slug === slug) {
          rating.likes = rating.likes + 1
        }
        return rating
      })
    )
  }
  const handleAddDislike = (slug) => {
    fetch(`/.netlify/functions/increment-thumbs-down?slug=${slug}`)
    setRatings(
      ratings.map((rating) => {
        if (rating.slug === slug) {
          rating.dislikes = rating.dislikes + 1
        }
        return rating
      })
    )
  }

  const postCards = posts
    .filter((post) => !!post.frontmatter.date)
    .map((post) => {
      const rating = ratings.find((r) => r.slug === post.fields.slug)
      return (
        <PostCard
          key={post.id}
          post={post}
          rating={rating}
          handleAddLike={handleAddLike}
          handleAddDislike={handleAddDislike}
        />
      )
    })
  return <>{postCards}</>
}

export const PostCard = ({ post, rating, handleAddLike, handleAddDislike }) => {
  const [userRated, setUserRated] = useState(false)
  const handleThumbsUp = () => {
    if (userRated) return
    setUserRated(true)
    handleAddLike(post.fields.slug)
  }
  const handleThumbsDown = () => {
    if (userRated) return
    setUserRated(true)
    handleAddDislike(post.fields.slug)
  }

  return (
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
        <div className='post-likes'>
          <button type='button' onClick={handleThumbsUp}>
            <FiThumbsUp />
            {rating && rating.likes}
          </button>
          <button type='button' onClick={handleThumbsDown}>
            <FiThumbsDown />
            {rating && rating.dislikes}
          </button>
        </div>
        <div className='post-meta'>
          {post.frontmatter.tags && `Tags: ${post.frontmatter.tags.join(', ')}`}
        </div>
      </header>
    </motion.article>
  )
}
export default PostCards
