import React from "react";

const SectionPreview = ({ section, spacingConfig }) => {
  // Helper: extract list items from HTML produced by the RichTextEditor.
  // If no <li> elements are present, fall back to splitting plain text by commas/newlines/pipes.
  const extractSkills = (html) => {
    if (!html) return [];
    try {
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      const lis = tmp.querySelectorAll("li");
      if (lis && lis.length) {
        return Array.from(lis)
          .map((li) => li.textContent.trim())
          .filter(Boolean);
      }
      // fallback: use text content and split by common separators
      const text = tmp.textContent || "";
      return text
        .split(/[,|\n\r•\u2022]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    } catch (e) {
      return [];
    }
  };

  return (
    <div className="mb-6">
      <h2 className="resume-section-heading text-lg font-bold text-slate-900 border-b-2 border-slate-900 pb-1 mb-2">
        {section.name.toUpperCase()}
      </h2>
      <div>
        {section.items.map((item) => {
          // Special rendering for skills: show "Category — skill1 | skill2 | ..."
          const sectionId = (section.id || "").toString().toLowerCase();
          const sectionName = (section.name || "").toString().toLowerCase();

          // Treat any section whose id or name contains "skill" as the skills section
          if (sectionId.includes("skill") || sectionName.includes("skill")) {
            const skills = extractSkills(item.data.description || "");
            // Always render skills as inline plain text. If no explicit list items found,
            // extractSkills will split by common separators from the plain text content.
            const inlineText = skills.length ? skills.join(" | ") : "";
            return (
              <div
                key={item.id}
                className="resume-entry flex items-center flex-wrap"
              >
                {item.data.title && (
                  <h3 className="resume-item-title font-bold text-slate-900 inline">
                    {item.data.title}
                    {inlineText && (
                      <>
                        <span className="mx-2">—</span>
                      </>
                    )}
                  </h3>
                )}
                <p
                  className="resume-item-description text-sm text-slate-700"
                  style={{ lineHeight: spacingConfig.lineHeight }}
                >
                  {inlineText}
                </p>
              </div>
            );
          }

          // Default rendering for non-skills sections
          return (
            <div key={item.id} className="resume-entry">
              {item.data.title && (
                <h3 className="resume-item-title font-bold text-slate-900">
                  {item.data.title}
                </h3>
              )}
              {item.data.subtitle && (
                <p className="resume-item-subtitle text-sm italic text-slate-700">
                  {item.data.subtitle}
                </p>
              )}
              {(item.data.date || item.data.location) && (
                <p className="resume-item-description text-xs text-slate-600">
                  {[item.data.date, item.data.location]
                    .filter(Boolean)
                    .join(" | ")}
                </p>
              )}
              {item.data.description && (
                <div
                  className="resume-item-description text-sm text-slate-700 mt-1"
                  style={{ lineHeight: spacingConfig.lineHeight }}
                  dangerouslySetInnerHTML={{ __html: item.data.description }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SectionPreview;
