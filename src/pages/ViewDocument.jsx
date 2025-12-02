import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";
import {
  getResumeContent,
  getResumeLayout,
  getCoverLetterContent,
  getCoverLetterLayout,
} from "../firebase/firestore";
import MultiPageResume from "../components/MultiPageResume";
import CoverLetterPreview from "../components/coverletter/CoverLetterPreview";

const ViewDocument = () => {
  const { docId } = useParams();
  const [documentType, setDocumentType] = useState(null); // "resume" | "coverletter" | null
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDocument = async () => {
      if (!docId) {
        setError("No document ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Try loading as Resume first
        const resumeContent = await getResumeContent(docId);
        if (resumeContent) {
          const resumeLayout = await getResumeLayout(docId);
          
          // Construct resume object
          const resumeData = {
            formData: resumeContent.formData || {},
            sections: resumeContent.sections || [],
            sectionOrder: resumeLayout?.sectionOrder || resumeContent.sectionOrder || [],
            layoutConfig: resumeLayout?.layoutConfig || {
              columns: "two",
              headerPosition: "top",
              leftColumnWidth: 50,
              rightColumnWidth: 50,
            },
            spacingConfig: resumeLayout?.spacingConfig || {
              fontSize: 9,
              lineHeight: 1.25,
              marginLR: 10,
              marginTB: 10,
              entrySpacing: 0,
            },
            personalConfig: resumeLayout?.personalConfig || {
              align: "center",
              arrangement: "single",
              contactStyle: "icon",
            },
            colorConfig: resumeLayout?.colorConfig || {
              mode: "basic",
              accentMode: "accent",
              selectedColor: null,
              selectedColorName: "None",
              customColor: "#6366f1",
            },
            selectedFont: resumeLayout?.selectedFont || {
              family: "PT Serif",
              category: "serif",
              css: "PT+Serif:wght@400;700",
            },
            entryLayoutConfig: resumeLayout?.entryLayoutConfig || {
                layout: 4,
                size: "S",
                subtitleStyle: "Normal",
                subtitlePlacement: "Next Line",
                indentBody: false,
                listStyle: "Bullet",
                entryOrder: [],
                conDateLocDisplay: "inline",
            },
          };

          // Load font
          if (resumeData.selectedFont?.css) {
             const link = document.createElement("link");
             link.rel = "stylesheet";
             link.href = `https://fonts.googleapis.com/css2?family=${resumeData.selectedFont.css}&display=swap`;
             document.head.appendChild(link);
          }

          setData(resumeData);
          setDocumentType("resume");
          setLoading(false);
          return;
        }

        // Try loading as Cover Letter
        const coverLetterContent = await getCoverLetterContent(docId);
        if (coverLetterContent) {
          const coverLetterLayout = await getCoverLetterLayout(docId);
          
          const coverLetterData = {
            formData: coverLetterContent, // content is the formData for cover letter
            spacingConfig: coverLetterLayout?.spacingConfig || {
              fontSize: 10,
              lineHeight: 1.5,
              marginLR: 20,
              marginTB: 20,
              entrySpacing: 10,
            },
            personalConfig: coverLetterLayout?.personalConfig || {
              align: "left",
              contactStyle: "icon",
            },
            colorConfig: coverLetterLayout?.colorConfig || {
              mode: "basic",
              accentMode: "accent",
              selectedColor: "#000000",
            },
            selectedFont: coverLetterLayout?.selectedFont || {
              family: "Roboto",
              category: "sans",
              css: "Roboto:wght@400;700",
            },
          };

           // Load font
           if (coverLetterData.selectedFont?.css) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = `https://fonts.googleapis.com/css2?family=${coverLetterData.selectedFont.css}&display=swap`;
            document.head.appendChild(link);
         }

          setData(coverLetterData);
          setDocumentType("coverletter");
          setLoading(false);
          return;
        }

        setError("Document not found");
      } catch (err) {
        console.error("Error loading document:", err);
        setError("Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [docId]);

  useEffect(() => {
    if (!loading && data) {
      // Add a small delay to allow for layout calculations (especially for MultiPageResume)
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event("resume-ready"));
        window.__RESUME_READY__ = true;
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, data]);

  // if (loading) {
  //   return (
  //     <Box
  //       sx={{
  //         height: "100vh",
  //         display: "flex",
  //         alignItems: "center",
  //         justifyContent: "center",
  //       }}
  //     >
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

  // if (error) {
  //   return (
  //     <Box
  //       sx={{
  //         height: "100vh",
  //         display: "flex",
  //         alignItems: "center",
  //         justifyContent: "center",
  //       }}
  //     >
  //       <Typography variant="h6" color="error">
  //         {error}
  //       </Typography>
  //     </Box>
  //   );
  // }

  const A4_WIDTH_PX = 794;
  const A4_HEIGHT_PX = 1123;

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#f3f4f6", // Light gray background for the page
        display: "flex",
        justifyContent: "center",
        overflow: "auto",
        padding: typeof window !== 'undefined' && window.innerWidth < 768 ? "16px" : "40px",
      }}
    >
      {documentType === "resume" && (
        <div
            style={{
                // The container for the resume pages
                display: "flex",
                flexDirection: "column",
                gap: "20px",
            }}
        >
             <style>{`
                /* Derived sizes to create a typographic hierarchy based on the base font size */
                .resume-preview {
                --resume-size-name: calc(var(--resume-font-size) * 2.2);
                --resume-size-role: calc(var(--resume-font-size) * 1.5);
                --resume-size-section: calc(var(--resume-font-size) * 1.25);
                --resume-size-title: calc(var(--resume-font-size) * 1.05);
                --resume-size-subtitle: calc(var(--resume-font-size) * 1);
                --resume-size-body: calc(var(--resume-font-size) * 1);
                font-size: var(--resume-size-body);
                line-height: var(--resume-line-height);
                }
                /* Specific element overrides to form a clear hierarchy */
                .resume-preview .resume-name { font-size: var(--resume-size-name) !important; line-height: 1.05 !important; }
                .resume-preview .resume-role { font-size: var(--resume-size-role) !important; font-style: italic !important; }
                .resume-preview .resume-section-heading { font-size: var(--resume-size-section) !important; font-weight: 700 !important; }
                .resume-preview .resume-item-title { font-size: var(--resume-size-title) !important; font-weight: 700 !important; }
                .resume-preview .resume-item-subtitle { font-size: var(--resume-size-subtitle) !important; color: #4B5563 !important; }
                .resume-preview .resume-item-description { font-size: var(--resume-size-body) !important; line-height: var(--resume-line-height) !important; color:black; }
                .resume-preview .resume-entry { margin-bottom: var(--resume-entry-spacing) !important; }
                /* Variant for compact entries: same as .resume-entry but no bottom spacing */
                .resume-preview .resume-entry-no-margin { margin-bottom: 0 !important; }
                .resume-preview .resume-entry-less-margin { margin-bottom: calc(var(--resume-entry-spacing) * 0.5) !important; }
            `}</style>
            <div
                className="resume-preview"
                style={{
                    ["--resume-font-size"]: `${data.spacingConfig.fontSize}pt`,
                    ["--resume-line-height"]: data.spacingConfig.lineHeight,
                    ["--resume-entry-spacing"]: `${data.spacingConfig.entrySpacing}px`,
                    fontFamily: data.selectedFont.family
                    ? `'${data.selectedFont.family}', serif`
                    : undefined,
                    width: A4_WIDTH_PX,
                    minHeight: A4_HEIGHT_PX,
                    maxWidth: "100%",
                }}
            >
                <MultiPageResume
                    resume={data}
                    A4_WIDTH_PX={A4_WIDTH_PX}
                    A4_HEIGHT_PX={A4_HEIGHT_PX}
                    entryLayoutConfig={data.entryLayoutConfig}
                />
            </div>
        </div>
      )}

      {documentType === "coverletter" && (
        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
        }}>
             {/* CoverLetterPreview renders its own container and styles, but we might need to override some */}
             <CoverLetterPreview
                formData={data.formData}
                spacingConfig={data.spacingConfig}
                selectedFont={data.selectedFont}
                personalConfig={data.personalConfig}
                colorConfig={data.colorConfig}
                combinedPreviewRef={() => {}}
             />
        </div>
      )}
    </div>
  );
};

export default ViewDocument;
