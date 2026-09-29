"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { RiFullscreenFill, RiFullscreenExitFill } from "react-icons/ri";
import { color } from "three/tsl";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ImgArr = [
  { image: "/images/home/PImg1.jpg", title: "Project 01" },
  { image: "/images/home/PImg2.jpg", title: "Project 02" },
  { image: "/images/home/PImg3.jpg", title: "Project 03" },
  { image: "/images/home/PImg4.jpg", title: "Project 04" },
  { image: "/images/home/PImg5.jpg", title: "Project 05" },
  { image: "/images/home/PImg6.jpg", title: "Project 06" },
  { image: "/images/home/PImg7.jpg", title: "Project 07" },
  { image: "/images/home/PImg8.jpg", title: "Project 08" },
];

const ProductGalleryView = () => {
  const scrollContDiv = useRef(null);
  const contentContainerWrap = useRef(null);
  const lenisRef = useRef(null);

  const progressTextRef = useRef(null);
  const progressCircleRef = useRef(null);

  const itemRefs = useRef([]);
  const [expandData, setExpandData] = useState(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      const wrap = contentContainerWrap.current;

      const getScrollAmount = () => {
        const scrollWidth = wrap.scrollWidth;
        const viewportWidth = window.innerWidth;
        return -(scrollWidth - viewportWidth);
      };

      // Horizontal Scroll Animation
      gsap.to(wrap, {
        x: getScrollAmount,
        ease: "none",
        scrollTrigger: {
          trigger: scrollContDiv.current,
          start: "top -50%",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      // Animate Main Text In when Section Displays
      gsap.fromTo(
        ".animate-text",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: scrollContDiv.current,
            start: "top 60%", // Triggers when top of section hits 60% of viewport
          },
        }
      );

      // Scroll Progress Indicator
      ScrollTrigger.create({
        trigger: scrollContDiv.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const progress = self.progress;
          const percentage = Math.round(progress * 100);

          if (progressTextRef.current) {
            progressTextRef.current.innerText = `${percentage}%`;
          }

          if (progressCircleRef.current) {
            const circumference = 2 * Math.PI * 26;
            const offset = circumference - progress * circumference;
            progressCircleRef.current.style.strokeDashoffset = offset;
          }
        },
      });
    }, scrollContDiv);

    return () => {
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  const handleOpen = (index, item) => {
    const el = itemRefs.current[index];
    const rect = el.getBoundingClientRect();

    lenisRef.current?.stop();
    document.body.style.overflow = "hidden";

    // Hide Text Smoothly when expanding
    if (scrollContDiv.current) {
      gsap.to(scrollContDiv.current.querySelectorAll(".animate-text"), {
        opacity: 0,
        y: -20,
        duration: 0.5,
        ease: "power2.inOut",
      });
    }

    setExpandData({
      item,
      index,
      rect,
      isExpanded: false,
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setExpandData((prev) => ({ ...prev, isExpanded: true }));
      });
    });
  };

  const handleClose = () => {
    const el = itemRefs.current[expandData.index];
    const currentRect = el.getBoundingClientRect();

    // Show Text Smoothly when exiting expand
    if (scrollContDiv.current) {
      gsap.to(scrollContDiv.current.querySelectorAll(".animate-text"), {
        opacity: 1,
        y: 0,
        duration: 0.5,
        delay: 0.3,
        ease: "power2.out",
      });
    }

    setExpandData((prev) => ({
      ...prev,
      rect: currentRect,
      isExpanded: false,
    }));

    setTimeout(() => {
      setExpandData(null);
      lenisRef.current?.start();
      document.body.style.overflow = "auto";
    }, 700);
  };

  const PGTL = gsap.timeline({
    scrollTrigger: {
      trigger: ".BlankScreenWall",
      start: "bottom 0%",
      end: "bottom 0% ",
      scrub: true,
    },
  });

  useEffect(() => {
    PGTL.to(
      ".BLACKPRODUCTDIV",
      {
        opacity: 0,
        ease: "none",
      },
      "PGLR1"
    );

    PGTL.to(
      "body",
      {
        backgroundColor: "#CECECE",
        ease: "none",
      },
      "PGLR1"
    );
  }, []);

  return (
    <>
      <div ref={scrollContDiv} className="w-full h-[700svh] relative ">
        <div className="w-full h-svh overflow-hidden flex items-center sticky top-0 left-0 ">
          {/* BLACKPRODUCTDIV */}
          <div className="absolute top-0 left-0 w-full h-full BgPrimary z-99 BLACKPRODUCTDIV pointer-events-none" />

          <div
            ref={contentContainerWrap}
            className="w-fit flex items-center h-fit gap-10 max-sm:px-[25vw] sm:px-[40vw] will-change-transform"
          >
            {ImgArr.map((item, index) => {
              return (
                <div
                  key={index}
                  className="group w-fit h-fit flex flex-col relative"
                >
                  <div className="w-full h-fit absolute pointer-events-none top-[-8%] opacity-0 transition-all duration-500 ease-out group-hover:opacity-100">
                    <h2 className="uppercase tracking-tighter text-black">
                      {item.title}
                    </h2>
                  </div>

                  {/* Added CONTAINER class back so useContainerTracker picks it up */}
                  <div
                    ref={(el) => (itemRefs.current[index] = el)}
                    onClick={() => handleOpen(index, item)}
                    className="CONTAINER img-wrapper w-[180px] group-hover:w-[300px] relative transition-all duration-500 ease-out cursor-pointer shrink-0 aspect-[4/5] overflow-hidden"
                  >
                    {/* Added opacity-0 so the WebGL mesh shows through */}
                    <img
                      src={item.image}
                      alt="IMG"
                      className="w-full h-full object-cover object-center pointer-events-none opacity-0"
                    />
                    <div className="w-[40px] h-[40px] flex justify-center items-center opacity-0 text-black text-[1.2rem] hover:scale-[1.1] transition-all duration-500 ease-out group-hover:opacity-100 backdrop-blur-[2px] rounded-full bg-white/90 absolute bottom-5 left-5 z-[10]">
                      <RiFullscreenFill />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BOTTOM TEXTER */}
          <div className="animate-text opacity-0 w-full h-fit absolute bottom-0 -z-10 left-0 pb-[8vh]">
            <div className="w-1/5 mx-auto">
              <p className="text-black!  tracking-tighter">
                Studio Meridian has approached every project as a conversation —
                between site and structure, client and craft, restraint and
                ambition.
              </p>
            </div>
          </div>

          {/* TOP TEXTER */}
          <div className="animate-text opacity-0 w-full h-fit absolute top-0 -z-10 left-0 pt-10 px-10">
            <h5 className="FontPSB uppercase tracking-tight">
              A glimpse into <br />
              the spaces we've shaped.
            </h5>
          </div>
        </div>
      </div>

      {/* Expanding Overlay */}
      {expandData && (
        <>
          <div
            className={`fixed inset-0 z-[40] transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              expandData.isExpanded ? "opacity-100" : "opacity-0"
            }`}
          />

          <div
            className="CONTAINER fixed z-[50] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              top: expandData.isExpanded ? 0 : expandData.rect.top,
              left: expandData.isExpanded ? 0 : expandData.rect.left,
              width: expandData.isExpanded ? "100vw" : expandData.rect.width,
              height: expandData.isExpanded ? "100vh" : expandData.rect.height,
            }}
          >
            <img
              src={expandData.item.image}
              alt="Full Screen"
              className="w-full h-full object-cover object-center opacity-0"
            />
          </div>

          <button
            onClick={handleClose}
            className={`fixed top-8 left-8 w-[50px] h-[50px] rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center text-white text-3xl hover:bg-white/30 hover:scale-110 transition-all duration-500 cursor-pointer z-[60] ${
              expandData.isExpanded ? "opacity-100 delay-300" : "opacity-0"
            }`}
          >
            <RiFullscreenExitFill className="text-black scale-[0.8]" />
          </button>
        </>
      )}
    </>
  );
};

export default ProductGalleryView;