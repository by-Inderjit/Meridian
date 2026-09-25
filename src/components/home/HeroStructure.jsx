
const HeroStructure = () => {

  return (
    <div className='w-full h-svh overflow-hidden relative px-2 py-2'>

        {/* Image Div */}
        <div className='CONTAINER w-full h-full z-40 '>
            <img src="/images/home/HeroBg.jpg" alt="HeroBackgroundImage" className='w-full h-full object-cover object-center' />
        </div>

        {/* Gradient */}
        <div className=' w-full h-[40vh] bottom-0 left-0 absolute z-50  overflow-hidden'>
            <img src="/images/common/TranspToBlack.png" alt="Gradient" className='w-full h-full object-cover object-center' />
        </div>

        {/* Text-Container */}
        <div className='w-full h-full absolute top-0 left-0 z-55 flex justify-center items-end'>
            <h1 className='FontN uppercase text-white'>Meridian</h1>
        </div>

    </div>
  )
}

export default HeroStructure
