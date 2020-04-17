import React from 'react'
import { Link } from 'gatsby'

export default (props) => (
  <nav className='navigation'>
    <Link to='/'>Home</Link>
    <Link to='/blogs'>Posts</Link>
    <Link to='/todos'>Topics to Explore</Link>
  </nav>
)
