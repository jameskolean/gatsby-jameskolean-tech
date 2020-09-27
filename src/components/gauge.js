import React from 'react'
import styled from '@emotion/styled'

const Gauge = ({ label, percentage }) => {
  const gaugeColor = '#00ff43'
  const gaugeBackgroundColor = '#fff'
  const gaugePrimaryTextColor = '#888'
  const gaugeHilightTextColor = '#000'

  const Gauge = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    text-align: center;
    overflow: hidden;
    transition: 0.5s;

    :hover {
      transform: translateY(-10px);
      .needle h2 {
        transform: translateY(10px);
        color: ${gaugeHilightTextColor};
        font-size: 60px;
        span {
          color: ${gaugeHilightTextColor};
          font-size: 30px;
        }
      }
      .label {
        color: ${gaugeHilightTextColor};
      }
    }
  `
  const Scale = styled.div`
    margin: 10px;
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    z-index: 1000;
  `

  const Band = styled.svg`
    position: relative;
    width: 150px;
    height: 150px;
    z-index: 1000;
    circle {
      width: 100%;
      height: 100%;
      fill: none;
      stroke: ${gaugeBackgroundColor};
      stroke-width: 10;
      stroke-linecap: round;
      transform: translate(5px, 5px);
    }
    circle:nth-child(2) {
      stroke-dasharray: 440;
      stroke-dashoffset: ${440 - (440 * (percentage ? percentage : 0)) / 100};
      stroke: ${gaugeColor};
    }
  `
  const Needle = styled.div`
    position: absolute;
    top: 3%;
    left: 0px;
    width: 100%;
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    h2 {
      color: ${gaugePrimaryTextColor};
      font-weight: 700;
      font-size: 30px;
      transition: 0.5s;
    }
  `
  const Label = styled.h2`
    position: relative;
    color: ${gaugePrimaryTextColor};
    font-weight: 700;
    font-size: 18px;
    letter-spacing: 1px;
    text-transform: uppercase;
    transition: 0.5s;
  `

  return (
    <Gauge>
      <Scale>
        <Band>
          <circle cx='70' cy='70' r='70' />
          <circle cx='70' cy='70' r='70' />
        </Band>
        <Needle className='needle'>
          <h2>
            {percentage}
            <span>%</span>
          </h2>
        </Needle>
        <Label className='label'> {label}</Label>
      </Scale>
    </Gauge>
  )
}
export default Gauge
