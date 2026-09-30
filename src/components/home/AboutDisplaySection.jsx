import React from "react";

const AboutDisplaySection = () => {
  return (
    <div className="w-full h-fit flex px-10 pb-10 gap-5">
      {/* Left */}
      <div className="w-1/2 h-fit">
        <div className="CONTAINER w-full aspect-square ">
          <img
            src="/images/home/HeroAboutLeft.jpg"
            alt="HeroAboutLeft"
            className="w-full h-full object-cover object-center opacity-0"
          />
        </div>
      </div>
      {/* Right */}
      <div className="w-1/2 h-fit">
        {/* Img */}
        <div className="CONTAINER w-[50%] aspect-square mb-5 ">
          <img
            src="/images/home/HeroAboutRight.jpg"
            alt="HeroAboutRight"
            className="w-full h-full object-cover object-center opacity-0"
          />
        </div>

        {/* Bottom-title */}
        <p className=" capitalize FontPL mb-5 ">
          Studio Meridian is a boutique architecture practice designing homes,
          workplaces, and public spaces shaped by light, material, and the
          people who use them.
        </p>

        {/* HiliteBOX - Added ID to target this position */}
        <div className="w-full h-fit flex justify-start items-center gap-2">

        <div 
          id="hilite-box" 
          className="w-[20px] h-[20px] flex items-center justify-center "
          >
        </div>

        {/* Button */}
        <div className="w-fit h-fit bg-[#CECECE] px-8 py-2 cursor-pointer">
         <p className="FontPR text-black!">
           Learn More
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AboutDisplaySection;