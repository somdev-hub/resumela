import React from "react";
import MultiPageResume from "./MultiPageResume";

const ResumePreview = ({
  resume,
  A4_WIDTH_PX,
  A4_HEIGHT_PX,
  entryLayoutConfig,
  combinedPreviewRef,
  formatLastSaved,
  lastSavedAt,
  isSaving,
  loadDocId,
  setLoadDocId,
  loadFromFirestore,
  saveToFirestore,
  scale = null, // Optional scale override (e.g., for card display)
}) => {
  // fallback to basic values if undefined
  const fontSize = resume?.spacingConfig?.fontSize || 9;
  const lineHeight = resume?.spacingConfig?.lineHeight || 1.25;
  const entrySpacing = resume?.spacingConfig?.entrySpacing || 0;

  // If scale is not provided, calculate based on window width (for full page view)
  const finalScale =
    scale !== null
      ? scale
      : typeof window !== "undefined"
      ? Math.min((window.innerWidth - 32) / A4_WIDTH_PX, 1)
      : 1;

  return (
    <div className="relative" id="preview-resume">
      <div
        ref={combinedPreviewRef}
        id="resume-preview"
        className="resume-preview relative"
        style={{
          ["--resume-font-size"]: `${fontSize}pt`,
          ["--resume-line-height"]: lineHeight,
          ["--resume-entry-spacing"]: `${entrySpacing}px`,
          fontFamily: resume?.selectedFont?.family
            ? `'${resume.selectedFont.family}', serif`
            : undefined,
          width: A4_WIDTH_PX,
          minHeight: A4_HEIGHT_PX,
          maxWidth: "100%",
          transform: `scale(${finalScale})`,
          transformOrigin: "top center",
        }}
      >
        <style>{`
          .resume-preview {
            --resume-size-name: calc(var(--resume-font-size) * 2.2);
            --resume-size-role: calc(var(--resume-font-size) * 1.5);
            --resume-size-section: calc(var(--resume-font-size) * 1.25);
            --resume-size-title: calc(var(--resume-font-size) * ${
              entryLayoutConfig?.size === "L"
                ? 1.1
                : entryLayoutConfig?.size === "S"
                ? 0.9
                : 1.05
            });
            --resume-size-subtitle: calc(var(--resume-font-size) * ${
              entryLayoutConfig?.size === "L"
                ? 1.05
                : entryLayoutConfig?.size === "S"
                ? 0.85
                : 1
            });
            --resume-size-body: calc(var(--resume-font-size) * 1);
            font-size: var(--resume-size-body);
            line-height: var(--resume-line-height);
          }
          .resume-preview .resume-name { font-size: var(--resume-size-name) !important; line-height: 1.05 !important; }
          .resume-preview .resume-role { font-size: var(--resume-size-role) !important; font-style: italic !important; }
          .resume-preview .resume-section-heading { font-size: var(--resume-size-section) !important; font-weight: 700 !important; }
          .resume-preview .resume-item-title { font-size: var(--resume-size-title) !important; font-weight: 700 !important; }
          .resume-preview .resume-item-subtitle { font-size: var(--resume-size-subtitle) !important; color: #4B5563 !important; }
          .resume-preview .resume-item-description { font-size: var(--resume-size-body) !important; line-height: var(--resume-line-height) !important; color:black; }
          .resume-preview .resume-entry { margin-bottom: var(--resume-entry-spacing) !important; }
          .resume-preview .resume-entry-no-margin { margin-bottom: 0 !important; }
          .resume-preview .resume-entry-less-margin { margin-bottom: calc(var(--resume-entry-spacing) * 0.5) !important; }
        `}</style>

        <MultiPageResume
          resume={resume}
          A4_WIDTH_PX={A4_WIDTH_PX}
          A4_HEIGHT_PX={A4_HEIGHT_PX}
          formatLastSaved={formatLastSaved}
          lastSavedAt={lastSavedAt}
          isSaving={isSaving}
          loadDocId={loadDocId}
          setLoadDocId={setLoadDocId}
          loadFromFirestore={loadFromFirestore}
          saveToFirestore={saveToFirestore}
          entryLayoutConfig={entryLayoutConfig}
        />
      </div>
    </div>
  );
};

export default ResumePreview;
