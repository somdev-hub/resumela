import { useMemo } from "react";
import { Chip } from "@mui/material";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa";

const CoverLetterPreview = ({
  formData,
  spacingConfig,
  selectedFont,
  personalConfig,
  colorConfig,
  combinedPreviewRef,
}) => {
  const A4_WIDTH_PX = 794;
  const A4_HEIGHT_PX = 1123;
  const PX_PER_MM = 3.78;
  const paddingLR = Math.round((spacingConfig.marginLR || 10) * PX_PER_MM);
  const paddingTB = Math.round((spacingConfig.marginTB || 10) * PX_PER_MM);

  const hasAccentBackground = colorConfig?.mode === "advanced" && 
                               colorConfig?.accentMode === "accent" && 
                               colorConfig?.selectedColor;
  
  const hasImageBackground = colorConfig?.mode === "advanced" && 
                              colorConfig?.accentMode === "image" && 
                              colorConfig?.selectedImage;
  
  const isBasicMultiMode = colorConfig?.mode === "basic" && colorConfig?.accentMode === "multi";
  const isAdvancedMultiMode = colorConfig?.mode === "advanced" && colorConfig?.accentMode === "multi";

  const contactLine = useMemo(() => {
    return [formData.email, formData.phone, formData.location]
      .filter(Boolean)
      .join(" | ");
  }, [formData.email, formData.phone, formData.location]);

  const secondaryLine = useMemo(() => {
    return [formData.linkedin, formData.github].filter(Boolean).join(" | ");
  }, [formData.github, formData.linkedin]);

  const renderContactInfo = () => {
    const contactItems = [
      { value: formData.email, type: "email", icon: <FaEnvelope /> },
      { value: formData.phone, type: "phone", icon: <FaPhone /> },
      { value: formData.location, type: "location", icon: <FaMapMarkerAlt /> },
      { value: formData.linkedin, type: "linkedin", icon: <FaLinkedin /> },
      { value: formData.github, type: "github", icon: <FaGithub /> },
    ].filter((item) => item.value);

    const textColor = hasAccentBackground || isAdvancedMultiMode || hasImageBackground ? "#ffffff" : 
                     isBasicMultiMode ? colorConfig.multiTextColor || "#4b5563" : 
                     "#4b5563";

    if (personalConfig.contactStyle === "bullet") {
      return (
        <p
          className="resume-contact-line"
          style={{
            marginTop: "0.5rem",
            color: textColor,
          }}
        >
          {contactItems.map((item, i) => (
            <span key={i}>
              {i > 0 && <span style={{ margin: "0 0.5rem" }}>•</span>}
              {item.value}
            </span>
          ))}
        </p>
      );
    }

    if (personalConfig.contactStyle === "bar") {
      return (
        <p
          className="resume-contact-line"
          style={{
            marginTop: "0.5rem",
            color: textColor,
          }}
        >
          {contactItems.map((item, i) => (
            <span key={i}>
              {i > 0 && <span style={{ margin: "0 0.5rem" }}>|</span>}
              {item.value}
            </span>
          ))}
        </p>
      );
    }

    // icon style: render with icons
    return (
      <div 
        className="mt-2 flex items-center justify-center gap-4 flex-wrap"
        style={{ color: textColor }}
      >
        {contactItems.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            <span className="inline-flex" style={{ fontSize: "0.875em", color: hasAccentBackground || isAdvancedMultiMode || hasImageBackground ? "rgba(255,255,255,0.8)" : undefined }}>{item.icon}</span>
            <span>{item.value}</span>
          </span>
        ))}
      </div>
    );
  };

  return (
    <section className="md:flex-[0_0_auto] h-full flex justify-center flex-col">
      <div className="flex-1 overflow-auto hide-scrollbar py-6">
        <div className="flex items-start justify-center">
          <div className="relative" id="preview-coverletter">
            <div
              ref={combinedPreviewRef}
              id="coverletter-preview"
              className="coverletter-preview relative"
              style={{
                padding: `${paddingTB}px ${paddingLR}px`,
                width: A4_WIDTH_PX,
                minHeight: A4_HEIGHT_PX,
                maxWidth: "100%",
                background: colorConfig?.accentMode === "multi" && 
                           colorConfig?.multiBackgroundColor 
                  ? colorConfig.multiBackgroundColor 
                  : "#fff",
                boxShadow: "0 6px 18px rgba(15,23,42,0.08)",
                border: colorConfig?.mode === "border" && colorConfig?.accentMode === "accent" && colorConfig?.selectedColor
                  ? `8px solid ${colorConfig.selectedColor}`
                  : "1px solid rgba(0,0,0,0.06)",
                borderRadius: 6,
                boxSizing: "border-box",
                // Apply border with image pattern for border mode with image
                ...(colorConfig?.mode === "border" && 
                    colorConfig?.accentMode === "image" &&
                    colorConfig?.selectedImage ? {
                  border: `12px solid transparent`,
                  borderImage: `url(${colorConfig.selectedImage}) 30 round`,
                  borderImageSlice: 30,
                } : {}),
                // Apply background image for basic image mode (full page)
                ...(colorConfig?.mode === "basic" &&
                    colorConfig?.accentMode === "image" && 
                    colorConfig?.selectedImage ? {
                  backgroundImage: `linear-gradient(rgba(255, 255, 255, ${1 - (colorConfig.imageOpacity || 0.3)}), rgba(255, 255, 255, ${1 - (colorConfig.imageOpacity || 0.3)})), url(${colorConfig.selectedImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                } : {}),
                ["--resume-font-size"]: `${spacingConfig.fontSize}pt`,
                ["--resume-line-height"]: spacingConfig.lineHeight,
                ["--resume-entry-spacing"]: `${spacingConfig.entrySpacing}px`,
                fontFamily: selectedFont.family
                  ? `'${selectedFont.family}', ${
                      selectedFont.category === "sans"
                        ? "sans-serif"
                        : selectedFont.category === "mono"
                        ? "monospace"
                        : "serif"
                    }`
                  : undefined,
              }}
            >
              <style>{`
                /* Derived sizes to create a typographic hierarchy based on the base font size */
                .coverletter-preview {
                  --resume-size-name: calc(var(--resume-font-size) * 2.2);
                  --resume-size-role: calc(var(--resume-font-size) * 1.5);
                  --resume-size-body: calc(var(--resume-font-size) * 1);
                  font-size: var(--resume-size-body);
                  line-height: var(--resume-line-height);
                }
                
                /* Name - Highest in hierarchy */
                .coverletter-preview h1,
                .coverletter-preview .resume-name { 
                  font-size: var(--resume-size-name) !important; 
                  line-height: 1.05 !important;
                  font-weight: 700 !important;
                  margin: 0 0 0.25rem 0 !important;
                }
                
                /* Role/Title - Second in hierarchy */
                .coverletter-preview h2,
                .coverletter-preview .resume-role { 
                  font-size: var(--resume-size-role) !important; 
                  line-height: 1.2 !important;
                  font-style: italic !important;
                  font-weight: 400 !important;
                  margin: 0 0 0.5rem 0 !important;
                }
                
                /* Everything else - Same base font size */
                .coverletter-preview p,
                .coverletter-preview span,
                .coverletter-preview div,
                .coverletter-preview li {
                  font-size: var(--resume-size-body) !important;
                  line-height: var(--resume-line-height) !important;
                }
                
                .coverletter-preview p {
                  margin: 0.5rem 0 !important;
                }
                
                .coverletter-preview .letter-header {
                  text-align: ${personalConfig.align || "center"} !important;
                  border-bottom: 1px solid #e5e7eb;
                  padding-bottom: 1rem;
                  margin-bottom: 1.5rem;
                }
                
                .coverletter-preview .letter-body {
                  font-size: var(--resume-size-body) !important;
                  line-height: var(--resume-line-height) !important;
                }
                
                .coverletter-preview .letter-body p,
                .coverletter-preview .letter-body span {
                  font-size: var(--resume-size-body) !important;
                  line-height: var(--resume-line-height) !important;
                }
                
                .coverletter-preview .letter-body ul,
                .coverletter-preview .letter-body ol {
                  margin: 0.75rem 0 !important;
                  padding-left: 2rem !important;
                }
                
                .coverletter-preview .letter-body li {
                  margin: 0.25rem 0 !important;
                  font-size: var(--resume-size-body) !important;
                  line-height: var(--resume-line-height) !important;
                }
                
                /* Contact info consistent sizing */
                .coverletter-preview .resume-contact-line,
                .coverletter-preview .resume-contact-line span {
                  font-size: var(--resume-size-body) !important;
                  line-height: var(--resume-line-height) !important;
                }
                
              `}</style>

              <Chip
                label="Live preview"
                color="primary"
                size="small"
                sx={{ position: "absolute", top: 16, right: 16 }}
              />

              {/* Header */}
              {(() => {
                const headerAlign = personalConfig?.align || "center";
                const headerStyle = {
                  ...(hasAccentBackground ? {
                    backgroundColor: colorConfig.selectedColor,
                    color: "#ffffff",
                    padding: "1.5rem",
                    marginLeft: `-${paddingLR}px`,
                    marginRight: `-${paddingLR}px`,
                    marginTop: `-${paddingTB}px`,
                    marginBottom: "1.5rem",
                  } : isAdvancedMultiMode ? {
                    backgroundColor: colorConfig.multiHeaderBackgroundColor || colorConfig.multiAccentColor || "#2c3e50",
                    color: "#ffffff",
                    padding: "1.5rem",
                    marginLeft: `-${paddingLR}px`,
                    marginRight: `-${paddingLR}px`,
                    marginTop: `-${paddingTB}px`,
                    marginBottom: "1.5rem",
                  } : 
                  // Advanced mode with image: background image in header
                  colorConfig?.mode === "advanced" && 
                  colorConfig?.accentMode === "image" &&
                  colorConfig?.selectedImage ? {
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, ${colorConfig.imageOpacity || 0.3}), rgba(0, 0, 0, ${colorConfig.imageOpacity || 0.3})), url(${colorConfig.selectedImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    color: "#ffffff",
                    padding: "1.5rem",
                    marginLeft: `-${paddingLR}px`,
                    marginRight: `-${paddingLR}px`,
                    marginTop: `-${paddingTB}px`,
                    marginBottom: "1.5rem",
                  } : {})
                };

                const headerClass = headerAlign === "left"
                  ? "letter-header flex gap-6 items-center"
                  : headerAlign === "right"
                  ? "letter-header flex gap-6 flex-row-reverse items-center"
                  : "letter-header";

                return (
                  <div className={headerClass} style={headerStyle}>
                    {/* If align is left/right render photo as sibling so flex places at edge */}
                    {formData.photoUrl && (headerAlign === "left" || headerAlign === "right") && (
                      <div className={`${headerAlign === "left" || headerAlign === "right" ? "h-20 w-20" : "h-24 w-24"} rounded-full overflow-hidden border-2 ${
                        (colorConfig?.mode === "advanced" && colorConfig?.accentMode === "accent" && colorConfig?.selectedColor) ||
                        (colorConfig?.mode === "advanced" && colorConfig?.accentMode === "multi")
                          ? "border-white"
                          : "border-slate-200"
                      } flex-shrink-0`}>
                        <img src={formData.photoUrl} alt="profile" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className={headerAlign === "center" ? "w-full text-center" : "flex-1"}>
                      {/** When centered, show photo inside header above name/title **/}
                      {formData.photoUrl && headerAlign === "center" && (
                        <div className="mb-4 flex justify-center">
                          <div className={`h-24 w-24 rounded-full overflow-hidden border-2 ${
                            (colorConfig?.mode === "advanced" && colorConfig?.accentMode === "accent" && colorConfig?.selectedColor) ||
                            (colorConfig?.mode === "advanced" && colorConfig?.accentMode === "multi")
                              ? "border-white"
                              : "border-slate-200"
                          }`}>
                            <img src={formData.photoUrl} alt="profile" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )}

                      <h1 
                        className="resume-name" 
                        style={{
                          ...(hasAccentBackground || hasImageBackground ? { color: "#ffffff" } : {}),
                          ...(isAdvancedMultiMode ? { color: colorConfig.multiHeaderTextColor || "#ffffff" } : {}),
                          ...(colorConfig?.mode === "basic" && colorConfig?.accentMode === "multi" ? { color: colorConfig.multiTextColor || "#1f2937" } : {}),
                          ...(colorConfig?.mode === "basic" && colorConfig?.selectedColor ? { color: colorConfig.selectedColor } : {})
                        }}
                      >
                        {formData.fullName || "Your Name"}
                      </h1>
                      <h2 
                        className="resume-role" 
                        style={{
                          ...(hasAccentBackground || hasImageBackground ? { color: "#ffffff", opacity: 0.9 } : {}),
                          ...(isAdvancedMultiMode ? { color: colorConfig.multiHeaderAccentColor || "#d97706" } : {}),
                          ...(colorConfig?.mode === "basic" && colorConfig?.accentMode === "multi" ? { color: colorConfig.multiAccentColor || "#2c3e50" } : {}),
                          ...(colorConfig?.mode === "basic" && colorConfig?.selectedColor ? { color: colorConfig.selectedColor } : {})
                        }}
                      >
                        {formData.title || "Professional Title"}
                      </h2>
                      {contactLine && renderContactInfo()}
                    </div>
                  </div>
                );
              })()}

              {/* Letter Body */}
              <div className="letter-body mt-8">
                <div className="flex justify-end mt-2">
                  {formData.date && (
                    <p style={{ color: "#6b7280" }}>{formData.date}</p>
                  )}
                </div>
                <div className="mb-4 my-4">
                  {formData.recipientName && (
                    <p className="font-bold">{formData.recipientName}</p>
                  )}
                  {formData.company && (
                    <p className="m-0">{formData.company}</p>
                  )}
                  {formData.companyLocation && (
                    <p>{formData.companyLocation}</p>
                  )}
                </div>

                <p style={{ marginBottom: "0.5rem" }} className="mt-8">
                  Dear {formData.recipientName || "Hiring Manager"},
                </p>

                <div
                  style={{ marginBottom: "0.75rem" }}
                  className="mt-4"
                  dangerouslySetInnerHTML={{ __html: formData.letterContent }}
                />

                <div style={{ marginTop: 1 }}>
                  <p>Kind regards,</p>
                  {formData.signatureImage && (
                    <div style={{ margin: "0.5rem 0" }}>
                      <img
                        src={formData.signatureImage}
                        alt="signature"
                        style={{ height: 60 }}
                      />
                    </div>
                  )}
                  <p
                    style={{
                      fontWeight: 600,
                      marginTop: formData.signatureImage ? 0 : "0.5rem",
                      fontFamily: formData.signatureFont || undefined,
                    }}
                  >
                    {formData.signatureName || formData.fullName}
                  </p>
                  {(formData.signaturePlace || formData.signatureDate) && (
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "#6b7280",
                        marginTop: "0.25rem",
                      }}
                    >
                      {[formData.signaturePlace, formData.signatureDate]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoverLetterPreview;
