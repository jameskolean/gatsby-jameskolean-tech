import React from 'react'
import '../styles/gauge.scss'
const Gauge = ({ label, percentage, size }) => {
  const gaugePercentOverrideStyle = {
    strokeDashoffset: 440 - (440 * (percentage ? percentage : 0)) / 100,
  }
  const gaugeSizeOverrideStyle = {
    width: `${size ? size : 150}px`,
    height: `${size ? size : 150}px`,
  }

  return (
    <div className='gauge'>
      <div className='scale'>
        <svg>
          <circle cx='70' cy='70' r='70' />
          <circle cx='70' cy='70' r='70' style={gaugePercentOverrideStyle} />
        </svg>
        <div className='needle'>
          <h2>
            {percentage}
            <span>%</span>
          </h2>
        </div>
        <h2 className='text'> {label}</h2>
      </div>
    </div>
  )
}
export default Gauge
