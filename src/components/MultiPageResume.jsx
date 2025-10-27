import React, { useEffect, useRef, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import SectionPreview from './SectionPreview';
import ResumeHeader from './ResumeHeader';
import './ResumeOverflow.css';

/**
 * MultiPageResume Component
 * 
 * Handles multi-page resume rendering with automatic overflow:
 * - Measures content height
 * - Distributes sections across pages
 * - Supports single and two-column layouts
 * - Creates new pages as needed
 */
const MultiPageResume = ({ 
  resume, 
  A4_WIDTH_PX, 
  A4_HEIGHT_PX,
  formatLastSaved,
  lastSavedAt,
  isSaving,
  loadDocId,
  setLoadDocId,
  loadFromFirestore,
  saveToFirestore
}) => {
  const [pages, setPages] = useState([]);
  const measureRef = useRef(null);
  const contentRef = useRef(null);

  // A4 dimensions in mm
  const A4_WIDTH_MM = 210;
  const A4_HEIGHT_MM = 297;

  // Convert mm to px (3.78px per mm at 96 DPI)
  const mmToPx = (mm) => mm * 3.78;

  useEffect(() => {
    // Calculate available content height per page
    const paddingTopBottom = resume.spacingConfig.marginTB * 3.78 * 2;
    const availableHeight = A4_HEIGHT_PX - paddingTopBottom;

    console.log('📄 Pagination Debug:', {
      A4_HEIGHT_PX,
      paddingTopBottom,
      availableHeight,
      marginTB: resume.spacingConfig.marginTB
    });

    // Get all visible sections in order
    const visibleSections = resume.sectionOrder
      .map((sectionId) => resume.sections.find((s) => s.id === sectionId))
      .filter((section) => section && section.visible);

    console.log('📋 Visible sections:', visibleSections.length);

    if (visibleSections.length === 0) {
      setPages([{ sections: [], headerOnly: true }]);
      return;
    }

    // For single column layout, we'll measure and paginate differently
    if (resume.layoutConfig.columns === 'one') {
      paginateSingleColumn(visibleSections, availableHeight);
    } else if (resume.layoutConfig.columns === 'two') {
      paginateTwoColumns(visibleSections, availableHeight);
    } else {
      // Mix layout - first section full width, rest in two columns
      paginateMixLayout(visibleSections, availableHeight);
    }
  }, [
    resume.sections,
    resume.sectionOrder,
    resume.layoutConfig,
    resume.spacingConfig,
    resume.formData,
    A4_HEIGHT_PX
  ]);

  // Estimate section height (rough calculation)
  const estimateSectionHeight = (section) => {
    if (!section || !section.items) return 80;
    
    const baseHeight = 70; // Section heading + spacing + margins
    const itemCount = section.items?.length || 0;
    
    // Skills sections tend to be more compact
    const isSkills = (section.id || '').toLowerCase().includes('skill') ||
                     (section.name || '').toLowerCase().includes('skill');
    
    // Certifications without descriptions are also more compact
    const isCert = (section.id || '').toLowerCase().includes('certif') ||
                   (section.name || '').toLowerCase().includes('certif');
    
    // Publications often have moderate content
    const isPub = (section.id || '').toLowerCase().includes('publication') ||
                  (section.name || '').toLowerCase().includes('publication');
    
    if (isSkills) {
      return baseHeight + (itemCount * 40); // Skills are compact
    } else if (isCert) {
      return baseHeight + (itemCount * 50); // Certifications compact
    } else if (isPub) {
      return baseHeight + (itemCount * 120); // Publications have more content
    }
    
    // Standard sections with descriptions, titles, etc.
    return baseHeight + (itemCount * 130); // Experience, Education, Projects
  };

  // Paginate single column layout
  const paginateSingleColumn = (sections, availableHeight) => {
    const newPages = [];
    let currentPage = { sections: [], type: 'single' };
    let currentHeight = 0;

    // Reserve space for header on first page - be very conservative
    const headerHeight = 200; // Much larger header height estimate
    const profileHeight = resume.formData.profile ? 150 : 0; // Much larger profile section estimate
    
    if (resume.formData.fullName || resume.formData.profile) {
      currentHeight += headerHeight + profileHeight;
    }

    sections.forEach((section) => {
      const sectionHeight = estimateSectionHeight(section);
      
      if (currentHeight + sectionHeight > availableHeight && currentPage.sections.length > 0) {
        // Start a new page
        newPages.push(currentPage);
        currentPage = { sections: [], type: 'single' };
        currentHeight = 0;
      }
      
      currentPage.sections.push(section);
      currentHeight += sectionHeight;
    });

    // Add the last page
    if (currentPage.sections.length > 0) {
      newPages.push(currentPage);
    }

    setPages(newPages.length > 0 ? newPages : [{ sections: [], headerOnly: true }]);
  };

  // Paginate two column layout - Sequential top-to-bottom order
  const paginateTwoColumns = (sections, availableHeight) => {
    const newPages = [];
    
    // Reserve space for header on first page
    const headerHeight = 200;
    const profileHeight = resume.formData.profile ? 150 : 0;
    const initialReserved = headerHeight + profileHeight;
    
    if (resume.formData.fullName || resume.formData.profile) {
      availableHeight -= initialReserved;
    }

    console.log('🔢 Two-column pagination starting:', {
      availableHeight: availableHeight + (resume.formData.fullName || resume.formData.profile ? initialReserved : 0),
      initialReserved,
      sectionsCount: sections.length
    });

    // Split sections in half for top-to-bottom reading order
    const midPoint = Math.ceil(sections.length / 2);
    const leftSections = sections.slice(0, midPoint);
    const rightSections = sections.slice(midPoint);
    
    console.log('📊 Splitting sections:', {
      total: sections.length,
      midPoint,
      leftCount: leftSections.length,
      rightCount: rightSections.length,
      leftSections: leftSections.map(s => s.name),
      rightSections: rightSections.map(s => s.name)
    });

    // Calculate heights for each column
    let leftHeight = resume.formData.fullName || resume.formData.profile ? initialReserved : 0;
    let rightHeight = resume.formData.fullName || resume.formData.profile ? initialReserved : 0;
    
    leftSections.forEach(section => {
      leftHeight += estimateSectionHeight(section);
    });
    
    rightSections.forEach(section => {
      rightHeight += estimateSectionHeight(section);
    });

    console.log('📏 Column heights:', {
      leftHeight,
      rightHeight,
      maxAllowed: availableHeight + (resume.formData.fullName || resume.formData.profile ? initialReserved : 0)
    });

    // For now, put all in one page (we can add multi-page logic later if needed)
    newPages.push({
      leftSections,
      rightSections,
      type: 'two'
    });

    console.log(`✅ Total pages created: ${newPages.length}`);
    setPages(newPages.length > 0 ? newPages : [{ leftSections: [], rightSections: [], headerOnly: true }]);
  };

  // Paginate mix layout (first section full width, rest in columns)
  const paginateMixLayout = (sections, availableHeight) => {
    if (sections.length === 0) {
      setPages([{ sections: [], headerOnly: true }]);
      return;
    }

    const firstSection = sections[0];
    const restSections = sections.slice(1);

    // First page has the full-width section
    const firstSectionHeight = estimateSectionHeight(firstSection);
    const headerHeight = 200; // Much larger header height estimate
    const profileHeight = resume.formData.profile ? 150 : 0; // Much larger profile estimate
    
    let currentPage = {
      firstSection: firstSection,
      leftSections: [],
      rightSections: [],
      type: 'mix'
    };
    
    let leftHeight = headerHeight + profileHeight + firstSectionHeight;
    let rightHeight = headerHeight + profileHeight + firstSectionHeight;
    let currentColumn = 'left'; // Track which column we're filling
    const newPages = [currentPage];

    restSections.forEach((section) => {
      const sectionHeight = estimateSectionHeight(section);
      
      // Try to add to current column first
      if (currentColumn === 'left') {
        if (leftHeight + sectionHeight <= availableHeight) {
          // Fits in left column
          currentPage.leftSections.push(section);
          leftHeight += sectionHeight;
        } else {
          // Doesn't fit in left, switch to right column
          currentColumn = 'right';
          if (rightHeight + sectionHeight <= availableHeight) {
            currentPage.rightSections.push(section);
            rightHeight += sectionHeight;
          } else {
            // Doesn't fit in right either, create new page
            currentPage = { leftSections: [], rightSections: [], type: 'two' };
            newPages.push(currentPage);
            leftHeight = 0;
            rightHeight = 0;
            currentColumn = 'left';
            // Add to new page's left column
            currentPage.leftSections.push(section);
            leftHeight += sectionHeight;
          }
        }
      } else {
        // Current column is right
        if (rightHeight + sectionHeight <= availableHeight) {
          // Fits in right column
          currentPage.rightSections.push(section);
          rightHeight += sectionHeight;
        } else {
          // Doesn't fit in right, create new page
          currentPage = { leftSections: [], rightSections: [], type: 'two' };
          newPages.push(currentPage);
          leftHeight = 0;
          rightHeight = 0;
          currentColumn = 'left';
          // Add to new page's left column
          currentPage.leftSections.push(section);
          leftHeight += sectionHeight;
        }
      }
    });

    setPages(newPages);
  };

  // Render a single page
  const renderPage = (pageData, pageIndex) => {
    const isFirstPage = pageIndex === 0;
    
    return (
      <div
        key={pageIndex}
        className="resume-page"
        style={{
          width: `${A4_WIDTH_PX}px`,
          height: `${A4_HEIGHT_PX}px`,
          padding: `${resume.spacingConfig.marginTB * 3.78}px ${resume.spacingConfig.marginLR * 3.78}px`,
        }}
      >
        {/* Show controls only on first page */}
        {isFirstPage && (
          <>
            <div className="pointer-events-none absolute right-6 top-6 flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 z-50">
              <span className="h-2 w-2 rounded-full bg-indigo-500" /> Live preview
            </div>
            {/* <div className="absolute left-6 bottom-6 z-50 flex items-center gap-2">
              <input
                value={loadDocId}
                onChange={(e) => setLoadDocId(e.target.value)}
                placeholder="Firestore doc id"
                className="px-2 py-1 text-xs rounded border border-slate-200 w-56"
              />
              <button
                onClick={() => loadFromFirestore(loadDocId)}
                disabled={isSaving}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-semibold text-white shadow ${
                  isSaving ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSaving && <CircularProgress size={14} color="inherit" />}
                Load
              </button>
              <button
                onClick={() => saveToFirestore()}
                disabled={isSaving}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-semibold text-white shadow ${
                  isSaving ? 'bg-slate-400' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isSaving ? (
                  <>
                    <CircularProgress size={14} color="inherit" /> Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div> */}
            <div className="absolute right-6 top-16 z-50 px-3 py-1 rounded text-xs font-medium text-slate-700">
              Last saved: {formatLastSaved(lastSavedAt)}
            </div>
          </>
        )}

        {/* Page number indicator */}
        <div className="absolute bottom-6 right-6 text-xs text-slate-400">
          Page {pageIndex + 1} of {pages.length}
        </div>

        {/* Header (only on first page) */}
        {isFirstPage && (
          <div
            className={`resume-header ${
              resume.layoutConfig.headerPosition === 'left'
                ? 'flex gap-6'
                : resume.layoutConfig.headerPosition === 'right'
                ? 'flex gap-6 flex-row-reverse'
                : 'block'
            } ${
              resume.layoutConfig.headerPosition === 'top'
                ? ''
                : ''
            }`}
            style={{ textAlign: resume.personalConfig.align }}
          >
            {resume.formData.photoUrl && (
              <div
                className={`${
                  resume.layoutConfig.headerPosition === 'top' ? 'h-24 w-24' : 'h-20 w-20'
                } rounded-full overflow-hidden border-2 border-slate-200 flex-shrink-0`}
              >
                <img
                  src={resume.formData.photoUrl}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div
              className={resume.layoutConfig.headerPosition === 'top' ? '' : 'flex-1'}
            >
              <ResumeHeader
                formData={resume.formData}
                personalConfig={resume.personalConfig}
              />
            </div>
          </div>
        )}

        {/* Profile section (only on first page) */}
        {isFirstPage && resume.formData.profile && (
          <div className="mt-6 mb-6">
            <h2 className="resume-section-heading text-lg font-bold text-slate-900 border-b-2 border-slate-900 pb-1 mb-4">
              PROFILE
            </h2>
            <div
              className="resume-item-description text-sm text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: resume.formData.profile }}
            />
          </div>
        )}

        {/* Content based on page type */}
        <div className={isFirstPage ? 'mt-0' : ''}>
          {pageData.type === 'single' && (
            <div className="resume-content-single space-y-6">
              {pageData.sections.map((section) => (
                <SectionPreview
                  key={section.id}
                  section={section}
                  spacingConfig={resume.spacingConfig}
                />
              ))}
            </div>
          )}

          {pageData.type === 'two' && (
            <div
              className="resume-content-columns"
              style={{
                gridTemplateColumns: `${resume.layoutConfig.leftColumnWidth}% ${resume.layoutConfig.rightColumnWidth}%`,
                display: 'grid',
                gap: '20px'
              }}
            >
              <div className="space-y-6">
                {pageData.leftSections.map((section) => (
                  <SectionPreview
                    key={section.id}
                    section={section}
                    spacingConfig={resume.spacingConfig}
                  />
                ))}
              </div>
              <div className="space-y-6">
                {pageData.rightSections.map((section) => (
                  <SectionPreview
                    key={section.id}
                    section={section}
                    spacingConfig={resume.spacingConfig}
                  />
                ))}
              </div>
            </div>
          )}

          {pageData.type === 'mix' && (
            <div>
              {pageData.firstSection && (
                <div className="mb-6">
                  <SectionPreview
                    section={pageData.firstSection}
                    spacingConfig={resume.spacingConfig}
                  />
                </div>
              )}
              {(pageData.leftSections.length > 0 || pageData.rightSections.length > 0) && (
                <div
                  className="resume-content-columns"
                  style={{
                    gridTemplateColumns: `${resume.layoutConfig.leftColumnWidth}% ${resume.layoutConfig.rightColumnWidth}%`,
                    display: 'grid',
                    gap: '20px'
                  }}
                >
                  <div className="space-y-6">
                    {pageData.leftSections.map((section) => (
                      <SectionPreview
                        key={section.id}
                        section={section}
                        spacingConfig={resume.spacingConfig}
                      />
                    ))}
                  </div>
                  <div className="space-y-6">
                    {pageData.rightSections.map((section) => (
                      <SectionPreview
                        key={section.id}
                        section={section}
                        spacingConfig={resume.spacingConfig}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="resume-pages-container">
      {pages.map((pageData, index) => renderPage(pageData, index))}
    </div>
  );
};

export default MultiPageResume;
