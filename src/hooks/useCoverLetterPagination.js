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
          const style = window.getComputedStyle(el);
          const marginTop = parseFloat(style.marginTop) || 0;
          const marginBottom = parseFloat(style.marginBottom) || 0;
          
          heights[block.id] = {
            height: el.offsetHeight,
            marginTop,
            marginBottom
          };
        }
      });
      
      calculatePages(heights);
      setIsMeasuring(false);
    };

    // Initial measure
    const timer = setTimeout(measure, 50);
    
    // Re-measure when fonts are ready
    if (document.fonts) {
      document.fonts.ready.then(measure);
    }
    
    return () => clearTimeout(timer);
  }, [contentBlocks, spacingConfig, A4_HEIGHT_PX]);

  const calculatePages = (heights) => {
    const newPages = [];
    let currentPage = { blocks: [] };
    let currentHeight = 0;
    let prevMarginBottom = 0;
    
    contentBlocks.forEach(block => {
      const metrics = heights[block.id];
      if (!metrics) return;
      
      const { height, marginTop, marginBottom } = metrics;
      
      // Calculate effective margin top for this block
      // If it's the first block on the page, we respect its margin-top (it adds to the page padding)
      // Otherwise, it collapses with the previous block's margin-bottom
      const effectiveMarginTop = currentPage.blocks.length === 0 
        ? marginTop 
        : Math.max(prevMarginBottom, marginTop);
      
      // Total vertical space this block contributes to the flow
      const blockSpace = effectiveMarginTop + height;
      
      // Check if block fits
      // Note: We use a small tolerance (1px) to avoid precision issues
      if (currentHeight + blockSpace > contentHeight + 1 && currentPage.blocks.length > 0) {
        // New page
        newPages.push(currentPage);
        currentPage = { blocks: [] };
        
        // Reset for new page
        // On a new page, the first block's margin-top is used (no collapse with previous page)
        currentHeight = marginTop + height;
        prevMarginBottom = marginBottom;
      } else {
        currentHeight += blockSpace;
        prevMarginBottom = marginBottom;
      }
      
      currentPage.blocks.push(block);
    });
    
    if (currentPage.blocks.length > 0 || newPages.length === 0) {
      newPages.push(currentPage);
    }
    
    setPages(newPages);
  };

  return { pages, measureRef, isMeasuring };
};
