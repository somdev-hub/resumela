import React from "react";
import LinkIcon from "@mui/icons-material/Link";

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
    <div className="mb-2">
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
                className="resume-entry-less-margin"
              >
                {item.data.title && (
                  <span className="resume-item-title font-bold text-slate-900 inline">
                    {item.data.titleUrl ? (
                      <a href={item.data.titleUrl} className="hover:underline" target="_blank" rel="noopener noreferrer">
                        {item.data.title}
                      </a>
                    ) : (
                      item.data.title
                    )}
                    {inlineText && (
                      <>
                        <span className="mx-2">—</span>
                      </>
                    )}
                  </span>
                )}
                {/* Render skills as inline spans so they wrap naturally instead of forcing a new paragraph line */}
                {skills.length > 0 && (
                  <span
                    className="resume-item-description text-sm text-slate-700"
                    style={{
                      lineHeight: spacingConfig.lineHeight,
                      whiteSpace: "normal",
                      overflowWrap: "break-word",
                    }}
                  >
                    {skills.map((sk, idx) => (
                      <span
                        key={idx}
                        style={{ whiteSpace: "normal", fontSize: "9pt", fontWeight: "normal" }}
                      >
                        {idx > 0 && (
                          <span
                            className="delimiter"
                            style={{ padding: "0 0.15em", verticalAlign: "middle", display: "inline-block", opacity: 0.6 }}
                          >
                            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.25em", marginTop: "1px" }}>|</span>
                          </span>
                        )}
                        {idx > 0 ? <>&nbsp;{sk}</> : sk}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            );
          }

          // Default rendering for non-skills sections
          const isCert = sectionId.includes("certif") || sectionName.includes("certif");
          const hasDescription = Boolean(item.data.description && item.data.description.trim());

          return (
            <div key={item.id} className={`resume-entry ${isCert && !hasDescription ? "resume-entry-no-margin" : ""}`}>
              {item.data.title && (
                // For certificates without a description render a simple bullet + normal-weight title
                isCert && !hasDescription ? (
                  <p className="resume-item-description text-sm text-slate-700" style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: "0.5rem" }}>•</span>
                    {item.data.titleUrl ? (
                      <a href={item.data.titleUrl} className="hover:underline" target="_blank" rel="noopener noreferrer" style={{ fontWeight: "normal" }}>
                        {item.data.title}
                        <LinkIcon fontSize="small" style={{ verticalAlign: "middle", marginLeft: 4, opacity: 0.6 }} />
                      </a>
                    ) : (
                      <span style={{ fontWeight: "normal" }}>{item.data.title}</span>
                    )}
                  </p>
                ) : (
                  // Default: bold title (works for certificates with descriptions and other sections)
                  <h3 className="resume-item-title font-bold text-slate-900">
                    {item.data.titleUrl ? (
                      <a href={item.data.titleUrl} className="hover:underline" target="_blank" rel="noopener noreferrer">
                        {item.data.title}
                        <LinkIcon fontSize="small" style={{ verticalAlign: "middle", marginLeft: 6, opacity: 0.6 }} />
                      </a>
                    ) : (
                      item.data.title
                    )}
                  </h3>
                )
              )}
                  {/* Publication entries use publisher and publicationDate fields */}
                  {(sectionId.includes("publication") || sectionName.includes("publication")) ? (
                    <>
                      {item.data.publisher && (
                        <p className="resume-item-subtitle text-sm italic text-slate-700">
                          {item.data.publisher}
                        </p>
                      )}
                      {item.data.publicationDate && (
                        <p className="resume-item-description text-xs text-slate-600">
                          {item.data.publicationDate}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
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
                    </>
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
