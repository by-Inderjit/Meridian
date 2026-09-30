// UseContainerTracker.jsx
"use client";

import { useEffect, useState } from 'react';

export const useVideoTracker = () => {
  const [containers, setContainers] = useState([]);

  useEffect(() => {
    let timeoutId = null;
    
    const updateContainers = () => {
      const elements = document.querySelectorAll('.VIDEOCONTAINER');
      const currentData = [];

      elements.forEach((el, index) => {
        const video = el.querySelector('video');
        const source = video ? video.querySelector('source') : null;
        
        // Pick video source from video element, child source, or custom attribute
        const videoSrc = 
          video?.src || 
          video?.currentSrc || 
          source?.src || 
          el.getAttribute('data-video-src') || 
          null;

        const posterSrc = video?.poster || el.querySelector('img')?.src || null;
        const id = el.id || `container-${index}`;

        currentData.push({
          id,
          element: el,
          videoSrc,
          posterSrc,
        });
      });

      setContainers((prev) => {
        if (
          prev.length === currentData.length &&
          prev.every(
            (item, i) =>
              item.id === currentData[i].id &&
              item.videoSrc === currentData[i].videoSrc &&
              item.element === currentData[i].element
          )
        ) {
          return prev;
        }
        return currentData;
      });
    };

    // Debounce the mutation trigger
    const handleMutation = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(updateContainers, 150);
    };

    updateContainers();

    window.addEventListener('resize', handleMutation);
    
    // Observer listens for DOM structural changes and src/attribute mutations
    const observer = new MutationObserver(handleMutation);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true, 
      attributes: true,
      attributeFilter: ['src', 'data-video-src', 'id', 'class'] 
    });

    return () => {
      window.removeEventListener('resize', handleMutation);
      if (timeoutId) clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  return containers;
};
