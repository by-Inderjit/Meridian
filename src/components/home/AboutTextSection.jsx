import React from 'react'

const AboutTextSection = () => {
  return (
    <div className='w-full h-fit flex px-10 pb-5 gap-5 '>
      <div className='w-1/2 h-fit flex flex-col'></div>
      <div className='w-1/2 h-fit flex flex-col ml-auto'>
      <h4 className=' WhiteText uppercase FontPSB tracking-tighter'>Architects STudios</h4>
      <p className=' capitalize FontPL'>For over eight years, Studio Meridian has approached every project as a conversation — between site and structure, client and craft, restraint and ambition. We believe good architecture doesn't announce itself. It simply feels inevitable, as though it could belong to no other place.</p>
      </div>
    </div>
  )
}

export default AboutTextSection
