import React, { useEffect, useRef, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import SectionPreview from "./SectionPreview";
import ResumeHeader from "./ResumeHeader";
import "./ResumeOverflow.css";

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
}) => {
  const [pages, setPages] = useState([]);

  // A4 dimensions in mm

  // Convert mm to px (3.78px per mm at 96 DPI)

  useEffect(() => {
    // Calculate available content height per page
    const paddingTopBottom = resume.spacingConfig.marginTB * 3.78 * 2;
    const availableHeight = A4_HEIGHT_PX - paddingTopBottom;

    console.log("📄 Pagination Debug:", {
      A4_HEIGHT_PX,
      paddingTopBottom,
      availableHeight,
      marginTB: resume.spacingConfig.marginTB,
    });

    // Get all visible sections in order
    const visibleSections = resume.sectionOrder
      .map((sectionId) => resume.sections.find((s) => s.id === sectionId))
      .filter((section) => section && section.visible);

    console.log("📋 Visible sections:", visibleSections.length);

    if (visibleSections.length === 0) {
      setPages([{ sections: [], headerOnly: true }]);
      return;
    }

    // For single column layout, we'll measure and paginate differently
    if (resume.layoutConfig.columns === "one") {
      paginateSingleColumn(visibleSections, availableHeight);
    } else if (resume.layoutConfig.columns === "two") {
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
    resume.personalConfig,
    A4_HEIGHT_PX,
  ]);

  // Improved section height estimation with actual content measurement
  const estimateSectionHeight = (section) => {
    if (!section || !section.items) return 80;

    const SECTION_TITLE_HEIGHT = 40; // Section heading with spacing
    const SECTION_MARGIN = 30; // Bottom margin
    const ITEM_TITLE_HEIGHT = 25; // Job title, degree, etc.
    const ITEM_SUBTITLE_HEIGHT = 20; // Company, date, location line
    const LINE_HEIGHT = 18; // Per line of text
    const BULLET_HEIGHT = 18; // Per bullet point
    const ITEM_SPACING = 15; // Space between items

    // Start with section header
    let totalHeight = SECTION_TITLE_HEIGHT;

    const itemCount = section.items?.length || 0;

    // Check section type
    const isSkills =
      (section.id || "").toLowerCase().includes("skill") ||
      (section.name || "").toLowerCase().includes("skill");

    const isCert =
      (section.id || "").toLowerCase().includes("certif") ||
      (section.name || "").toLowerCase().includes("certif");

    const isPub =
      (section.id || "").toLowerCase().includes("publication") ||
      (section.name || "").toLowerCase().includes("publication");

    // Skills section - usually just tags/badges
    if (isSkills) {
      // Skills are typically displayed as tags in rows
      const skillsPerRow = 3; // Adjust based on your layout
      const rows = Math.ceil(itemCount / skillsPerRow);
      totalHeight += rows * 35; // Height per row of skill tags
      totalHeight += SECTION_MARGIN;
      return totalHeight;
    }

    // Certifications - usually compact without descriptions
    if (isCert) {
      section.items.forEach((item) => {
        totalHeight += ITEM_TITLE_HEIGHT; // Cert name
        totalHeight += ITEM_SUBTITLE_HEIGHT; // Issuer, date
        totalHeight += ITEM_SPACING;
      });
      totalHeight += SECTION_MARGIN;
      return totalHeight;
    }

    // For all other sections, calculate based on actual content
    section.items.forEach((item) => {
      // Item title (job title, degree, project name, etc.)
      totalHeight += ITEM_TITLE_HEIGHT;

      // Subtitle line (company/date, institution/year, etc.)
      if (item.company || item.institution || item.date || item.startDate) {
        totalHeight += ITEM_SUBTITLE_HEIGHT;
      }

      // Description/Summary
      if (item.description) {
        const charCount = item.description.length;
        const charsPerLine = 80; // Average characters per line in column
        const lines = Math.ceil(charCount / charsPerLine);
        totalHeight += lines * LINE_HEIGHT;
      }

      if (item.summary) {
        const charCount = item.summary.length;
        const charsPerLine = 80;
        const lines = Math.ceil(charCount / charsPerLine);
        totalHeight += lines * LINE_HEIGHT;
      }

      // Bullet points / Highlights
      if (item.highlights && Array.isArray(item.highlights)) {
        item.highlights.forEach((highlight) => {
          const charCount = highlight.length;
          const charsPerLine = 75; // Slightly less due to bullet indent
          const lines = Math.ceil(charCount / charsPerLine);
          totalHeight += lines * BULLET_HEIGHT;
        });
      }

      // Keywords/Technologies (if displayed as tags)
      if (item.keywords && Array.isArray(item.keywords)) {
        const tagsPerRow = 4;
        const rows = Math.ceil(item.keywords.length / tagsPerRow);
        totalHeight += rows * 25;
      }

      // Space between items
      totalHeight += ITEM_SPACING;
    });

    // Add section bottom margin
    totalHeight += SECTION_MARGIN;

    console.log(`📏 ${section.name} height:`, {
      items: itemCount,
      calculatedHeight: totalHeight,
      avgPerItem: Math.round(totalHeight / itemCount),
    });

    return totalHeight;
  };

  // Paginate single column layout
  const paginateSingleColumn = (sections, availableHeight) => {
    const newPages = [];
    let currentPage = { sections: [], type: "single" };
    let currentHeight = 0;

    // Reserve space for header on first page - be very conservative
    const headerHeight = 200; // Much larger header height estimate
    const hasProfileOrPhoto = resume.formData.profile || resume.formData.photoUrl;
    const profileHeight = hasProfileOrPhoto ? 150 : 0; // Include photo when estimating

    if (resume.formData.fullName || hasProfileOrPhoto) {
      currentHeight += headerHeight + profileHeight;
    }

    sections.forEach((section) => {
      const sectionHeight = estimateSectionHeight(section);

      if (
        currentHeight + sectionHeight > availableHeight &&
        currentPage.sections.length > 0
      ) {
        // Start a new page
        newPages.push(currentPage);
        currentPage = { sections: [], type: "single" };
        currentHeight = 0;
      }

      currentPage.sections.push(section);
      currentHeight += sectionHeight;
    });

    // Add the last page
    if (currentPage.sections.length > 0) {
      newPages.push(currentPage);
    }

    setPages(
      newPages.length > 0 ? newPages : [{ sections: [], headerOnly: true }]
    );
  };

  // Paginate two column layout - Sequential left-to-right order
  const paginateTwoColumns = (sections, availableHeight) => {
    const newPages = [];

    // Reserve space for header on first page
    const hasProfileOrPhoto = resume.formData.profile || resume.formData.photoUrl;
    if (hasProfileOrPhoto) {
      console.log("hello world");
    }
    const headerHeight = 200;
    let profileHeight = hasProfileOrPhoto ? 250 : 0;
    if(hasProfileOrPhoto && (resume.personalConfig?.align === "left" || resume.personalConfig?.align === "right")) {
      profileHeight = 0;
    }
    const initialReserved = headerHeight + profileHeight;

    const hasHeader = resume.formData.fullName || hasProfileOrPhoto;
    const firstPageAvailable =
      availableHeight - (hasHeader ? initialReserved : 0);
    const subsequentPageAvailable = availableHeight;

    console.log("🔢 Two-column pagination starting:", {
      totalHeight: availableHeight,
      initialReserved: hasHeader ? initialReserved : 0,
      firstPageAvailable,
      sectionsCount: sections.length,
    });

    let currentPage = {
      leftSections: [],
      rightSections: [],
      type: "two",
    };

    let leftColumnHeight = hasHeader ? initialReserved : 0;
    let rightColumnHeight = hasHeader ? initialReserved : 0;
    let isFirstPage = true;
    let sectionIndex = 0;

    // Process each section sequentially
    while (sectionIndex < sections.length) {
      const section = sections[sectionIndex];
      const sectionHeight = estimateSectionHeight(section);
      const pageAvailableHeight = isFirstPage
        ? firstPageAvailable + (hasHeader ? initialReserved : 0)
        : subsequentPageAvailable;

      console.log(`\n📦 Processing section ${sectionIndex + 1}:`, {
        name: section.name,
        sectionHeight,
        leftColumnHeight,
        rightColumnHeight,
        pageAvailableHeight,
        isFirstPage,
      });

      // Try to add to LEFT column first
      if (leftColumnHeight + sectionHeight <= pageAvailableHeight) {
        currentPage.leftSections.push(section);
        leftColumnHeight += sectionHeight;

        console.log(`✅ Added to LEFT column`, {
          leftSections: currentPage.leftSections.length,
          leftHeight: leftColumnHeight,
        });

        sectionIndex++;
        continue;
      }

      // LEFT column is full, try RIGHT column
      if (rightColumnHeight + sectionHeight <= pageAvailableHeight) {
        currentPage.rightSections.push(section);
        rightColumnHeight += sectionHeight;

        console.log(`✅ Added to RIGHT column`, {
          rightSections: currentPage.rightSections.length,
          rightHeight: rightColumnHeight,
        });

        sectionIndex++;
        continue;
      }

      // Both columns full - create new page
      console.log(`📄 Both columns full, creating new page`);

      newPages.push(currentPage);

      // Reset for new page
      currentPage = {
        leftSections: [],
        rightSections: [],
        type: "two",
      };
      leftColumnHeight = 0;
      rightColumnHeight = 0;
      isFirstPage = false;

      // Don't increment sectionIndex - retry current section on new page
    }

    // Add last page if it has content
    if (
      currentPage.leftSections.length > 0 ||
      currentPage.rightSections.length > 0
    ) {
      newPages.push(currentPage);
    }

    console.log(`\n✅ Pagination complete:`, {
      totalPages: newPages.length,
      pageBreakdown: newPages.map((page, i) => ({
        page: i + 1,
        leftSections: page.leftSections.length,
        rightSections: page.rightSections.length,
        leftSectionNames: page.leftSections.map((s) => s.name),
        rightSectionNames: page.rightSections.map((s) => s.name),
      })),
    });

    setPages(
      newPages.length > 0
        ? newPages
        : [{ sections: [], headerOnly: true }]
    );
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
    const hasProfileOrPhoto = resume.formData.profile || resume.formData.photoUrl;
    const profileHeight = hasProfileOrPhoto ? 150 : 0; // Include photo when estimating

    let currentPage = {
      firstSection: firstSection,
      leftSections: [],
      rightSections: [],
      type: "mix",
    };

    let leftHeight = headerHeight + profileHeight + firstSectionHeight;
    let rightHeight = headerHeight + profileHeight + firstSectionHeight;
    let currentColumn = "left"; // Track which column we're filling
    const newPages = [currentPage];

    restSections.forEach((section) => {
      const sectionHeight = estimateSectionHeight(section);

      // Try to add to current column first
      if (currentColumn === "left") {
        if (leftHeight + sectionHeight <= availableHeight) {
          // Fits in left column
          currentPage.leftSections.push(section);
          leftHeight += sectionHeight;
        } else {
          // Doesn't fit in left, switch to right column
          currentColumn = "right";
          if (rightHeight + sectionHeight <= availableHeight) {
            currentPage.rightSections.push(section);
            rightHeight += sectionHeight;
          } else {
            // Doesn't fit in right either, create new page
            currentPage = { leftSections: [], rightSections: [], type: "two" };
            newPages.push(currentPage);
            leftHeight = 0;
            rightHeight = 0;
            currentColumn = "left";
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
          currentPage = { leftSections: [], rightSections: [], type: "two" };
          newPages.push(currentPage);
          leftHeight = 0;
          rightHeight = 0;
          currentColumn = "left";
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
          padding: `${resume.spacingConfig.marginTB * 3.78}px ${
            resume.spacingConfig.marginLR * 3.78
          }px`,
          // Apply background color for multicolor mode (both basic and advanced)
          ...(resume.colorConfig?.accentMode === "multi" && 
              resume.colorConfig?.multiBackgroundColor ? {
            backgroundColor: resume.colorConfig.multiBackgroundColor,
          } : {}),
          // Apply border for border mode with color
          ...(resume.colorConfig?.mode === "border" && 
              resume.colorConfig?.accentMode === "accent" &&
              resume.colorConfig?.selectedColor ? {
            border: `8px solid ${resume.colorConfig.selectedColor}`,
          } : {}),
          // Apply border with image pattern for border mode with image
          ...(resume.colorConfig?.mode === "border" && 
              resume.colorConfig?.accentMode === "image" &&
              resume.colorConfig?.selectedImage ? {
            border: `12px solid transparent`,
            borderImage: `url(${resume.colorConfig.selectedImage}) 30 round`,
            borderImageSlice: 30,
          } : {}),
          // Apply background image for basic image mode (full page)
          ...(resume.colorConfig?.mode === "basic" &&
              resume.colorConfig?.accentMode === "image" && 
              resume.colorConfig?.selectedImage ? {
            backgroundImage: `linear-gradient(rgba(255, 255, 255, ${1 - (resume.colorConfig.imageOpacity || 0.3)}), rgba(255, 255, 255, ${1 - (resume.colorConfig.imageOpacity || 0.3)})), url(${resume.colorConfig.selectedImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          } : {}),
        }}
      >
        {/* Show controls only on first page */}
        {isFirstPage && (
          <>
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
            {/* <div className="absolute right-6 top-16 z-50 px-3 py-1 rounded text-xs font-medium text-slate-700">
              Last saved: {formatLastSaved(lastSavedAt)}
            </div> */}
          </>
        )}

        {/* Page number indicator */}
        {/* <div className="absolute bottom-6 right-6 text-xs text-slate-400">
          Page {pageIndex + 1} of {pages.length}
        </div> */}

        {/* Header (only on first page) */}
        {isFirstPage && (
          (() => {
            const headerAlign = resume.personalConfig?.align || "center";
            const headerClass = headerAlign === "left"
              ? "resume-header flex gap-6 items-center"
              : headerAlign === "right"
              ? "resume-header flex gap-6 flex-row-reverse items-center"
              : "resume-header block";

            return (
              <div
                className={headerClass}
                style={{ 
                  textAlign: resume.personalConfig.align,
              // Advanced mode with accent: single color header background
              ...(resume.colorConfig?.mode === "advanced" && 
                  resume.colorConfig?.accentMode === "accent" && 
                  resume.colorConfig?.selectedColor ? {
                backgroundColor: resume.colorConfig.selectedColor,
                color: "#ffffff",
                padding: "1.5rem",
                marginLeft: `-${resume.spacingConfig.marginLR * 3.78}px`,
                marginRight: `-${resume.spacingConfig.marginLR * 3.78}px`,
                marginTop: `-${resume.spacingConfig.marginTB * 3.78}px`,
                marginBottom: "1.5rem",
              } : 
              // Advanced mode with multi: separate header background color
              resume.colorConfig?.mode === "advanced" && 
              resume.colorConfig?.accentMode === "multi" ? {
                backgroundColor: resume.colorConfig.multiHeaderBackgroundColor || resume.colorConfig.multiAccentColor || "#2c3e50",
                color: "#ffffff",
                padding: "1.5rem",
                marginLeft: `-${resume.spacingConfig.marginLR * 3.78}px`,
                marginRight: `-${resume.spacingConfig.marginLR * 3.78}px`,
                marginTop: `-${resume.spacingConfig.marginTB * 3.78}px`,
                marginBottom: "1.5rem",
              } :
              // Advanced mode with image: background image in header
              resume.colorConfig?.mode === "advanced" && 
              resume.colorConfig?.accentMode === "image" &&
              resume.colorConfig?.selectedImage ? {
                backgroundImage: `linear-gradient(rgba(0, 0, 0, ${resume.colorConfig.imageOpacity || 0.3}), rgba(0, 0, 0, ${resume.colorConfig.imageOpacity || 0.3})), url(${resume.colorConfig.selectedImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                color: "#ffffff",
                padding: "1.5rem",
                marginLeft: `-${resume.spacingConfig.marginLR * 3.78}px`,
                marginRight: `-${resume.spacingConfig.marginLR * 3.78}px`,
                marginTop: `-${resume.spacingConfig.marginTB * 3.78}px`,
                marginBottom: "1.5rem",
              } : {})
                }}
              >
                {/* If personal align is left/right, render photo as a sibling so flex places it at the outer edge */}
                {resume.formData.photoUrl && (headerAlign === "left" || headerAlign === "right") && (
                  <div
                    className={`${headerAlign === "top" ? "h-24 w-24" : "h-20 w-20"} rounded-full overflow-hidden border-2 ${
                      (resume.colorConfig?.mode === "advanced" && resume.colorConfig?.accentMode === "accent" && resume.colorConfig?.selectedColor) ||
                      (resume.colorConfig?.mode === "advanced" && resume.colorConfig?.accentMode === "multi")
                        ? "border-white"
                        : "border-slate-200"
                    } flex-shrink-0`}
                  >
                    <img
                      src={resume.formData.photoUrl}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className={headerAlign === "center" ? "w-full" : "flex-1"}>
                  <ResumeHeader
                    formData={resume.formData}
                    personalConfig={resume.personalConfig}
                    colorConfig={resume.colorConfig}
                  />
                </div>
              </div>
            );
          })()
        )}

        {/* Profile section (only on first page) */}
        {isFirstPage && resume.formData.profile && (
          <div className="mt-6 mb-6">
            <h2 className="resume-section-heading text-lg font-bold text-slate-900 border-b-2 border-slate-900 mb-4">
              PROFILE
            </h2>
            <div
              className="resume-item-description text-sm text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: resume.formData.profile }}
            />
          </div>
        )}

        {/* Content based on page type */}
        <div className={isFirstPage ? "mt-0" : ""}>
          {pageData.type === "single" && (
            <div className="resume-content-single space-y-6">
              {pageData.sections.map((section) => (
                <SectionPreview
                  key={section.id}
                  section={section}
                  spacingConfig={resume.spacingConfig}
                  colorConfig={resume.colorConfig}
                />
              ))}
            </div>
          )}

          {pageData.type === "two" && (
            <div
              className="resume-content-columns"
              style={{
                gridTemplateColumns: `${resume.layoutConfig.leftColumnWidth}% ${resume.layoutConfig.rightColumnWidth}%`,
                display: "grid",
                gap: "20px",
                paddingRight: "20px",
              }}
            >
              <div className="space-y-6">
                {pageData.leftSections.map((section) => (
                  <SectionPreview
                    key={section.id}
                    section={section}
                    spacingConfig={resume.spacingConfig}
                    colorConfig={resume.colorConfig}
                  />
                ))}
              </div>
              <div className="space-y-6">
                {pageData.rightSections.map((section) => (
                  <SectionPreview
                    key={section.id}
                    section={section}
                    spacingConfig={resume.spacingConfig}
                    colorConfig={resume.colorConfig}
                  />
                ))}
              </div>
            </div>
          )}

          {pageData.type === "mix" && (
            <div>
              {pageData.firstSection && (
                <div className="mb-6">
                  <SectionPreview
                    section={pageData.firstSection}
                    spacingConfig={resume.spacingConfig}
                    colorConfig={resume.colorConfig}
                  />
                </div>
              )}
              {(pageData.leftSections.length > 0 ||
                pageData.rightSections.length > 0) && (
                <div
                  className="resume-content-columns"
                  style={{
                    gridTemplateColumns: `${resume.layoutConfig.leftColumnWidth}% ${resume.layoutConfig.rightColumnWidth}%`,
                    display: "grid",
                    gap: "20px",
                  }}
                >
                  <div className="space-y-6">
                    {pageData.leftSections.map((section) => (
                      <SectionPreview
                        key={section.id}
                        section={section}
                        spacingConfig={resume.spacingConfig}
                        colorConfig={resume.colorConfig}
                      />
                    ))}
                  </div>
                  <div className="space-y-6">
                    {pageData.rightSections.map((section) => (
                      <SectionPreview
                        key={section.id}
                        section={section}
                        spacingConfig={resume.spacingConfig}
                        colorConfig={resume.colorConfig}
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
