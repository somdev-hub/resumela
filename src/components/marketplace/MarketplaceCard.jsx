import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Typography,
  Box,
  Grid,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Star, Heart } from "lucide-react";
import ResumePreview from "../ResumePreview";
import temp1 from "./templates/temp1.json";

const MarketplaceCard = () => {
  const [resume, setResume] = useState({
    formData: {
      fullName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      linkedinUrl: "",
      githubUrl: "",
      profile: "",
      photoUrl: null,
    },
    // Start with no sections by default — user will add sections via the Add Section dialog
    sections: [],
    layoutConfig: {
      columns: "two",
      headerPosition: "top",
      leftColumnWidth: 50,
      rightColumnWidth: 50,
    },
    spacingConfig: {
      fontSize: 9, // in pt
      lineHeight: 1.25,
      marginLR: 10, // left & right margin in mm
      marginTB: 10, // top & bottom margin in mm
      entrySpacing: 0, // px between entries
    },
    personalConfig: {
      align: "center", // left | center | right
      arrangement: "single", // single | two
      contactStyle: "icon", // icon | bullet | bar
    },
    colorConfig: {
      mode: "basic",
      accentMode: "accent",
      selectedColor: null,
      selectedColorName: "None",
      customColor: "#6366f1",
      // Multicolor settings
      multiPreset: "classic",
      multiTextColor: "#1f2937",
      multiBackgroundColor: "#ffffff",
      multiAccentColor: "#2c3e50",
      // Multicolor header settings (for advanced mode)
      multiHeaderTextColor: "#ffffff",
      multiHeaderBackgroundColor: "#2c3e50",
      multiHeaderAccentColor: "#ffffff",
      // Image settings
      selectedImage: null,
      selectedImageId: null,
      imageOpacity: 0.3,
    },
    selectedFont: {
      family: "PT Serif",
      category: "serif",
      css: "PT+Serif:wght@400;700",
    },
    sectionOrder: [
      "education",
      "experience",
      "skills",
      "certifications",
      "languages",
      "volunteering",
      "awards",
      "publications",
      "projects",
    ],
  });
  const A4_WIDTH_PX = 794; // 210mm at 96dpi
  const A4_HEIGHT_PX = 1123; // 297mm at 96dpi
  const dummyResumeData = useMemo(() => temp1.content, []);
  const dummyLayoutConfig = useMemo(() => temp1.layout, []);

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadFromFirestore = async () => {
      try {
        // Ensure sectionOrder contains only explicitly added sections
        const validSectionOrder = (
          dummyLayoutConfig?.sectionOrder || []
        ).filter((sectionId) =>
          (dummyResumeData?.sections || []).some((s) => s.id === sectionId)
        );

        setResume((prev) => ({
          ...prev,
          ...(dummyResumeData || {}),
          sections: dummyResumeData?.sections || prev.sections,
          ...(dummyLayoutConfig || {}),
          sectionOrder: validSectionOrder,
        }));

        //   showSnackbar("success", "Loaded", 2000);
      } catch (err) {
        console.error("Failed to load from Firestore:", err);
        //   showSnackbar("error", "Load failed", 3000);
      }
    };
    loadFromFirestore();
  }, [dummyLayoutConfig, dummyResumeData]);

  return (
    <>
      <style>{`
                @page { size: A4; margin: 10mm; }
                @media print {
                        body, html { margin: 0; }
                        .no-print { display: none !important; }
                        .a4-card {
                                box-shadow: none !important;
                                border: none !important;
                                margin: 0 !important;
                                width: 210mm !important;
                                height: 297mm !important;
                        }
                }
                /* Ensure the card keeps a proportional A4 aspect ratio on screen */
                .a4-card {
                        aspect-ratio: 210 / 297;
                        width: 100%;
                        max-width: 360px; /* adjust to show more/less cards per row */
                        height: auto;
                        // margin: 8px;
                        display:flex;
                        justify-content: flex-start;
                        align-items: center;
                        padding: 0 !important;
                }
            `}</style>

      <Card
        className="a4-card"
        variant="outlined"
        sx={{
          p: 3,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          borderRadius: 1,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            transform: "translateY(-4px)",
            boxShadow: "0 20px 40px rgba(139, 92, 246, 0.2)",
          },
        }}
        elevation={3}
      >
        <ResumePreview
          resume={resume}
          A4_WIDTH_PX={A4_WIDTH_PX}
          A4_HEIGHT_PX={A4_HEIGHT_PX}
          entryLayoutConfig={dummyLayoutConfig.entryLayoutConfig}
          combinedPreviewRef={() => {}}
          scale={0.34}
        />
      </Card>
    </>
  );
};

export default MarketplaceCard;
