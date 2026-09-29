"use client";
import BlankScreen from "../common/BlankScreen";
import AboutDisplaySection from "./AboutDisplaySection";
import ProductGalleryView from "./ProductGalleryView";
import StickyWraperAnimation from "./StickyWraperAnimation";

const WrapperAnimation = () => {
  return (
    <div className="w-full flex flex-col relative">
      <StickyWraperAnimation />
      <AboutDisplaySection />
      <BlankScreen />
      <ProductGalleryView />
    </div>
  );
};

export default WrapperAnimation;
