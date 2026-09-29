"use client";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { useEffect } from "react";
gsap.registerPlugin(ScrollTrigger);

const StickyWraperAnimation = () => {
  const SWTL = gsap.timeline({
    scrollTrigger: {
      trigger: ".BlankScreenWall",
      start: "top 100%",
      end: "bottom 0% ",
      scrub: true,
    },
  });

  useEffect(() => {
    SWTL.to(
      ".ScreenBall",
      {
        rotation: 360,
        ease: "none",
      },
      "a1",
    );
    SWTL.to(
      ".ScreenBall",
      {
        scale: 2,
      },
      "a1",
    );
    SWTL.to(
      ".ScreenBall",
      {
        borderRadius: 0,
      },
      "a1",
    );
    SWTL.to(
      ".ScreenBall",
      {
        width: "100vw",
        height: "100vh",
        ease: "none",
      },
      "a2",
    );
    SWTL.to(
      ".ScreenBall",
      {
        scale: 1.2,
      },
      "a2",
    );

    gsap.to(".ScreenBall", {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".BlankScreenWall",
        start: "bottom 0%",
        end: "bottom -10% ",
        scrub: true,
      },
    });
  }, []);

  return (
    <div className="sticky top-0 z-50 h-0 w-full pointer-events-none ">
      <div className="w-full h-screen flex items-center justify-center relative overflow-hidden">
        {/* Screen Cover */}
        <div className="w-1.5 h-1.5 ScreenBall bg-[#CECECE] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 "></div>
      </div>
    </div>
  );
};

export default StickyWraperAnimation;
