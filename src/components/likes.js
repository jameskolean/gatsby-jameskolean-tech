import React, { useState } from 'react'
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi'

const Likes = ({ slug, rating, handleAddLike, handleAddDislike }) => {
  const [userRated, setUserRated] = useState(false)
  const handleThumbsUp = () => {
    if (userRated) return
    setUserRated(true)
    handleAddLike(slug)
  }
  const handleThumbsDown = () => {
    if (userRated) return
    setUserRated(true)
    handleAddDislike(slug)
  }
  return (
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
  )
}
export default Likes
