import { useState, useLayoutEffect, useRef } from 'react';

/**
 * Hook to handle cover letter pagination by measuring actual DOM elements
 * 
 * @param {Object} params
 * @param {Object} params.contentBlocks - Array of content blocks (header, recipient info, paragraphs, signature)
 * @param {Object} params.spacingConfig - Spacing configuration (margins)
 * @param {number} params.A4_HEIGHT_PX - Height of a page in pixels
 * @returns {Object} { pages, measureRef, isMeasuring }
 */
export const useCoverLetterPagination = ({
  contentBlocks,
  spacingConfig,
  A4_HEIGHT_PX,
}) => {
  const [pages, setPages] = useState([]);
  const [isMeasuring, setIsMeasuring] = useState(true);
  const measureRef = useRef(null);

  // Convert mm to px (approximate for screen)
  const MM_TO_PX = 3.78;
  const marginTBPx = (spacingConfig.marginTB || 0) * MM_TO_PX;
  const contentHeight = A4_HEIGHT_PX - (marginTBPx * 2);

  useLayoutEffect(() => {
    if (!measureRef.current) return;

    const measure = () => {
      const heights = {};
      const container = measureRef.current;
      
      // Measure each block
      contentBlocks.forEach(block => {
        const el = container.querySelector(`[data-block-id="${block.id}"]`);
        if (el) {
          heights[block.id] = el.offsetHeight;
        }
      });
      
      calculatePages(heights);
      setIsMeasuring(false);
    };

    // Small delay to ensure rendering is complete
    const timer = setTimeout(measure, 50);
    
    return () => clearTimeout(timer);
  }, [contentBlocks, spacingConfig, A4_HEIGHT_PX]);

  const calculatePages = (heights) => {
    const newPages = [];
    let currentPage = { blocks: [] };
    let currentHeight = 0;
    
    contentBlocks.forEach(block => {
      const h = heights[block.id] || 0;
      
      // Check if block fits
      // If it's the very first block on a page, we must place it there even if it's too big (to avoid infinite loop)
      if (currentHeight + h > contentHeight && currentPage.blocks.length > 0) {
        // New page
        newPages.push(currentPage);
        currentPage = { blocks: [] };
        currentHeight = 0;
      }
      
      currentPage.blocks.push(block);
      currentHeight += h;
    });
    
    if (currentPage.blocks.length > 0 || newPages.length === 0) {
      newPages.push(currentPage);
    }
    
    setPages(newPages);
  };

  return { pages, measureRef, isMeasuring };
};
