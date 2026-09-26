"use client";
import gsap from "gsap";
import { useEffect } from "react";


const HeroStructure = () => {
  const HeroTitle = ["M", "e", "r", "i", "d", "i", "a", "n"];

  useEffect(()=>{
    const HomeHeroTL = gsap.timeline();

    HomeHeroTL.to('.HeroTextTitle',{
        translateY:'0%',
        stagger:0.05,
        duration:1,
        ease:'power2.inOut'
    })
    HomeHeroTL.to('.HeroBackground',{
        opacity:0,
        duration:1,
        ease:'power1.in'
    })

  },[])

  return (
    <div className="w-full h-svh overflow-hidden relative px-2 py-2 ">
      {/* Image Div */}
      <div className="CONTAINER w-full h-full z-40 HeroBackground  BgPrimary">
        <img
          src="/images/home/HeroBg.jpg"
          alt="HeroBackgroundImage"
          className="w-full h-full object-cover object-center opacity-0"
        />
      </div>

      {/* Gradient */}
      <div className=" w-full h-[40vh] bottom-0 left-0 absolute z-50  overflow-hidden ">
        <img
          src="/images/common/TranspToBlack.png"
          alt="Gradient"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Text-Container */}
      <div className="w-full h-full absolute overflow-hidden top-0 left-0 z-55 flex justify-center items-end">
        <div className="w-full h-fit flex  translate-y-[5vw] px-10 overflow-hidden">
          {HeroTitle.map((item, index) => {
            return (
              <div key={index} className=" w-fit h-fit">
                <h1 className="FontN HeroTextTitle uppercase flex translate-y-full text-white">{item}</h1>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HeroStructure;
