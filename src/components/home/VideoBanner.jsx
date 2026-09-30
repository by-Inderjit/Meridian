import React from 'react'

const VideoBanner = () => {
  return (
    <div className='VIDEOCONTAINER w-full h-svh overflow-hidden flex justify-center items-center'>
      <video 
       loop autoPlay muted
       src="/video/home/Banner.mp4" 
       className='w-full h-full object-cover object-center opacity-0'
      />
    </div>
  )
}

export default VideoBanner
