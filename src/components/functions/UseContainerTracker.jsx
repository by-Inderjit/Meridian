"use client";

import { useEffect, useState } from 'react';

export const useContainerTracker = () => {
  const [containers, setContainers] = useState([]);

  useEffect(() => {
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

    updateContainers();

    window.addEventListener('resize', updateContainers);
    const observer = new MutationObserver(updateContainers);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('resize', updateContainers);
      observer.disconnect();
    };
  }, []);

  return containers;
};