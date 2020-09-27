/* eslint jsx-a11y/label-has-associated-control: 0 */
import React, { useState } from 'react'
import styled from '@emotion/styled'
import Layout from '../components/layout'
import Gauge from '../components/gauge'

const AboutMePage = () => {
  const GaugeSection = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    justify-content: space-between;
  `
  return (
    <Layout>
      <GaugeSection>
        <Gauge label='Architect' percentage='75' />
        <Gauge label='Leadership' percentage='90' />
        <Gauge label='Java' percentage='90' />
        <Gauge label='JAM Stack' percentage='75' />
        <Gauge label='Cloud' percentage='75' />
      </GaugeSection>
    </Layout>
  )
}

export default AboutMePage
