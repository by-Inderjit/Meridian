// UseContainerTracker.jsx
"use client";

import { useEffect, useState } from 'react';

export const useContainerTracker = () => {
  const [containers, setContainers] = useState([]);

  useEffect(() => {
    let timeoutId = null;
    
    const updateContainers = () => {
      const elements = document.querySelectorAll('.CONTAINER');
      const currentData = [];

      elements.forEach((el, index) => {
        const img = el.querySelector('img');
        const imgSrc = img ? img.src : null;
        const id = el.id || `container-${index}`;

        currentData.push({
          id,
          element: el,
          imgSrc,
        });
      });

      setContainers((prev) => {
        if (
          prev.length === currentData.length &&
          prev.every((item, i) => item.id === currentData[i].id && item.imgSrc === currentData[i].imgSrc)
        ) {
          return prev;
        }
        return currentData;
      });
    };

    // Debounce the mutation trigger
    const handleMutation = () => {
      if(timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(updateContainers, 150);
    };

    updateContainers();

    window.addEventListener('resize', handleMutation);
    const observer = new MutationObserver(handleMutation);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('resize', handleMutation);
      if(timeoutId) clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  return containers;
};