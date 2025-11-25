import LinkIcon from "@mui/icons-material/Link";

const SectionPreview = ({
  section,
  spacingConfig,
  colorConfig,
  entryLayoutConfig,
  columnConfig,
}) => {
  // Calculate size multiplier for title/subtitle based on size setting
  const getSizeMultiplier = () => {
    const size = entryLayoutConfig?.size || "S";
    switch (size) {
      case "S":
        return 0.9;
      case "M":
        return 1;
      case "L":
        return 1.1;
      default:
        return 1;
    }
  };

  // Get subtitle font style
  const getSubtitleFontStyle = () => {
    const style = entryLayoutConfig?.subtitleStyle || "Normal";
    switch (style) {
      case "Bold":
        return { fontWeight: "700", fontStyle: "normal" };
      case "Italic":
        return { fontWeight: "400", fontStyle: "italic" };
      case "Normal":
      default:
        return { fontWeight: "400", fontStyle: "normal" };
    }
  };

  // Get description indent style
  const getDescriptionIndentStyle = () => {
    const indentBody = entryLayoutConfig?.indentBody || false;
    return indentBody ? { marginLeft: "1rem", paddingLeft: "0.5rem", borderLeft: "2px solid #e2e8f0" } : {};
  };

  // Color styles logic
  const getColorStyles = () => {
    if (!colorConfig) return {};
    const { mode, accentMode, multiAccentColor, selectedColor } = colorConfig;
    const accent =
      accentMode === "multi"
        ? multiAccentColor || "#2c3e50"
        : selectedColor || "#2c3e50";
    switch (mode) {
      case "basic":
      case "advanced":
        return accentMode === "multi"
          ? { color: accent, borderColor: accent }
          : selectedColor
          ? { color: selectedColor, borderColor: selectedColor }
          : {};
      case "border":
        return selectedColor
          ? { borderColor: selectedColor, color: "#1f2937" }
          : {};
      default:
        return {};
    }
  };

  // Get list style bullet/marker
  const getListBullet = () => {
    const style = entryLayoutConfig?.listStyle || "Bullet";
    return style === "Bullet" ? "•" : "–";
  };

  // Extract skills from HTML
  const extractSkills = (html) => {
    if (!html) return [];
    try {
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      const lis = tmp.querySelectorAll("li");
      if (lis.length)
        return Array.from(lis)
          .map((li) => li.textContent.trim())
          .filter(Boolean);
      return (tmp.textContent || "")
        .split(/[,|\n\r•\u2022]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    } catch {
      return [];
    }
  };

  // Helper for rendering title with link
  const renderTitle = (title, titleUrl, isCert, hasDescription) => {
    const sizeMultiplier = getSizeMultiplier();
    const titleFontSize = sizeMultiplier > 1 ? `${1.125 * sizeMultiplier}rem` : sizeMultiplier < 1 ? `${0.875 * sizeMultiplier}rem` : "0.875rem";
    
    return isCert && !hasDescription ? (
      <p
        className="resume-item-description text-slate-700"
        style={{ display: "flex", alignItems: "center", fontSize: titleFontSize }}
      >
        <span style={{ marginRight: "0.5rem" }}>{getListBullet()}</span>
        {titleUrl ? (
          <a
            href={titleUrl}
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: "normal" }}
          >
            {title}
            <LinkIcon
              fontSize="small"
              style={{
                verticalAlign: "middle",
                marginLeft: 4,
                opacity: 0.6,
              }}
            />
          </a>
        ) : (
          <span style={{ fontWeight: "normal" }}>{title}</span>
        )}
      </p>
    ) : (
      <h3 className="resume-item-title font-bold text-slate-900" style={{ fontSize: titleFontSize }}>
        {titleUrl ? (
          <a
            href={titleUrl}
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {title}
            <LinkIcon
              fontSize="small"
              style={{
                verticalAlign: "middle",
                marginLeft: 6,
                opacity: 0.6,
              }}
            />
          </a>
        ) : (
          title
        )}
      </h3>
    );
  };

  // Helper for rendering title with subtitle on same line (separated by comma)
  const renderTitleWithSubtitle = (title, subtitle, titleUrl, isCert, hasDescription) => {
    const sizeMultiplier = getSizeMultiplier();
    const titleFontSize = sizeMultiplier > 1 ? `${1.125 * sizeMultiplier}rem` : sizeMultiplier < 1 ? `${0.875 * sizeMultiplier}rem` : "0.875rem";
    const subtitleFontSize = sizeMultiplier > 1 ? `${0.875 * sizeMultiplier}rem` : sizeMultiplier < 1 ? `${0.75 * sizeMultiplier}rem` : "0.875rem";
    const subtitleStyle = getSubtitleFontStyle();
    
    return isCert && !hasDescription ? (
      <p
        className="resume-item-description text-slate-700"
        style={{ display: "flex", alignItems: "center", fontSize: titleFontSize, flexWrap: "wrap" }}
      >
        <span style={{ marginRight: "0.5rem" }}>{getListBullet()}</span>
        {titleUrl ? (
          <a
            href={titleUrl}
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: "normal" }}
          >
            {title}
            <LinkIcon
              fontSize="small"
              style={{
                verticalAlign: "middle",
                marginLeft: 4,
                opacity: 0.6,
              }}
            />
          </a>
        ) : (
          <span style={{ fontWeight: "normal" }}>{title}</span>
        )}
        {subtitle && (
          <>
            <span style={{ margin: "0 0.25rem" }}>,</span>
            <span className="resume-item-subtitle text-slate-700" style={{ ...subtitleStyle, fontSize: subtitleFontSize, display: "inline" }}>{subtitle}</span>
          </>
        )}
      </p>
    ) : (
      <div>
        <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "0.25rem", width: "100%" }}>
          <h3 className="resume-item-title font-bold text-slate-900" style={{ fontSize: titleFontSize, margin: 0, display: "inline-block" }}>
            {titleUrl ? (
              <a
                href={titleUrl}
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {title}
                <LinkIcon
                  fontSize="small"
                  style={{
                    verticalAlign: "middle",
                    marginLeft: 6,
                    opacity: 0.6,
                  }}
                />
              </a>
            ) : (
              title
            )}
          </h3>
          {subtitle && (
            <>
              <span style={{ fontSize: titleFontSize, display: "inline" }}>
                ,
              </span>
              <span className="resume-item-subtitle text-slate-700" style={{ ...subtitleStyle, fontSize: subtitleFontSize, margin: 0, display: "inline-block" }}>
                {subtitle}
              </span>
            </>
          )}
        </div>
      </div>
    );
  };

  // Helper for rendering subtitle/publication (only when on its own line)
  const renderSubtitleOrPublication = (item, isPublication) => {
    const sizeMultiplier = getSizeMultiplier();
    const subtitleFontSize = sizeMultiplier > 1 ? `${0.875 * sizeMultiplier}rem` : sizeMultiplier < 1 ? `${0.75 * sizeMultiplier}rem` : "0.875rem";
    const subtitleStyle = getSubtitleFontStyle();
    
    return isPublication ? (
      <>
        {item.data.publisher && (
          <p className="resume-item-subtitle text-slate-700" style={{ ...subtitleStyle, fontSize: subtitleFontSize }}>
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
      item.data.subtitle && (
        <p 
          className="resume-item-subtitle text-slate-700" 
          style={{ 
            ...subtitleStyle, 
            fontSize: subtitleFontSize,
            // marginTop: "0.25rem",
            marginBottom: "0.25rem"
          }}
        >
          {item.data.subtitle}
        </p>
      )
    );
  };

  // Main render
  return (
    <div className="mb-2">
      <h2
        className="resume-section-heading text-lg font-bold border-b-2 mb-2"
        style={getColorStyles()}
      >
        {section.name.toUpperCase()}
      </h2>
      <div>
        {section.items
          .filter((item) =>
            Object.prototype.hasOwnProperty.call(item, "visible")
              ? !!item.visible
              : true
          )
          .map((item) => {
            const sectionId = (section.id || "").toLowerCase();
            const sectionName = (section.name || "").toLowerCase();
            const isSkill =
              sectionId.includes("skill") || sectionName.includes("skill");
            const isCert =
              sectionId.includes("certif") || sectionName.includes("certif");
            const isEducation =
              sectionId.includes("educa") || sectionName.includes("educa");
            const isPublication =
              sectionId.includes("publication") ||
              sectionName.includes("publication");
            const hasDescription =
              !!item.data.description && !!item.data.description.trim();

            // Skills section
            if (isSkill) {
              const skills = extractSkills(item.data.description || "");
              const bullet = getListBullet();
              return (
                <div key={item.id} className="resume-entry-less-margin">
                  {item.data.title && (
                    <span className="resume-item-title font-bold text-slate-900 inline">
                      {item.data.titleUrl ? (
                        <a
                          href={item.data.titleUrl}
                          className="hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.data.title}
                        </a>
                      ) : (
                        item.data.title
                      )}
                      {skills.length > 0 && <span className="mx-2">—</span>}
                    </span>
                  )}
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
                          style={{
                            whiteSpace: "normal",
                            fontSize: "9pt",
                            fontWeight: "normal",
                          }}
                        >
                          {idx > 0 && (
                            <span
                              className="delimiter"
                              style={{
                                padding: "0 0.15em",
                                verticalAlign: "middle",
                                display: "inline-block",
                                opacity: 0.6,
                              }}
                            >
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  marginBottom: "0.25em",
                                  marginTop: "1px",
                                }}
                              >
                                {bullet}
                              </span>
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

            // Only handle con-date-loc and default layout
            const entryOrder = entryLayoutConfig?.entryOrder || [
              "content",
              "date",
              "location",
            ];
            const orderKey = entryOrder.join(",");
            if (orderKey === "content,date,location") {
              // con-date-loc: inline only for one-column, newline for others
              // For one-column: use the conDateLocDisplay setting (inline/newline)
              // For multi-column: always use newline
              const isOneColumn = !Array.from(["two","mix"]).includes(columnConfig);
              const conDateLocDisplay = isOneColumn
                ? (entryLayoutConfig?.conDateLocDisplay || "inline")
                : "newline"; // Force newline for multi-column
              if (conDateLocDisplay === "newline") {
                // Newline: content on first line, date/location on second line
                const subtitlePlacement = entryLayoutConfig?.subtitlePlacement || "Next Line";
                return (
                  <div
                    key={item.id}
                    className={`resume-entry ${
                      isCert && !hasDescription ? "resume-entry-no-margin" : ""
                    }`}
                  >
                    <div>
                      {item.data.title &&
                        (subtitlePlacement === "Try Same Line" && item.data.subtitle
                          ? renderTitleWithSubtitle(
                              item.data.title,
                              item.data.subtitle,
                              item.data.titleUrl,
                              isCert,
                              hasDescription
                            )
                          : renderTitle(
                              item.data.title,
                              item.data.titleUrl,
                              isCert,
                              hasDescription
                            ))}
                      {subtitlePlacement === "Next Line" && renderSubtitleOrPublication(item, isPublication)}
                    </div>
                    {(item.data.date || item.data.location) && (
                      <div className="flex justify-between items-center w-full mt-1">
                        <span className="resume-item-description text-xs text-slate-600">
                          {item.data.date}
                          {item.data.location && item.data.date ? " | " : ""}
                          {item.data.location}
                        </span>
                      </div>
                    )}
                    {item.data.description && (
                      <div
                        className={`resume-item-description text-sm text-slate-700 ${
                          isEducation ? "mt-0" : "mt-1"
                        }`}
                        style={{ lineHeight: spacingConfig.lineHeight, ...getDescriptionIndentStyle() }}
                        dangerouslySetInnerHTML={{
                          __html: item.data.description,
                        }}
                      />
                    )}
                  </div>
                );
              } else if (
                conDateLocDisplay === "inline"
              ) {
                // Inline: content left, date/location right
                const subtitlePlacement = entryLayoutConfig?.subtitlePlacement || "Next Line";
                return (
                  <div
                    key={item.id}
                    className={`resume-entry ${
                      isCert && !hasDescription ? "resume-entry-no-margin" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className="flex-1">
                        {item.data.title &&
                          (subtitlePlacement === "Try Same Line" && item.data.subtitle
                            ? renderTitleWithSubtitle(
                                item.data.title,
                                item.data.subtitle,
                                item.data.titleUrl,
                                isCert,
                                hasDescription
                              )
                            : renderTitle(
                                item.data.title,
                                item.data.titleUrl,
                                isCert,
                                hasDescription
                              ))}
                        {subtitlePlacement === "Next Line" && renderSubtitleOrPublication(item, isPublication)}
                      </div>
                      <span className="resume-item-description text-xs text-slate-600 text-right ml-4">
                        {item.data.date}
                        {item.data.location && item.data.date ? " | " : ""}
                        {item.data.location}
                      </span>
                    </div>
                    {item.data.description && (
                      <div
                        className={`resume-item-description text-sm text-slate-700 ${
                          isEducation ? "mt-0" : "mt-1"
                        }`}
                        style={{ lineHeight: spacingConfig.lineHeight, ...getDescriptionIndentStyle() }}
                        dangerouslySetInnerHTML={{
                          __html: item.data.description,
                        }}
                      />
                    )}
                  </div>
                );
              }
            } else {
              // Default layout (fallback)
              const subtitlePlacement = entryLayoutConfig?.subtitlePlacement || "Next Line";
              return (
                <div
                  key={item.id}
                  className={`resume-entry ${
                    isCert && !hasDescription ? "resume-entry-no-margin" : ""
                  }`}
                >
                  {item.data.title &&
                    (subtitlePlacement === "Try Same Line" && item.data.subtitle
                      ? renderTitleWithSubtitle(
                          item.data.title,
                          item.data.subtitle,
                          item.data.titleUrl,
                          isCert,
                          hasDescription
                        )
                      : renderTitle(
                          item.data.title,
                          item.data.titleUrl,
                          isCert,
                          hasDescription
                        ))}
                  {subtitlePlacement === "Next Line" && renderSubtitleOrPublication(item, isPublication)}
                  {(item.data.date || item.data.location) && !isPublication && (
                    <p className="resume-item-description text-xs text-slate-600">
                      {[item.data.date, item.data.location]
                        .filter(Boolean)
                        .join(" | ")}
                    </p>
                  )}
                  {item.data.description && (
                    <div
                      className={`resume-item-description text-sm text-slate-700 ${
                        isEducation ? "mt-0" : "mt-1"
                      }`}
                      style={{ lineHeight: spacingConfig.lineHeight, ...getDescriptionIndentStyle() }}
                      dangerouslySetInnerHTML={{
                        __html: item.data.description,
                      }}
                    />
                  )}
                </div>
              );
            }
          })}
      </div>
    </div>
  );
};

export default SectionPreview;
