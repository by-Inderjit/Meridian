"use client";

import { useEffect, useState, useRef } from 'react';

export const useContainerTracker = () => {
  const [containers, setContainers] = useState([]);
  // We use a ref to keep track of previous positions without triggering re-renders
  const prevDataRef = useRef(new Map());

  useEffect(() => {
    let ticking = false; // Prevents overlapping animation frames

    const calculatePositions = () => {
      // Find all divs with the specific class
      const elements = document.querySelectorAll('.CONTAINER');
      let stateNeedsUpdate = false;
      const currentData = [];
      const newCache = new Map();

      elements.forEach((el, index) => {
        // Get dimensions and relative viewport position
        const rect = el.getBoundingClientRect();
        
        // Find the image inside this specific container
        const img = el.querySelector('img');
        const imgSrc = img ? img.src : null;

        // Create a unique ID based on the element's DOM node or index
        const id = el.id || `container-${index}`;

        const containerData = {
          id,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          x: rect.x,
          y: rect.y,
          imgSrc,
        };

        currentData.push(containerData);
        newCache.set(id, containerData);

        // Check against the cached data to see if x, y, width, or height actually changed
        const prevItem = prevDataRef.current.get(id);
        if (
          !prevItem || 
          prevItem.x !== containerData.x || 
          prevItem.y !== containerData.y ||
          prevItem.width !== containerData.width ||   // NEW: Check if width changed
          prevItem.height !== containerData.height    // NEW: Check if height changed
        ) {
          stateNeedsUpdate = true;
        }
      });

      // ONLY update the React state if an element actually moved or resized
      if (stateNeedsUpdate) {
        setContainers(currentData);
        prevDataRef.current = newCache;
      }
      
      ticking = false;
    };

    const handleUpdate = () => {
      if (!ticking) {
        // requestAnimationFrame syncs with the monitor's refresh rate
        // ensuring zero-millisecond visual delay
        window.requestAnimationFrame(calculatePositions);
        ticking = true;
      }
    };

    // Run once on mount to get initial positions
    calculatePositions();

    // Listen to both scroll and resize events
    window.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate, { passive: true });

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, []);

  return containers;
}