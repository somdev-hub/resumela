import { useState, useEffect, useRef, useLayoutEffect } from 'react';

/**
 * Hook to handle resume pagination by measuring actual DOM elements
 * 
 * @param {Object} params
 * @param {Array} params.sections - List of section objects
 * @param {Array} params.sectionOrder - Order of section IDs
 * @param {Object} params.layoutConfig - Layout configuration (columns, widths)
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

  // Measure sections whenever content changes
  useLayoutEffect(() => {
    if (!measureRef.current) return;

    const measure = () => {
      const heights = {};
      const container = measureRef.current;
      
      // Measure sections
      visibleSections.forEach(section => {
        const el = container.querySelector(`[data-section-id="${section.id}"]`);
        if (el) {
          heights[section.id] = el.offsetHeight;
        }
      });

      // Measure header and profile if they exist in the container
      const headerEl = container.querySelector('#measure-header');
      const profileEl = container.querySelector('#measure-profile');
      
      const measuredHeaderHeight = headerEl ? headerEl.offsetHeight : (headerHeight || 0);
      const measuredProfileHeight = profileEl ? profileEl.offsetHeight : (profileHeight || 0);
      
      sectionHeightsRef.current = heights;
      calculatePages(heights, measuredHeaderHeight, measuredProfileHeight);
      setIsMeasuring(false);
    };

    // Small delay to ensure rendering is complete
    const timer = setTimeout(measure, 50);
    
    return () => clearTimeout(timer);
  }, [sections, sectionOrder, layoutConfig, spacingConfig, headerHeight, profileHeight]);

  const calculatePages = (heights, currentHeaderHeight, currentProfileHeight) => {
    if (visibleSections.length === 0) {
      setPages([{ type: 'single', sections: [], headerOnly: true }]);
      return;
    }

    const layoutType = layoutConfig.columns;
    
    if (layoutType === 'one') {
      paginateSingleColumn(visibleSections, heights, currentHeaderHeight, currentProfileHeight);
    } else if (layoutType === 'two') {
      paginateTwoColumns(visibleSections, heights, currentHeaderHeight, currentProfileHeight);
    } else {
      paginateMixLayout(visibleSections, heights, currentHeaderHeight, currentProfileHeight);
    }
  };

  const paginateSingleColumn = (sections, heights, hHeight, pHeight) => {
    const newPages = [];
    let currentPage = { type: 'single', sections: [] };
    
    // First page has header and profile
    let currentHeight = hHeight + pHeight;
    
    sections.forEach(section => {
      const h = heights[section.id] || 0;
      
      // Check if section fits
      if (currentHeight + h > contentHeight && currentPage.sections.length > 0) {
        // New page
        newPages.push(currentPage);
        currentPage = { type: 'single', sections: [] };
        currentHeight = 0;
      }
      
      currentPage.sections.push(section);
      currentHeight += h;
    });
    
    if (currentPage.sections.length > 0 || newPages.length === 0) {
      newPages.push(currentPage);
    }
    
    setPages(newPages);
  };

  const paginateTwoColumns = (sections, heights, hHeight, pHeight) => {
    const newPages = [];
    
    // Initial page setup
    let currentPage = { type: 'two', leftSections: [], rightSections: [] };
    let leftHeight = hHeight + pHeight;
    let rightHeight = hHeight + pHeight;
    
    let currentColumn = 'left'; // 'left' or 'right'
    
    sections.forEach(section => {
      const h = heights[section.id] || 0;
      
      // Try to fit in current column
      if (currentColumn === 'left') {
        if (leftHeight + h <= contentHeight) {
          currentPage.leftSections.push(section);
          leftHeight += h;
        } else {
          // Left is full, switch to right
          currentColumn = 'right';
          // Check if it fits in right
          if (rightHeight + h <= contentHeight) {
            currentPage.rightSections.push(section);
            rightHeight += h;
          } else {
            // Both full, new page
            newPages.push(currentPage);
            currentPage = { type: 'two', leftSections: [], rightSections: [] };
            leftHeight = 0;
            rightHeight = 0;
            currentColumn = 'left';
            
            // Add to new page left
            currentPage.leftSections.push(section);
            leftHeight += h;
          }
        }
      } else {
        // Current is right
        if (rightHeight + h <= contentHeight) {
          currentPage.rightSections.push(section);
          rightHeight += h;
        } else {
          // Right is full, new page
          newPages.push(currentPage);
          currentPage = { type: 'two', leftSections: [], rightSections: [] };
          leftHeight = 0;
          rightHeight = 0;
          currentColumn = 'left';
          
          // Add to new page left
          currentPage.leftSections.push(section);
          leftHeight += h;
        }
      }
    });
    
    if (currentPage.leftSections.length > 0 || currentPage.rightSections.length > 0 || newPages.length === 0) {
      newPages.push(currentPage);
    }
    
    setPages(newPages);
  };

  const paginateMixLayout = (sections, heights, hHeight, pHeight) => {
    if (sections.length === 0) {
      setPages([{ type: 'mix', firstSection: null, leftSections: [], rightSections: [] }]);
      return;
    }

    const firstSection = sections[0];
    const restSections = sections.slice(1);
    const firstHeight = heights[firstSection.id] || 0;

    const newPages = [];
    let currentPage = { 
      type: 'mix', 
      firstSection: firstSection, 
      leftSections: [], 
      rightSections: [] 
    };

    // Initial heights for the first page
    // Header + Profile + First Section (Full Width)
    let leftHeight = hHeight + pHeight + firstHeight;
    let rightHeight = hHeight + pHeight + firstHeight;
    
    let currentColumn = 'left';

    restSections.forEach(section => {
      const h = heights[section.id] || 0;

      if (currentColumn === 'left') {
        if (leftHeight + h <= contentHeight) {
          currentPage.leftSections.push(section);
          leftHeight += h;
        } else {
          currentColumn = 'right';
          if (rightHeight + h <= contentHeight) {
            currentPage.rightSections.push(section);
            rightHeight += h;
          } else {
            // New page
            newPages.push(currentPage);
            // Subsequent pages are treated as two-column pages (usually)
            currentPage = { 
              type: 'mix', 
              firstSection: null, 
              leftSections: [], 
              rightSections: [] 
            };
            leftHeight = 0;
            rightHeight = 0;
            currentColumn = 'left';
            
            currentPage.leftSections.push(section);
            leftHeight += h;
          }
        }
      } else {
        if (rightHeight + h <= contentHeight) {
          currentPage.rightSections.push(section);
          rightHeight += h;
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
          currentColumn = 'left';
          
          currentPage.leftSections.push(section);
          leftHeight += h;
        }
      }
    });

    if (currentPage.leftSections.length > 0 || currentPage.rightSections.length > 0 || currentPage.firstSection || newPages.length === 0) {
      newPages.push(currentPage);
    }

    setPages(newPages);
  };

  return { pages, measureRef, isMeasuring };
};
