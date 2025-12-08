import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';

/**
 * Hook to handle resume pagination by measuring actual DOM elements
 * 
 * @param {Object} params
 * @param {Array} params.sections - List of section objects
 * @param {Array} params.sectionOrder - Order of section IDs
 * @param {Object} params.layoutConfig - Layout configuration (columns, widths, headerPosition)
 * @param {Object} params.spacingConfig - Spacing configuration (margins)
 * @param {number} params.A4_HEIGHT_PX - Height of a page in pixels
 * @param {number} params.headerHeight - Height of the header (measured or estimated)
 * @param {number} params.profileHeight - Height of the profile section (measured or estimated)
 * @returns {Object} { pages, measureRef, isMeasuring }
 */
export const useResumePagination = ({
  sections,
  sectionOrder,
  layoutConfig,
  spacingConfig,
  A4_HEIGHT_PX,
  headerHeight = 0,
  profileHeight = 0,
  selectedFont,
}) => {
  const [pages, setPages] = useState([]);
  const [isMeasuring, setIsMeasuring] = useState(true);
  const measureRef = useRef(null);
  const sectionHeightsRef = useRef({});

  // Convert mm to px (approximate for screen)
  const MM_TO_PX = 3.78;
  const marginTBPx = (spacingConfig.marginTB || 0) * MM_TO_PX;
  const contentHeight = A4_HEIGHT_PX - (marginTBPx * 2);

  // Get visible sections in order
  const visibleSections = sectionOrder
    .map(id => sections.find(s => s.id === id))
    .filter(s => s && s.visible);

  const paginateSingleColumn = useCallback((sections, heights, hDims, pDims) => {
    const newPages = [];
    let currentPage = { type: 'single', sections: [] };
    
    // Gap between sections (space-y-6 = 1.5rem = 24px)
    const GAP_PX = 24;
    
    // First page has header and profile
    // Header MB collapses with Profile MT
    // Profile MB collapses with First Section MT (which is 0)
    
    let currentY = 0;
    
    // Add Header
    currentY += hDims.marginTop + hDims.height;
    let prevMarginBottom = hDims.marginBottom;
    
    // Add Profile
    if (pDims.height > 0) {
      const mt = Math.max(prevMarginBottom, pDims.marginTop);
      currentY += mt + pDims.height;
      prevMarginBottom = pDims.marginBottom;
    }
    
    let currentHeight = currentY;
    
    sections.forEach(section => {
      const dims = heights[section.id] || { height: 0, marginTop: 0, marginBottom: 0 };
      const h = dims.height;
      
      // Determine gap
      // If first section on page, gap is 0 (mt-0 class)
      // Else gap is GAP_PX (space-y-6)
      
      let gap = 0;
      if (currentPage.sections.length > 0) {
        gap = GAP_PX;
      } else {
        // First section on page
        // Collapses with previous element (Profile or Header)
        gap = Math.max(prevMarginBottom, 0);
      }
      
      // Check if section fits
      if (currentHeight + gap + h > contentHeight && currentPage.sections.length > 0) {
        // New page
        newPages.push(currentPage);
        currentPage = { type: 'single', sections: [] };
        currentHeight = 0;
        prevMarginBottom = 0;
        gap = 0; // First on new page
      }
      
      currentPage.sections.push(section);
      currentHeight += gap + h;
      // Section MB is usually 8px (mb-2)
      prevMarginBottom = dims.marginBottom;
    });
    
    if (currentPage.sections.length > 0 || newPages.length === 0) {
      newPages.push(currentPage);
    }
    
    setPages(newPages);
  }, [contentHeight]);

  const paginateTwoColumns = useCallback((sections, heights, hDims, pDims) => {
    const newPages = [];
    
    // Check if we should use inverse pagination (right-to-left flow)
    const headerPosition = layoutConfig?.headerPosition || "top";
    const useInversePagination = headerPosition === "right";
    
    // Gap between sections (space-y-6 = 1.5rem = 24px)
    const GAP_PX = 24;
    
    // Initial page setup
    let currentPage = { type: 'two', leftSections: [], rightSections: [] };
    
    // Calculate initial heights based on header position
    
    // Helper to calculate initial Y
    const calculateInitialY = () => {
      // Profile is always at top (if present)
      // So Profile pushes both columns down.
      
      // Header:
      // If Top: Pushes both down.
      // If Left: Pushes Left down.
      // If Right: Pushes Right down.
      
      // Let's track LeftY and RightY separately.
      let leftY = 0;
      let rightY = 0;
      let pagePrevMB = 0; // Margin bottom from full-width elements (Header Top / Profile)
      
      // 1. Header (if Top)
      if (headerPosition === 'top') {
        leftY += hDims.marginTop + hDims.height;
        rightY += hDims.marginTop + hDims.height;
        pagePrevMB = hDims.marginBottom;
      }
      
      // 2. Profile (Always full width at top)
      if (pDims.height > 0) {
        const mt = Math.max(pagePrevMB, pDims.marginTop);
        leftY += mt + pDims.height;
        rightY += mt + pDims.height;
        pagePrevMB = pDims.marginBottom;
      }
      
      // 3. Header (if Left/Right) - Adds to specific column
      
      let leftPrevMB = pagePrevMB;
      let rightPrevMB = pagePrevMB;
      
      if (headerPosition === 'left') {
        // Header is first item in left column
        // It collapses with pagePrevMB
        const mt = Math.max(leftPrevMB, hDims.marginTop);
        leftY += mt + hDims.height;
        leftPrevMB = hDims.marginBottom;
      } else if (headerPosition === 'right') {
        const mt = Math.max(rightPrevMB, hDims.marginTop);
        rightY += mt + hDims.height;
        rightPrevMB = hDims.marginBottom;
      }
      
      return { leftY, rightY, leftPrevMB, rightPrevMB };
    };
    
    let { leftY, rightY, leftPrevMB, rightPrevMB } = calculateInitialY();
    let leftHeight = leftY;
    let rightHeight = rightY;
    
    // Start with left for normal pagination, right for inverse pagination
    let currentColumn = useInversePagination ? 'right' : 'left';
    
    sections.forEach(section => {
      const dims = heights[section.id] || { height: 0, marginTop: 0, marginBottom: 0 };
      const h = dims.height;
      
      // Determine gap for this section in the current column
      const getGap = (colType) => {
        // If header is in this column, then this section is NOT the first element (Header is).
        // So if headerPosition === colType, we treat it as subsequent element -> GAP_PX
        
        if (colType === 'left' && headerPosition === 'left' && currentPage.leftSections.length === 0) {
           // Header is first, Section is second. Gap is GAP_PX.
           return GAP_PX;
        }
        if (colType === 'right' && headerPosition === 'right' && currentPage.rightSections.length === 0) {
           return GAP_PX;
        }
        
        if (colType === 'left') {
           if (currentPage.leftSections.length > 0) return GAP_PX;
           return Math.max(leftPrevMB, 0);
        } else {
           if (currentPage.rightSections.length > 0) return GAP_PX;
           return Math.max(rightPrevMB, 0);
        }
      };
      
      if (useInversePagination) {
        // Inverse pagination: right -> left -> next page
        if (currentColumn === 'right') {
          const gap = getGap('right');
          if (rightHeight + gap + h <= contentHeight) {
            currentPage.rightSections.push(section);
            rightHeight += gap + h;
          } else {
            // Right is full, switch to left
            currentColumn = 'left';
            const leftGap = getGap('left');
            if (leftHeight + leftGap + h <= contentHeight) {
              currentPage.leftSections.push(section);
              leftHeight += leftGap + h;
            } else {
              // Both full, new page
              newPages.push(currentPage);
              currentPage = { type: 'two', leftSections: [], rightSections: [] };
              leftHeight = 0;
              rightHeight = 0;
              leftPrevMB = 0;
              rightPrevMB = 0;
              currentColumn = 'right';
              
              // Add to new page right
              currentPage.rightSections.push(section);
              rightHeight += h; // First on new page, gap 0
            }
          }
        } else {
          // Current is left
          const gap = getGap('left');
          if (leftHeight + gap + h <= contentHeight) {
            currentPage.leftSections.push(section);
            leftHeight += gap + h;
          } else {
            // Left is full, new page
            newPages.push(currentPage);
            currentPage = { type: 'two', leftSections: [], rightSections: [] };
            leftHeight = 0;
            rightHeight = 0;
            leftPrevMB = 0;
            rightPrevMB = 0;
            currentColumn = 'right';
            
            // Add to new page right
            currentPage.rightSections.push(section);
            rightHeight += h;
          }
        }
      } else {
        // Normal pagination: left -> right -> next page
        if (currentColumn === 'left') {
          const gap = getGap('left');
          if (leftHeight + gap + h <= contentHeight) {
            currentPage.leftSections.push(section);
            leftHeight += gap + h;
          } else {
            // Left is full, switch to right
            currentColumn = 'right';
            const rightGap = getGap('right');
            if (rightHeight + rightGap + h <= contentHeight) {
              currentPage.rightSections.push(section);
              rightHeight += rightGap + h;
            } else {
              // Both full, new page
              newPages.push(currentPage);
              currentPage = { type: 'two', leftSections: [], rightSections: [] };
              leftHeight = 0;
              rightHeight = 0;
              leftPrevMB = 0;
              rightPrevMB = 0;
              currentColumn = 'left';
              
              // Add to new page left
              currentPage.leftSections.push(section);
              leftHeight += h;
            }
          }
        } else {
          // Current is right
          const gap = getGap('right');
          if (rightHeight + gap + h <= contentHeight) {
            currentPage.rightSections.push(section);
            rightHeight += gap + h;
          } else {
            // Right is full, new page
            newPages.push(currentPage);
            currentPage = { type: 'two', leftSections: [], rightSections: [] };
            leftHeight = 0;
            rightHeight = 0;
            leftPrevMB = 0;
            rightPrevMB = 0;
            currentColumn = 'left';
            
            // Add to new page left
            currentPage.leftSections.push(section);
            leftHeight += h;
          }
        }
      }
    });
    
    if (currentPage.leftSections.length > 0 || currentPage.rightSections.length > 0 || newPages.length === 0) {
      newPages.push(currentPage);
    }
    
    setPages(newPages);
  }, [layoutConfig, contentHeight]);

  const paginateMixLayout = useCallback((sections, heights, hDims, pDims) => {
    if (sections.length === 0) {
      setPages([{ type: 'mix', firstSection: null, leftSections: [], rightSections: [] }]);
      return;
    }

    // Check if we should use inverse pagination (right-to-left flow)
    const headerPosition = layoutConfig?.headerPosition || "top";
    const useInversePagination = headerPosition === "right";
    const GAP_PX = 24;

    const firstSection = sections[0];
    const restSections = sections.slice(1);
    const firstDims = heights[firstSection.id] || { height: 0, marginTop: 0, marginBottom: 0 };
    const firstHeight = firstDims.height;

    const newPages = [];
    let currentPage = { 
      type: 'mix', 
      firstSection: firstSection, 
      leftSections: [], 
      rightSections: [] 
    };

    // Initial heights for the first page
    // Header + Profile + First Section (Full Width)
    
    // 1. Header (if Top)
    let currentY = 0;
    let prevMB = 0;
    
    if (headerPosition === 'top') {
      currentY += hDims.marginTop + hDims.height;
      prevMB = hDims.marginBottom;
    }
    
    // 2. Profile
    if (pDims.height > 0) {
      const mt = Math.max(prevMB, pDims.marginTop);
      currentY += mt + pDims.height;
      prevMB = pDims.marginBottom;
    }
    
    // 3. First Section (Full Width)
    // Collapses with Profile
    const mt = Math.max(prevMB, 0); // First section has mt-0
    currentY += mt + firstHeight;
    prevMB = firstDims.marginBottom;
    
    let leftHeight = currentY;
    let rightHeight = currentY;
    let leftPrevMB = prevMB;
    let rightPrevMB = prevMB;

    if (headerPosition === 'left') {
      const hmt = Math.max(leftPrevMB, hDims.marginTop);
      leftHeight += hmt + hDims.height;
      leftPrevMB = hDims.marginBottom;
    } else if (headerPosition === 'right') {
      const hmt = Math.max(rightPrevMB, hDims.marginTop);
      rightHeight += hmt + hDims.height;
      rightPrevMB = hDims.marginBottom;
    }
    
    // Start with left for normal pagination, right for inverse pagination
    let currentColumn = useInversePagination ? 'right' : 'left';

    restSections.forEach(section => {
      const dims = heights[section.id] || { height: 0, marginTop: 0, marginBottom: 0 };
      const h = dims.height;

      const getGap = (colType) => {
        // Similar logic to Two Column, but here we also have First Section above.
        // If header is in column, it's first.
        // If not, First Section is above.
        
        if (colType === 'left' && headerPosition === 'left' && currentPage.leftSections.length === 0) {
           return GAP_PX;
        }
        if (colType === 'right' && headerPosition === 'right' && currentPage.rightSections.length === 0) {
           return GAP_PX;
        }
        
        if (colType === 'left') {
           if (currentPage.leftSections.length > 0) return GAP_PX;
           return Math.max(leftPrevMB, 0);
        } else {
           if (currentPage.rightSections.length > 0) return GAP_PX;
           return Math.max(rightPrevMB, 0);
        }
      };

      if (useInversePagination) {
        // Inverse pagination: right -> left -> next page
        if (currentColumn === 'right') {
          const gap = getGap('right');
          if (rightHeight + gap + h <= contentHeight) {
            currentPage.rightSections.push(section);
            rightHeight += gap + h;
          } else {
            currentColumn = 'left';
            const leftGap = getGap('left');
            if (leftHeight + leftGap + h <= contentHeight) {
              currentPage.leftSections.push(section);
              leftHeight += leftGap + h;
            } else {
              // New page
              newPages.push(currentPage);
              currentPage = { 
                type: 'mix', 
                firstSection: null, 
                leftSections: [], 
                rightSections: [] 
              };
              leftHeight = 0;
              rightHeight = 0;
              leftPrevMB = 0;
              rightPrevMB = 0;
              currentColumn = 'right';
              
              currentPage.rightSections.push(section);
              rightHeight += h;
            }
          }
        } else {
          // Current is left
          const gap = getGap('left');
          if (leftHeight + gap + h <= contentHeight) {
            currentPage.leftSections.push(section);
            leftHeight += gap + h;
          } else {
            newPages.push(currentPage);
            currentPage = { 
              type: 'mix', 
              firstSection: null, 
              leftSections: [], 
              rightSections: [] 
            };
            leftHeight = 0;
            rightHeight = 0;
            leftPrevMB = 0;
            rightPrevMB = 0;
            currentColumn = 'right';
            
            currentPage.rightSections.push(section);
            rightHeight += h;
          }
        }
      } else {
        // Normal pagination: left -> right -> next page
        if (currentColumn === 'left') {
          const gap = getGap('left');
          if (leftHeight + gap + h <= contentHeight) {
            currentPage.leftSections.push(section);
            leftHeight += gap + h;
          } else {
            currentColumn = 'right';
            const rightGap = getGap('right');
            if (rightHeight + rightGap + h <= contentHeight) {
              currentPage.rightSections.push(section);
              rightHeight += rightGap + h;
            } else {
              // New page
              newPages.push(currentPage);
              currentPage = { 
                type: 'mix', 
                firstSection: null, 
                leftSections: [], 
                rightSections: [] 
              };
              leftHeight = 0;
              rightHeight = 0;
              leftPrevMB = 0;
              rightPrevMB = 0;
              currentColumn = 'left';
              
              currentPage.leftSections.push(section);
              leftHeight += h;
            }
          }
        } else {
          // Current is right
          const gap = getGap('right');
          if (rightHeight + gap + h <= contentHeight) {
            currentPage.rightSections.push(section);
            rightHeight += gap + h;
          } else {
            newPages.push(currentPage);
            currentPage = { 
              type: 'mix', 
              firstSection: null, 
              leftSections: [], 
              rightSections: [] 
            };
            leftHeight = 0;
            rightHeight = 0;
            leftPrevMB = 0;
            rightPrevMB = 0;
            currentColumn = 'left';
            
            currentPage.leftSections.push(section);
            leftHeight += h;
          }
        }
      }
    });

    if (currentPage.leftSections.length > 0 || currentPage.rightSections.length > 0 || currentPage.firstSection || newPages.length === 0) {
      newPages.push(currentPage);
    }

    setPages(newPages);
  }, [layoutConfig, contentHeight]);

  const calculatePages = useCallback((heights, headerDims, profileDims) => {
    if (visibleSections.length === 0) {
      setPages([{ type: 'single', sections: [], headerOnly: true }]);
      return;
    }

    const layoutType = layoutConfig.columns;
    
    if (layoutType === 'one') {
      paginateSingleColumn(visibleSections, heights, headerDims, profileDims);
    } else if (layoutType === 'two') {
      paginateTwoColumns(visibleSections, heights, headerDims, profileDims);
    } else {
      paginateMixLayout(visibleSections, heights, headerDims, profileDims);
    }
  }, [visibleSections, layoutConfig, paginateSingleColumn, paginateTwoColumns, paginateMixLayout]);

  // Measure sections whenever content changes
  useLayoutEffect(() => {
    if (!measureRef.current) return;

    const measure = () => {
      const heights = {};
      const container = measureRef.current;
      
      const getDimensions = (wrapper) => {
        if (!wrapper) return { height: 0, marginTop: 0, marginBottom: 0 };
        const child = wrapper.firstElementChild;
        const height = wrapper.offsetHeight; // Wrapper height (content of child)
        let marginTop = 0;
        let marginBottom = 0;
        
        if (child) {
          const style = window.getComputedStyle(child);
          marginTop = parseFloat(style.marginTop) || 0;
          marginBottom = parseFloat(style.marginBottom) || 0;
        }
        return { height, marginTop, marginBottom };
      };

      // Measure sections
      visibleSections.forEach(section => {
        const el = container.querySelector(`[data-section-id="${section.id}"]`);
        heights[section.id] = getDimensions(el);
      });

      // Measure header and profile if they exist in the container
      const headerDims = getDimensions(container.querySelector('#measure-header'));
      const profileDims = getDimensions(container.querySelector('#measure-profile'));
      
      sectionHeightsRef.current = heights;
      calculatePages(heights, headerDims, profileDims);
      setIsMeasuring(false);
    };

    // Small delay to ensure rendering is complete
    const timer = setTimeout(measure, 50);

    // Also wait for fonts to be ready
    if (document.fonts) {
      document.fonts.ready.then(measure);
    }
    
    return () => clearTimeout(timer);
  }, [sections, sectionOrder, layoutConfig, spacingConfig, headerHeight, profileHeight, selectedFont, calculatePages, visibleSections]);

  return { pages, measureRef, isMeasuring };
};
