/* eslint jsx-a11y/label-has-associated-control: 0 */
import React from 'react'
import styled from '@emotion/styled'
import Helmet from 'react-helmet'
import Layout from '../components/layout'
import Gauge from '../components/gauge'
import '../styles/timeline.scss'

const AboutMePage = () => {
  const GaugeSection = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    justify-content: space-around;
  `
  const Certifications = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    justify-content: space-around;
  `
  const CertImage = styled.div`
    width: 100px;
  `
  const TimelineSection = styled.div`
    margin-top: 2rem;
  `
  return (
    <Layout>
      <Helmet>
        <title>About Me</title>
        <meta name='description' content='About Me' />
        <html lang='en' />
      </Helmet>
      <GaugeSection>
        <Gauge label='Architect' percentage='75' />
        <Gauge label='Full Stack Deverloper' percentage='90' />
        <Gauge label='Leadership' percentage='90' />
        <Gauge label='Cloud' percentage='75' />
      </GaugeSection>
      <Certifications>
        <CertImage>
          <img
            src='/assets/UscSeal.jpg'
            alt='University of Southern California'
          />
        </CertImage>
        <CertImage>
          <img
            src='/assets/MichiganTech_Vertical_TwoColor.png'
            alt='Michigan Technological University'
          />
        </CertImage>
        <CertImage>
          <img
            src='/assets/AWS_Certified_Logo_SAA_294x230_Color.png'
            alt='AWS Certified'
          />
        </CertImage>
        <CertImage>
          <img
            src='/assets/SunJavaArchitect.png'
            alt='SUN Java Certified Architect'
          />
        </CertImage>
      </Certifications>
      <TimelineSection>
        <ul className='timeline'>
          <li className='timeline-item'>
            <div className='timeline-info'>
              <span>Today</span>
            </div>
            <div className='timeline-marker'></div>
            <div className='timeline-content'>
              <h3 className='timeline-title'>
                Business Development Code Green LLC
              </h3>
              <p>
                Working on proposal and proof of concepts for several clients.
              </p>
            </div>
          </li>
          <li className='timeline-item'>
            <div className='timeline-info'>
              <span>March 2020</span>
            </div>
            <div className='timeline-marker'></div>
            <div className='timeline-content'>
              <h3 className='timeline-title'>
                Guardian Industries - Code Green LLC
              </h3>
              <p>Phase 1 migration from Java Enterprise Beans to GraphQL.</p>
            </div>
          </li>
          <li className='timeline-item'>
            <div className='timeline-info'>
              <span>January 2020</span>
            </div>
            <div className='timeline-marker'></div>
            <div className='timeline-content'>
              <h3 className='timeline-title'>
                Guardian Industries - Code Green LLC
              </h3>
              <p>
                Migration of failed CMS implementation to a modern JAMstack
                architecture with Headless CMS and Static Rendering.
              </p>
            </div>
          </li>
          <li className='timeline-item'>
            <div className='timeline-info'>
              <span>August 2019</span>
            </div>
            <div className='timeline-marker'></div>
            <div className='timeline-content'>
              <h3 className='timeline-title'>
                Ally Financial - Code Green LLC
              </h3>
              <p>Microservice Team Lead.</p>
            </div>
          </li>
          <li className='timeline-item'>
            <div className='timeline-info'>
              <span>March 2019</span>
            </div>
            <div className='timeline-marker'></div>
            <div className='timeline-content'>
              <h3 className='timeline-title'>
                Guardian Industries - Code Green LLC
              </h3>
              <p>Reinvented their software delivery processes and tooling.</p>
            </div>
          </li>
          <li className='timeline-item'>
            <div className='timeline-info'>
              <span>September 2016</span>
            </div>
            <div className='timeline-marker'></div>
            <div className='timeline-content'>
              <h3 className='timeline-title'>
                Alliance Inspection Management - RIIS LLC - Code Green LLC
              </h3>
              <p>
                Built a new auditing application to drive their core business.
              </p>
            </div>
          </li>
          <li className='timeline-item'>
            <div className='timeline-info'>
              <span>August 2015</span>
            </div>
            <div className='timeline-marker'></div>
            <div className='timeline-content'>
              <h3 className='timeline-title'>Own The Play - Code Green LLC</h3>
              <p>
                Rescued the fantasy sports site. We were live in about 50 days
                while the previous offshore resources had spent an entire year
                with no go live date.
              </p>
            </div>
          </li>
          <li className='timeline-item'>
            <div className='timeline-info'>
              <span>April 2015</span>
            </div>
            <div className='timeline-marker'></div>
            <div className='timeline-content'>
              <h3 className='timeline-title'>
                Scratchwireless - Code Green LLC
              </h3>
              <p>Built the website and billing system for cellular startup.</p>
            </div>
          </li>
          <li className='timeline-item'>
            <div className='timeline-info'>
              <span>October 2014</span>
            </div>
            <div className='timeline-marker'></div>
            <div className='timeline-content'>
              <h3 className='timeline-title'>
                Fiat Chrysler Automobiles - Code Green LLC
              </h3>
              <p>Built vehicle diagnostics user interfaces in FLEX.</p>
            </div>
          </li>
          <li className='timeline-item'>
            <div className='timeline-info'>
              <span>January 2011</span>
            </div>
            <div className='timeline-marker'></div>
            <div className='timeline-content'>
              <h3 className='timeline-title'>Team Detroit - Code Green LLC</h3>
              <p>
                Jumped in at 'crunch time' lending a hand ensuring deadlines
                were met.
              </p>
            </div>
          </li>
          <li className='timeline-item'>
            <div className='timeline-info'>
              <span>July 2010</span>
            </div>
            <div className='timeline-marker'></div>
            <div className='timeline-content'>
              <h3 className='timeline-title'>
                Cengage Learning - Code Green LLC
              </h3>
              <p>Web Application development.</p>
            </div>
          </li>
          <li className='timeline-item'>
            <div className='timeline-info'>
              <span>December 2009</span>
            </div>
            <div className='timeline-marker'></div>
            <div className='timeline-content'>
              <h3 className='timeline-title'>
                Security Inspection - Code Green LLC
              </h3>
              <p>FLEX application development.</p>
            </div>
          </li>
          <li className='timeline-item'>
            <div className='timeline-info'>
              <span>August 2009</span>
            </div>
            <div className='timeline-marker'></div>
            <div className='timeline-content'>
              <h3 className='timeline-title'>Xede</h3>
              <p>
                Many project for clients such as IBM, General Motors, Detroit
                Edison, Blue Cross Blue Shield of Michigan, RL Polk, Budco, .
              </p>
            </div>
          </li>
          <li className='timeline-item'>
            <div className='timeline-info'>
              <span>June 2003</span>
            </div>
            <div className='timeline-marker'></div>
            <div className='timeline-content'>
              <h3 className='timeline-title'>Great Lakes Consulting Group</h3>
              <p>
                Many project for clients such as General Motors,
                DaimlerChrysler, Federal Mogul, IBM.
              </p>
            </div>
          </li>
          <li className='timeline-item'>
            <div className='timeline-info'>
              <span>November 2000</span>
            </div>
            <div className='timeline-marker'></div>
            <div className='timeline-content'>
              <h3 className='timeline-title'>DaimlerChrysler</h3>
            </div>
          </li>
          <li className='timeline-item'>
            <div className='timeline-info'>
              <span>October 1999</span>
            </div>
            <div className='timeline-marker'></div>
            <div className='timeline-content'>
              <h3 className='timeline-title'>Innovation Technology</h3>
            </div>
          </li>
          <li className='timeline-item'>
            <div className='timeline-info'>
              <span>April 1997</span>
            </div>
            <div className='timeline-marker'></div>
            <div className='timeline-content'>
              <h3 className='timeline-title'>Electronic Data Systems</h3>
            </div>
          </li>
          <li className='timeline-item'>
            <div className='timeline-info'>
              <span>October 1990</span>
            </div>
            <div className='timeline-marker'></div>
            <div className='timeline-content'>
              <h3 className='timeline-title'>
                Hughes Aircraft Ground Systems Group
              </h3>
            </div>
          </li>
          <li className='timeline-item'>
            <div className='timeline-info'>
              <span>May 1987</span>
            </div>
            <div className='timeline-marker'></div>
            <div className='timeline-content'>
              <h3 className='timeline-title'>Graduated USC </h3>
              <p>Masters of Science Eletrical Engineering.</p>
            </div>
          </li>
        </ul>
      </TimelineSection>
      <h2>
        <a href={`./resume/james-kolean.pdf`} download>
          Download Resume
        </a>
      </h2>
    </Layout>
  )
}

export default AboutMePage
