import { useEffect, useState } from "react";
import SectionPreview from "./SectionPreview";
import ResumeHeader from "./ResumeHeader";
import { useResumePagination } from "../hooks/useResumePagination";
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
  entryLayoutConfig,
}) => {
  // Use the pagination hook
  const { pages, measureRef } = useResumePagination({
    sections: resume.sections,
    sectionOrder: resume.sectionOrder,
    layoutConfig: resume.layoutConfig,
    spacingConfig: resume.spacingConfig,
    A4_HEIGHT_PX,
    selectedFont: resume.selectedFont,
  });

  // Helper to render Header (reused for measurement and rendering)
  const renderHeader = () => {
    const headerAlign = resume.personalConfig?.align || "center";
    const headerPosition = resume.layoutConfig?.headerPosition || "top";
    const headerClass =
      headerAlign === "left"
        ? "resume-header flex gap-6 items-center"
        : headerAlign === "right"
        ? "resume-header flex gap-6 flex-row-reverse items-center"
        : "resume-header block";

    // Determine if header is in a column (left/right position)
    const isHeaderInColumn = headerPosition === "left" || headerPosition === "right";
    // Conversion factor: different when header is in column vs standalone
    const marginMultiplier = isHeaderInColumn ? 3.0 : 3.78;

    return (
      <div
        className={headerClass}
        style={{
          textAlign: resume.personalConfig.align,
          // Advanced mode with accent: single color header background
          ...(resume.colorConfig?.mode === "advanced" &&
          resume.colorConfig?.accentMode === "accent" &&
          resume.colorConfig?.selectedColor
            ? {
                backgroundColor: resume.colorConfig.selectedColor,
                color: "#ffffff",
                padding: "1.5rem",
                marginLeft: `-${resume.spacingConfig.marginLR * marginMultiplier}px`,
                marginRight: `-${resume.spacingConfig.marginLR * marginMultiplier}px`,
                marginTop: `-${resume.spacingConfig.marginTB * marginMultiplier}px`,
                marginBottom: "1.5rem",
              }
            : // Advanced mode with multi: separate header background color
            resume.colorConfig?.mode === "advanced" &&
              resume.colorConfig?.accentMode === "multi"
            ? {
                backgroundColor:
                  resume.colorConfig.multiHeaderBackgroundColor ||
                  resume.colorConfig.multiAccentColor ||
                  "#2c3e50",
                color: "#ffffff",
                padding: "1.5rem",
                marginLeft: `-${resume.spacingConfig.marginLR * marginMultiplier}px`,
                marginRight: `-${resume.spacingConfig.marginLR * marginMultiplier}px`,
                marginTop: `-${resume.spacingConfig.marginTB * marginMultiplier}px`,
                marginBottom: "0.5rem",
              }
            : // Advanced mode with image: background image in header
            resume.colorConfig?.mode === "advanced" &&
              resume.colorConfig?.accentMode === "image" &&
              resume.colorConfig?.selectedImage
            ? {
                backgroundImage: `linear-gradient(rgba(0, 0, 0, ${
                  resume.colorConfig.imageOpacity || 0.3
                }), rgba(0, 0, 0, ${
                  resume.colorConfig.imageOpacity || 0.3
                })), url(${resume.colorConfig.selectedImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                color: "#ffffff",
                padding: "1.5rem",
                marginLeft: `-${resume.spacingConfig.marginLR * marginMultiplier}px`,
                marginRight: `-${resume.spacingConfig.marginLR * marginMultiplier}px`,
                marginTop: `-${resume.spacingConfig.marginTB * marginMultiplier}px`,
                marginBottom: "1.5rem",
              }
            : {}),
        }}
      >
        {/* If personal align is left/right, render photo as a sibling so flex places it at the outer edge */}
        {resume.formData.photoUrl &&
          (headerAlign === "left" || headerAlign === "right") && (
            <div
              className={`${
                headerAlign === "top" ? "h-24 w-24" : "h-20 w-20"
              } rounded-full overflow-hidden border-2 ${
                (resume.colorConfig?.mode === "advanced" &&
                  resume.colorConfig?.accentMode === "accent" &&
                  resume.colorConfig?.selectedColor) ||
                (resume.colorConfig?.mode === "advanced" &&
                  resume.colorConfig?.accentMode === "multi")
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
  };

  // Helper to render Profile (reused for measurement and rendering)
  const renderProfile = () => {
    if (!resume.formData.profile) return null;
    return (
      <div className="mt-6 mb-6">
        <h2 className="resume-section-heading text-lg font-bold text-slate-900 border-b-2 border-slate-900 mb-4">
          PROFILE
        </h2>
        <div
          className="resume-item-description text-sm text-slate-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: resume.formData.profile }}
        />
      </div>
    );
  };

  // Render a single page
  const renderPage = (pageData, pageIndex) => {
    const isFirstPage = pageIndex === 0;
    const headerPosition = resume.layoutConfig?.headerPosition || "top";
    const isTwoColumnLayout = resume.layoutConfig?.columns === "two";
    const shouldShowHeaderInColumn = isTwoColumnLayout && (headerPosition === "left" || headerPosition === "right");
    
    // Margin multiplier changes based on header position
    const marginMultiplier = 3.78;

    return (
      <div
        key={pageIndex}
        className="resume-page"
        style={{
          width: `${A4_WIDTH_PX}px`,
          height: `${A4_HEIGHT_PX}px`,
          padding: `${resume.spacingConfig.marginTB * 3.78}px`,
          // Apply background color for multicolor mode (both basic and advanced)
          ...(resume.colorConfig?.accentMode === "multi" &&
          resume.colorConfig?.multiBackgroundColor
            ? {
                backgroundColor: resume.colorConfig.multiBackgroundColor,
              }
            : {}),
          // Apply border for border mode with color
          ...(resume.colorConfig?.mode === "border" &&
          resume.colorConfig?.accentMode === "accent" &&
          resume.colorConfig?.selectedColor
            ? {
                border: `8px solid ${resume.colorConfig.selectedColor}`,
              }
            : {}),
          // Apply border with image pattern for border mode with image
          ...(resume.colorConfig?.mode === "border" &&
          resume.colorConfig?.accentMode === "image" &&
          resume.colorConfig?.selectedImage
            ? {
                border: `12px solid transparent`,
                borderImage: `url(${resume.colorConfig.selectedImage}) 30 round`,
                borderImageSlice: 30,
              }
            : {}),
          // Apply background image for basic image mode (full page)
          ...(resume.colorConfig?.mode === "basic" &&
          resume.colorConfig?.accentMode === "image" &&
          resume.colorConfig?.selectedImage
            ? {
                backgroundImage: `linear-gradient(rgba(255, 255, 255, ${
                  1 - (resume.colorConfig.imageOpacity || 0.3)
                }), rgba(255, 255, 255, ${
                  1 - (resume.colorConfig.imageOpacity || 0.3)
                })), url(${resume.colorConfig.selectedImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }
            : {}),
        }}
      >
        {/* Header (only on first page, and only at top if not in column layout) */}
        {isFirstPage && headerPosition === "top" && renderHeader()}

        {/* Profile section (only on first page) */}
        {isFirstPage && renderProfile()}

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
                  entryLayoutConfig={entryLayoutConfig}
                  columnConfig={resume.layoutConfig.columns}
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
              <div 
                className="space-y-6 column-header-colored-left"
                style={{
                  // Apply header colors to left column when header is positioned left and advanced multicolor is enabled
                  ...(shouldShowHeaderInColumn && headerPosition === "left" && 
                    resume.colorConfig?.mode === "advanced" && 
                    resume.colorConfig?.accentMode === "multi"
                    ? {
                        backgroundColor:
                          resume.colorConfig.multiHeaderBackgroundColor ||
                          resume.colorConfig.multiAccentColor ||
                          "#2c3e50",
                        color: resume.colorConfig.multiHeaderTextColor || "#ffffff",
                        padding: `${resume.spacingConfig.marginTB * 3.78}px`,
                        marginLeft: `-${resume.spacingConfig.marginLR * marginMultiplier}px`,
                        marginRight: "10px",
                        marginTop: `-${resume.spacingConfig.marginTB * marginMultiplier}px`,
                        marginBottom: "0.5rem",
                        
                        // minHeight: `${A4_HEIGHT_PX - resume.spacingConfig.marginTB * 3.78 * 2}px`,
                        minHeight: `${A4_HEIGHT_PX}px`,
                      }
                    : {}),
                }}
              >
                {isFirstPage && shouldShowHeaderInColumn && headerPosition === "left" && (
                  <style>{`
                    .column-header-colored-left,
                    .column-header-colored-left * {
                      color: ${resume.colorConfig.multiHeaderTextColor || "#ffffff"} !important;
                    }
                  `}</style>
                )}
                {/* Header in left column if headerPosition is "left" */}
                {isFirstPage && shouldShowHeaderInColumn && headerPosition === "left" && renderHeader()}
                {pageData.leftSections.map((section) => (
                  <SectionPreview
                    key={section.id}
                    section={section}
                    spacingConfig={resume.spacingConfig}
                    colorConfig={resume.colorConfig}
                    entryLayoutConfig={entryLayoutConfig}
                    columnConfig={resume.layoutConfig.columns}
                  />
                ))}
              </div>
              <div 
                className="space-y-6 column-header-colored-right"
                style={{
                  // Apply header colors to right column when header is positioned right and advanced multicolor is enabled
                  ...(shouldShowHeaderInColumn && headerPosition === "right" && 
                    resume.colorConfig?.mode === "advanced" && 
                    resume.colorConfig?.accentMode === "multi"
                    ? {
                        backgroundColor:
                          resume.colorConfig.multiHeaderBackgroundColor ||
                          resume.colorConfig.multiAccentColor ||
                          "#2c3e50",
                        color: resume.colorConfig.multiHeaderTextColor || "#ffffff",
                        padding: "1.5rem",
                        marginRight: `-${resume.spacingConfig.marginLR * marginMultiplier}px`,
                        marginLeft: "10px",
                        marginTop: `-${resume.spacingConfig.marginTB * marginMultiplier}px`,
                        marginBottom: "0.5rem",
                        // minHeight: `${A4_HEIGHT_PX - resume.spacingConfig.marginTB * 3.78 * 2}px`,
                        minHeight: `${A4_HEIGHT_PX}px`,
                      }
                    : {}),
                }}
              >
                {isFirstPage && shouldShowHeaderInColumn && headerPosition === "right" && (
                  <style>{`
                    .column-header-colored-right,
                    .column-header-colored-right * {
                      color: ${resume.colorConfig.multiHeaderTextColor || "#ffffff"} !important;
                    }
                  `}</style>
                )}
                {/* Header in right column if headerPosition is "right" */}
                {isFirstPage && shouldShowHeaderInColumn && headerPosition === "right" && renderHeader()}
                {pageData.rightSections.map((section) => (
                  <SectionPreview
                    key={section.id}
                    section={section}
                    spacingConfig={resume.spacingConfig}
                    colorConfig={resume.colorConfig}
                    entryLayoutConfig={entryLayoutConfig}
                    columnConfig={resume.layoutConfig.columns}
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
                    entryLayoutConfig={entryLayoutConfig}
                    columnConfig={resume.layoutConfig.columns}
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
                  <div 
                    className="space-y-6 column-header-colored-left"
                    style={{
                      // Apply header colors to left column when header is positioned left and advanced multicolor is enabled
                      ...(shouldShowHeaderInColumn && headerPosition === "left" && 
                        resume.colorConfig?.mode === "advanced" && 
                        resume.colorConfig?.accentMode === "multi"
                        ? {
                            backgroundColor:
                              resume.colorConfig.multiHeaderBackgroundColor ||
                              resume.colorConfig.multiAccentColor ||
                              "#2c3e50",
                            color: resume.colorConfig.multiHeaderTextColor || "#ffffff",
                            padding: "1.5rem",
                            marginLeft: `-${resume.spacingConfig.marginLR * marginMultiplier}px`,
                            marginRight: "10px",
                            marginTop: "0px",
                            marginBottom: "0.5rem",
                            minHeight: `${A4_HEIGHT_PX - resume.spacingConfig.marginTB * 3.78 * 2}px`,
                          }
                        : {}),
                    }}
                  >
                    {isFirstPage && shouldShowHeaderInColumn && headerPosition === "left" && (
                      <style>{`
                        .column-header-colored-left,
                        .column-header-colored-left * {
                          color: ${resume.colorConfig.multiHeaderTextColor || "#ffffff"} !important;
                        }
                      `}</style>
                    )}
                    {/* Header in left column if headerPosition is "left" */}
                    {isFirstPage && shouldShowHeaderInColumn && headerPosition === "left" && renderHeader()}
                    {pageData.leftSections.map((section) => (
                      <SectionPreview
                        key={section.id}
                        section={section}
                        spacingConfig={resume.spacingConfig}
                        colorConfig={resume.colorConfig}
                        entryLayoutConfig={entryLayoutConfig}
                        columnConfig={resume.layoutConfig.columns}
                      />
                    ))}
                  </div>
                  <div 
                    className="space-y-6 column-header-colored-right"
                    style={{
                      // Apply header colors to right column when header is positioned right and advanced multicolor is enabled
                      ...(shouldShowHeaderInColumn && headerPosition === "right" && 
                        resume.colorConfig?.mode === "advanced" && 
                        resume.colorConfig?.accentMode === "multi"
                        ? {
                            backgroundColor:
                              resume.colorConfig.multiHeaderBackgroundColor ||
                              resume.colorConfig.multiAccentColor ||
                              "#2c3e50",
                            color: resume.colorConfig.multiHeaderTextColor || "#ffffff",
                            padding: "1.5rem",
                            marginRight: `-${resume.spacingConfig.marginLR * marginMultiplier}px`,
                            marginLeft: "10px",
                            marginTop: "0px",
                            marginBottom: "0.5rem",
                            minHeight: `${A4_HEIGHT_PX - resume.spacingConfig.marginTB * 3.78 * 2}px`,
                            // minHeight: `${A4_HEIGHT_PX}px`,
                          }
                        : {}),
                    }}
                  >
                    {isFirstPage && shouldShowHeaderInColumn && headerPosition === "right" && (
                      <style>{`
                        .column-header-colored-right,
                        .column-header-colored-right * {
                          color: ${resume.colorConfig.multiHeaderTextColor || "#ffffff"} !important;
                        }
                      `}</style>
                    )}
                    {/* Header in right column if headerPosition is "right" */}
                    {isFirstPage && shouldShowHeaderInColumn && headerPosition === "right" && renderHeader()}
                    {pageData.rightSections.map((section) => (
                      <SectionPreview
                        key={section.id}
                        section={section}
                        spacingConfig={resume.spacingConfig}
                        colorConfig={resume.colorConfig}
                        entryLayoutConfig={entryLayoutConfig}
                        columnConfig={resume.layoutConfig.columns}
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
    <div className="resume-pages-container" style={{ position: "relative" }}>
      {/* Hidden Measurement Container */}
      <div
        ref={measureRef}
        id="measure-container"
        style={{
          position: "absolute",
          visibility: "hidden",
          zIndex: -1,
          width: `${A4_WIDTH_PX - resume.spacingConfig.marginLR * 3.78 * 2}px`,
          padding: 0,
        }}
      >
        <div
          id="measure-header"
          style={{
            width:
              (resume.layoutConfig.headerPosition === "left" ||
                resume.layoutConfig.headerPosition === "right") &&
              (resume.layoutConfig.columns === "two" ||
                resume.layoutConfig.columns === "mix")
                ? `${
                    resume.layoutConfig.headerPosition === "left"
                      ? resume.layoutConfig.leftColumnWidth
                      : resume.layoutConfig.rightColumnWidth
                  }%`
                : "100%",
          }}
        >
          {renderHeader()}
        </div>
        <div id="measure-profile">{renderProfile()}</div>
        {resume.sections.map((section) => {
          // Determine width for this section based on layout
          let width = "100%";
          if (resume.layoutConfig.columns === "two") {
            width = `${resume.layoutConfig.leftColumnWidth}%`;
          } else if (resume.layoutConfig.columns === "mix") {
            if (section.id !== resume.sectionOrder[0]) {
              width = `${resume.layoutConfig.leftColumnWidth}%`;
            }
          }

          return (
            <div
              key={section.id}
              data-section-id={section.id}
              style={{ width }}
            >
              <SectionPreview
                section={section}
                spacingConfig={resume.spacingConfig}
                colorConfig={resume.colorConfig}
                entryLayoutConfig={entryLayoutConfig}
                columnConfig={resume.layoutConfig.columns}
              />
            </div>
          );
        })}
      </div>

      {pages.map((pageData, index) => renderPage(pageData, index))}
    </div>
  );
};

export default MultiPageResume;
