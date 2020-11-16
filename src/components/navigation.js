import React from 'react'
import { Link } from 'gatsby'
import styled from '@emotion/styled'

export default (props) => {
  const Navigation = styled.nav`
    margin: 0px;
    padding: 0px;
    display: flex;
    align-items: center;
    color: #381696;
    background: white;
    * {
      margin: 0px;
      padding: 0px;
      z-index: 2000;
    }
    strong {
      margin-left: 5px;
      margin-right: auto;
      font-size: 1.6rem;
    }
    .dropdown-categories,
    .dropdown-menu {
      display: flex;
      list-style: none;
      padding: 0;
      margin: 0;
    }
    li {
      padding: 10px;
      position: relative;
    }
    li:hover {
      background: #d2f2fc;
    }
    .dropdown-category .dropdown-menu {
      display: none;
      position: absolute;
      background: white;
      width: 200px;
      top: 2rem;
      right: 0;
    }
    .dropdown-category:hover .dropdown-menu {
      display: block;
    }
  `

  return (
    <Navigation>
      <ul className='dropdown-categories'>
        <li className='dropdown-category'>
          <span>Options</span>
          <ul className='dropdown-menu'>
            <li>
              <Link to='/'>Home</Link>
            </li>
            <li>
              <Link to='/posts'>Posts</Link>
            </li>
            <li>
              <Link to='/about-me'>About Me</Link>
            </li>
            <li>
              <Link to='/contact-me'>Contact Me</Link>
            </li>
            <li>
              <Link to='/todos'>Topics to Explore</Link>
            </li>
          </ul>
        </li>
      </ul>
    </Navigation>
  )
}
