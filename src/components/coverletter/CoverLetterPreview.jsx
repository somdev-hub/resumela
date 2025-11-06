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
  combinedPreviewRef,
}) => {
  const A4_WIDTH_PX = 794;
  const A4_HEIGHT_PX = 1123;
  const PX_PER_MM = 3.78;
  const paddingLR = Math.round((spacingConfig.marginLR || 10) * PX_PER_MM);
  const paddingTB = Math.round((spacingConfig.marginTB || 10) * PX_PER_MM);

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

    if (personalConfig.contactStyle === "bullet") {
      return (
        <p
          className="resume-contact-line"
          style={{
            marginTop: "0.5rem",
            color: "#4b5563",
          }}
        >
          {contactItems.map((item, i) => (
            <span key={i} style={{ marginRight: 8 }}>
              {item.value}
              {i < contactItems.length - 1 ? " •" : ""}&nbsp;
            </span>
          ))}
        </p>
      );
    }

    // icon and bar styles: render with icons and pipe separators
    return (
      <div 
        className="mt-2 flex items-center justify-center gap-4 flex-wrap"
        style={{ color: "#4b5563" }}
      >
        {contactItems.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            <span className="inline-flex" style={{ fontSize: "0.875em" }}>{item.icon}</span>
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
                background: "#fff",
                boxShadow: "0 6px 18px rgba(15,23,42,0.08)",
                border: "1px solid rgba(0,0,0,0.06)",
                borderRadius: 6,
                boxSizing: "border-box",
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
                  color: #000000 !important;
                }
                
                /* Role/Title - Second in hierarchy */
                .coverletter-preview h2,
                .coverletter-preview .resume-role { 
                  font-size: var(--resume-size-role) !important; 
                  line-height: 1.2 !important;
                  color: #000000 !important;
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
                  color: #1f2937 !important;
                }
                
                .coverletter-preview .letter-header {
                  text-align: ${personalConfig.align || "center"} !important;
                  border-bottom: 1px solid #e5e7eb;
                  padding-bottom: 1rem;
                  margin-bottom: 1.5rem;
                }
                
                .coverletter-preview .letter-body {
                  color: #1f2937 !important;
                  font-size: var(--resume-size-body) !important;
                  line-height: var(--resume-line-height) !important;
                }
                
                .coverletter-preview .letter-body p,
                .coverletter-preview .letter-body span {
                  font-size: var(--resume-size-body) !important;
                  line-height: var(--resume-line-height) !important;
                  color: #1f2937 !important;
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
                  color: #1f2937 !important;
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
              <div className="letter-header">
                <h1 className="resume-name">
                  {formData.fullName || "Your Name"}
                </h1>
                <h2 className="resume-role">
                  {formData.title || "Professional Title"}
                </h2>
                {contactLine && renderContactInfo()}
                {/* {secondaryLine && (
                  <p style={{ color: "#4f46e5", marginTop: "0.25rem" }}>
                    {secondaryLine}
                  </p>
                )} */}
              </div>

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
