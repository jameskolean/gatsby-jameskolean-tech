import React from 'react'
import { Link } from 'gatsby'

export default (props) => (
  <nav className='navigation'>
    <Link to='/'>Home</Link>
    <Link to='/posts'>Posts</Link>
    <Link to='/about-me'>About Me</Link>
    <Link to='/contact-me'>Contact Me</Link>
    <Link to='/todos'>Topics to Explore</Link>
  </nav>
)
