import React from "react";

const AboutDisplaySection = () => {
  return (
    <div className="w-full h-fit flex px-10 pb-10 gap-5">
      {/* Left */}
      <div className="w-1/2 h-fit">
        <div className="CONTAINER w-full  aspect-square ">
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
        <div className="CONTAINER w-[50%] aspect-square  mb-5 ">
          <img
            src="/images/home/HeroAboutRight.jpg"
            alt="HeroAboutRight"
            className="w-full h-full object-cover object-center opacity-0"
          />
        </div>

        {/* Bottom-title */}
        <p className=" capitalize FontPL">
          Studio Meridian is a boutique architecture practice designing homes,
          workplaces, and public spaces shaped by light, material, and the
          people who use them.
        </p>
      </div>
    </div>
  );
};

export default AboutDisplaySection;
