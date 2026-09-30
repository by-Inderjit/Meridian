"use client";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { useEffect } from "react";
gsap.registerPlugin(ScrollTrigger);

const StickyWraperAnimation = () => {
  useEffect(() => {
    // Function to calculate the precise viewport coordinates of the box 
    // exactly when the ScrollTrigger timeline activates.
    const getStartPosition = (axis) => {
      const box = document.getElementById("hilite-box");
      const trigger = document.querySelector(".BlankScreenWall");

      if (!box || !trigger) return 0;

      const boxRect = box.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();

      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;

      // Absolute positions on the page
      const boxAbsoluteTop = boxRect.top + scrollY;
      const boxAbsoluteLeft = boxRect.left + scrollX;
      const triggerAbsoluteTop = triggerRect.top + scrollY;

      // The ScrollTrigger starts at "top 100%" (trigger hits bottom of viewport)
      const startScrollY = triggerAbsoluteTop - window.innerHeight;

      // Return coordinate relative to the viewport at the scroll-start position
      if (axis === "y") return boxAbsoluteTop - startScrollY;
      if (axis === "x") return boxAbsoluteLeft - scrollX;
    };

    const getBoxSize = (prop) => {
      const box = document.getElementById("hilite-box");
      if (!box) return 20; // Fallback size
      return prop === "width" ? box.offsetWidth : box.offsetHeight;
    };

    const SWTL = gsap.timeline({
      scrollTrigger: {
        trigger: ".BlankScreenWall",
        start: "top 100%",
        end: "bottom 0%",
        scrub: true,
        invalidateOnRefresh: true, // Crucial: recalculates function values dynamically on resize/refresh
      },
    });

    // Label "a1": Set starting position based on HiliteBOX, animate rotation/border
    SWTL.fromTo(
      ".ScreenBall",
      {
        x: () => getStartPosition("x"),
        y: () => getStartPosition("y"),
        width: () => getBoxSize("width"),
        height: () => getBoxSize("height"),
        borderRadius: "50%", // assuming it starts round
      },
      {
        rotation: 360,
        borderRadius: 0,
        ease: "none",
      },
      "a1"
    );

    // Label "a2": Move to top-left (0,0) and expand to cover the screen
    SWTL.to(
      ".ScreenBall",
      {
        x: 0,
        y: 0,
        width: "100vw",
        height: "100vh",
        scale: 1.2,
        ease: "none",
      },
      "a2"
    );

    // Fade out at the end
    gsap.to(".ScreenBall", {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".BlankScreenWall",
        start: "bottom 0%",
        end: "bottom -10%",
        scrub: true,
      },
    });

    return () => {
      SWTL.kill();
      // Safe cleanup of ScrollTriggers to prevent React strict-mode/HMR dupes
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="sticky top-0 z-50 h-0 w-full pointer-events-none ">
      <div className="w-full h-screen relative overflow-hidden">
        {/* Screen Cover */}
        {/* Removed translation/centering classes so GSAP can precisely position it via 'absolute top-0 left-0' */}
        <div className="ScreenBall bg-[#CECECE] absolute top-0 left-0"></div>
      </div>
    </div>
  );
};

export default StickyWraperAnimation;