"use client";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

const StickyWraperAnimation = () => {
  useEffect(() => {
    let isAnimating = false; // Flag to hand over control between Ticker and ScrollTrigger

    // 1. Continuously sync ScreenBall to hilite-box before the trigger hits
    const trackBox = () => {
      if (isAnimating) return; // Let ScrollTrigger handle positioning once triggered

      const box = document.getElementById("hilite-box");
      const ball = document.querySelector(".ScreenBall");

      if (box && ball) {
        const rect = box.getBoundingClientRect();
        gsap.set(ball, {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          borderRadius: "50%",
          scale: 1,
          rotation: 0,
        });
      }
    };

    // Add tracker to ticker so it updates smoothly on scroll & resize
    gsap.ticker.add(trackBox);

    // 2. Exact mathematical starting position for when the timeline triggers
    const getStartPosition = (axis) => {
      const box = document.getElementById("hilite-box");
      const trigger = document.querySelector(".BlankScreenWall");
      if (!box || !trigger) return 0;

      const boxRect = box.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;

      if (axis === "x") return boxRect.left;

      if (axis === "y") {
        const boxAbsoluteTop = boxRect.top + scrollY;
        const triggerAbsoluteTop = triggerRect.top + scrollY;
        const startScrollY = triggerAbsoluteTop - window.innerHeight;
        return boxAbsoluteTop - startScrollY;
      }
    };

    const SWTL = gsap.timeline({
      scrollTrigger: {
        trigger: ".BlankScreenWall",
        start: "top 100%",
        end: "bottom 0%",
        scrub: true,
        invalidateOnRefresh: true, // Recalculates function values dynamically on resize
        onEnter: () => { isAnimating = true; },
        onLeaveBack: () => { 
          isAnimating = false; 
          trackBox(); // Snap back exactly to hilite-box if scrolled backwards
        },
      },
    });

    // Label "a1": Set timeline starting position dynamically
    SWTL.fromTo(
      ".ScreenBall",
      {
        x: () => getStartPosition("x"),
        y: () => getStartPosition("y"),
        width: () => {
          const box = document.getElementById("hilite-box");
          return box ? box.offsetWidth : 20;
        },
        height: () => {
          const box = document.getElementById("hilite-box");
          return box ? box.offsetHeight : 20;
        },
        borderRadius: "50%", 
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
      gsap.ticker.remove(trackBox);
      SWTL.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    // Replaced 'sticky' with 'fixed top-0 left-0 w-full h-screen' 
    // This anchors it globally to the viewport so X & Y coordinates align flawlessly.
    <div className="fixed top-0 left-0 z-50 w-full h-screen pointer-events-none overflow-hidden">
      <div className="ScreenBall bg-[#CECECE] absolute top-0 left-0 origin-center"></div>
    </div>
  );
};

export default StickyWraperAnimation;