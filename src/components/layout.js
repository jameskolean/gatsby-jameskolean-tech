import React from 'react'
import { Link, useStaticQuery, graphql } from 'gatsby'
import CookieConsent from 'react-cookie-consent'
import Navigation from '../components/navigation'
import Footer from '../components/footer'
import 'prismjs/themes/prism-okaidia.css'

export default ({ children }) => {
  const data = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `
  )
  return (
    <div className='site-wrapper'>
      <header className='site-header'>
        <div className='site-title'>
          <Link to='/'>{data.site.siteMetadata.title}</Link>
        </div>
        <Navigation />
      </header>
      {children}
      <Footer />
      <CookieConsent>
        This website uses cookies to enhance the user experience.
      </CookieConsent>
    </div>
  )
}
