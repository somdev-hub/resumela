import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import jsPDF from "jspdf";
import {
  Box,
  Button,
  Typography,
  AppBar,
  Toolbar,
  Stack,
  Snackbar,
  Alert,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import {
  saveCoverLetterContent,
  saveCoverLetterLayout,
  getCoverLetterContent,
  getCoverLetterLayout,
  getResumeContent,
} from "../firebase/firestore";
import CoverLetterEditor from "../components/coverletter/CoverLetterEditor";
import CoverLetterPreview from "../components/coverletter/CoverLetterPreview";
import AIGenerationDialog from "../components/coverletter/AIGenerationDialog";
import AIGeneratingOverlay from "../components/AIGeneratingOverlay";
import {
  useCoverLetterState,
  useCoverLetterLocalStorage,
  DEFAULT_FORM_DATA,
} from "../hooks/useCoverLetterState";
import { useFontLoading } from "../hooks/useFontLoading";
import { exportCoverLetterToPDF } from "../utils/CoverLetterExporter";

const CoverLetter = () => {
  const [syncWithResume, setSyncWithResume] = useState(true);
  const params = useParams();
  const pdfPreviewRef = useRef(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Use custom hooks for state management
  const {
    formData,
    setFormData,
    spacingConfig,
    setSpacingConfig,
    personalConfig,
    setPersonalConfig,
    colorConfig,
    setColorConfig,
    selectedFont,
    setSelectedFont,
    layoutConfig,
    setLayoutConfig,
    activeTab,
    setActiveTab,
    activeFontCategory,
    setActiveFontCategory,
    handleInputChange,
    computeSignature,
  } = useCoverLetterState();

  const { saveDraftToLocal } = useCoverLetterLocalStorage();
  const { fontStatus, loadGoogleFont } =
    useFontLoading(selectedFont);

  // Firestore state for cover letter
  const [firestoreDocId, setFirestoreDocId] = useState(null);
  const [loadDocId, setLoadDocId] = useState("");
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const autosaveTimerRef = useRef(null);
  const pendingSaveRef = useRef({});
  const lastSavedSignatureRef = useRef(null);

  const showSnackbar = (severity, text, timeout = 3000) => {
    setSnackbarMsg(text);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
    if (timeout > 0) {
      setTimeout(() => setSnackbarOpen(false), timeout);
    }
  };

  // Save cover letter to Firestore (content and layout in separate collections)
  const saveToFirestore = async ({
    force = false,
    skipConflictCheck = false,
  } = {}) => {
    console.log(
      "[saveToFirestore] Called with force:",
      force,
      "skipConflictCheck:",
      skipConflictCheck,
      "firestoreDocId:",
      firestoreDocId
    );
    
    // Use the existing docId from URL/state
    const docId = firestoreDocId;
    if (!docId) {
      showSnackbar("error", "No document ID available");
      return;
    }

    try {
      setIsSaving(true);

      // Three-way merge: detect conflicts
      if (!skipConflictCheck && !force) {
        const remoteContent = await getCoverLetterContent(docId);
        const remoteLayout = await getCoverLetterLayout(docId);
        const remoteSignature = computeSignature(remoteContent, remoteLayout);
        const localSignature = computeSignature(formData, {
          spacingConfig,
          personalConfig,
          selectedFont,
          layoutConfig,
        });

        if (
          remoteSignature !== lastSavedSignatureRef.current &&
          localSignature !== lastSavedSignatureRef.current
        ) {
          // Both sides have changed — conflict!
          pendingSaveRef.current = {
            formData,
            layout: {
              spacingConfig,
              personalConfig,
              selectedFont,
              layoutConfig,
            },
          };
          setConflictDialogOpen(true);
          setIsSaving(false);
          return;
        }
      }

      const layout = {
        spacingConfig,
        personalConfig,
        colorConfig,
        selectedFont,
        layoutConfig,
      };
      console.log("[CoverLetter] Saving to doc:", docId);
      await saveCoverLetterContent(docId, formData);
      await saveCoverLetterLayout(docId, layout);

      lastSavedSignatureRef.current = computeSignature(formData, layout);
      setLastSavedAt(new Date().toISOString());
      showSnackbar("success", "Cover letter saved");
    } catch (err) {
      console.error("Failed to save cover letter:", err);
      showSnackbar("error", `Failed to save cover letter: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Load cover letter content & layout from Firestore by doc id
  const loadFromFirestore = async (docId) => {
    try {
      setIsSaving(true);
      const content = await getCoverLetterContent(docId);
      const layout = await getCoverLetterLayout(docId);

      if (!content) {
        showSnackbar("error", "Cover letter not found");
        setIsSaving(false);
        return;
      }

      setFormData(content);
      if (layout) {
        if (layout.spacingConfig) setSpacingConfig(layout.spacingConfig);
        if (layout.personalConfig) setPersonalConfig(layout.personalConfig);
        if (layout.colorConfig) setColorConfig(layout.colorConfig);
        if (layout.selectedFont) setSelectedFont(layout.selectedFont);
        if (layout.layoutConfig) setLayoutConfig(layout.layoutConfig);
      }

      setFirestoreDocId(docId);
      lastSavedSignatureRef.current = computeSignature(content, layout);
      setLastSavedAt(new Date().toISOString());
      showSnackbar("success", "Cover letter loaded");
    } catch (err) {
      console.error("Failed to load cover letter:", err);
      showSnackbar("error", "Failed to load cover letter");
    } finally {
      setIsSaving(false);
    }
  };

  // Editor pane (left) and Preview pane (right) as small inner components
  const EditorPane = () => (
    <CoverLetterEditor
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      activeFontCategory={activeFontCategory}
      setActiveFontCategory={setActiveFontCategory}
      layoutConfig={layoutConfig}
      setLayoutConfig={setLayoutConfig}
      selectedFont={selectedFont}
      setSelectedFont={setSelectedFont}
      loadGoogleFont={loadGoogleFont}
      fontStatus={fontStatus}
      personalConfig={personalConfig}
      setPersonalConfig={setPersonalConfig}
      colorConfig={colorConfig}
      setColorConfig={setColorConfig}
      spacingConfig={spacingConfig}
      setSpacingConfig={setSpacingConfig}
      formData={formData}
      setFormData={setFormData}
      syncWithResume={syncWithResume}
      setSyncWithResume={setSyncWithResume}
      handleInputChange={handleInputChange}
    />
  );

  const PreviewPane = () => (
    <CoverLetterPreview
      formData={formData}
      spacingConfig={spacingConfig}
      selectedFont={selectedFont}
      personalConfig={personalConfig}
      colorConfig={colorConfig}
      combinedPreviewRef={combinedPreviewRef}
    />
  );

  useEffect(() => {
    const initializeDocument = async () => {
      const urlDocId = params?.docId;
      
      if (!urlDocId) {
        // No docId in URL - shouldn't happen with new flow, but handle gracefully
        return;
      }
      
      // If we already have this docId loaded, skip
      if (firestoreDocId === urlDocId) {
        return;
      }
      
      // Set the docId from URL
      setFirestoreDocId(urlDocId);
      setLoadDocId(urlDocId);
      
      try {
        // Try to load existing document from Firestore
        const content = await getCoverLetterContent(urlDocId);
        
        if (content) {
          // Document exists, load it
          await loadFromFirestore(urlDocId);
        } else {
          // Document doesn't exist, create it as "Untitled Cover Letter"
          const initialFormData = {
            ...DEFAULT_FORM_DATA,
            title: "Untitled Cover Letter",
          };
          
          const initialLayout = {
            spacingConfig,
            personalConfig,
            colorConfig,
            selectedFont,
            layoutConfig,
          };
          
          // Create the document in Firestore with the URL's docId
          await saveCoverLetterContent(urlDocId, initialFormData);
          await saveCoverLetterLayout(urlDocId, initialLayout);
          
          // Update local state
          setFormData(initialFormData);
          
          // Update signature to prevent immediate re-save
          lastSavedSignatureRef.current = computeSignature(initialFormData, initialLayout);
          setLastSavedAt(new Date().toISOString());
          
          showSnackbar("success", "New cover letter created", 2000);
        }
        
        // Persist the docId to localStorage
        try {
          localStorage.setItem("coverletter_firestore_docId", urlDocId);
        } catch (e) {
          // ignore localStorage errors
        }
      } catch (err) {
        console.error("Failed to initialize document:", err);
        showSnackbar("error", "Failed to initialize cover letter", 3000);
      }
    };
    
    initializeDocument();
    
    // Cleanup autosave timer on unmount
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [params?.docId]);

  useEffect(() => {
    setLoadDocId(firestoreDocId || "");
  }, [firestoreDocId]);

  // Autosave debounced changes to local or Firestore
  useEffect(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    
    autosaveTimerRef.current = setTimeout(() => {
      if (firestoreDocId) {
        // Only autosave to Firestore if we have a document ID
        saveToFirestore({ skipConflictCheck: true });
      } else {
        // If no doc created yet, just save to local storage
        const result = saveDraftToLocal(formData);
        if (result.success) {
          setLastSavedAt(new Date().toISOString());
        }
      }
    }, 1000);
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [
    formData,
    spacingConfig,
    personalConfig,
    colorConfig,
    selectedFont,
    layoutConfig,
    firestoreDocId,
  ]);

  const formatLastSaved = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString();
    } catch {
      return "";
    }
  };

  const sanitizedFilename = useMemo(() => {
    const trimmed = formData.fullName.trim();
    return trimmed
      ? trimmed.replace(/[^a-z0-9]+/gi, "_").toLowerCase()
      : "cover_letter";
  }, [formData.fullName]);

  const combinedPreviewRef = useCallback((node) => {
    pdfPreviewRef.current = node;
  }, []);

  const letterParagraphs = useMemo(() => {
    try {
      const el = document.createElement("div");
      el.innerHTML = formData.letterContent || "";
      const paras = [];
      el.querySelectorAll("p").forEach((p) => {
        const txt = p.innerText.replace(/\u00A0/g, " ").trim();
        if (txt) paras.push(txt);
      });
      if (paras.length > 0) return paras;
      const text = el.innerText || "";
      return text
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean);
    } catch {
      return (formData.letterContent || "").split(/\n+/).filter(Boolean);
    }
  }, [formData.letterContent]);

  const contactLine = useMemo(() => {
    return [formData.email, formData.phone, formData.location]
      .filter(Boolean)
      .join(" | ");
  }, [formData.email, formData.phone, formData.location]);

  const secondaryLine = useMemo(() => {
    return [formData.linkedin, formData.github].filter(Boolean).join(" | ");
  }, [formData.github, formData.linkedin]);

  const handleExportStyledPDF = async () => {
    try {
      setIsExportingPDF(true);
      showSnackbar("info", "Generating professional PDF...", 0);
      
      await exportCoverLetterToPDF(
        "preview-coverletter",
        sanitizedFilename,
        {
          onSuccess: () => {
            showSnackbar("success", "PDF exported successfully!", 3000);
            setIsExportingPDF(false);
          },
          onError: () => {
            showSnackbar("error", "Failed to export PDF. Make sure the backend server is running.", 5000);
            setIsExportingPDF(false);
          },
        }
      );
    } catch (error) {
      console.error("Export failed:", error);
      setIsExportingPDF(false);
    }
  };

  const downloadATSOptimizedPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(formData.fullName, pageWidth / 2, y, { align: "center" });
    y += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(formData.title, pageWidth / 2, y, { align: "center" });
    y += 18;

    doc.setFontSize(10);
    const contactInfo = [contactLine, secondaryLine]
      .filter(Boolean)
      .join(" | ");
    doc.text(contactInfo, pageWidth / 2, y, {
      align: "center",
      maxWidth: pageWidth - margin * 2,
    });
    y += 28;

    const addLine = (text) => {
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
      lines.forEach((line) => {
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 16;
      });
      y += 8;
    };

    doc.setFontSize(11);
    addLine(formData.date);
    addLine(formData.recipientName);
    addLine(formData.company);
    addLine(formData.companyLocation);
    addLine("");
    addLine(`Dear ${formData.recipientName},`);
    letterParagraphs.forEach((paragraph) => addLine(paragraph));
    addLine("Sincerely,");
    addLine(formData.fullName);

    doc.save(`${sanitizedFilename}_ats.pdf`);
  };

  const handleAIGenerate = async ({ jobUrl, resumeId }) => {
    setAiGenerating(true);
    try {
      showSnackbar("info", "Generating your cover letter with AI...");
      
      // Fetch resume data from Firestore
      const resumeContent = await getResumeContent(resumeId);
      
      if (!resumeContent) {
        throw new Error("Failed to fetch resume data");
      }

      // Call the API endpoint with the correct format
      const response = await fetch("http://localhost:5678/webhook-test/cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: resumeContent,
          jobUrl: jobUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.output) {
        throw new Error("Invalid response from API");
      }

      // Update the form data with the generated content
      const generatedData = data.output;
      setFormData((prev) => ({
        ...prev,
        fullName: generatedData.fullName || prev.fullName,
        title: generatedData.title || prev.title,
        email: generatedData.email || prev.email,
        phone: generatedData.phone || prev.phone,
        location: generatedData.location || prev.location,
        linkedin: generatedData.linkedin || prev.linkedin,
        github: generatedData.github || prev.github,
        date: generatedData.date || prev.date,
        recipientName: generatedData.recipientName || prev.recipientName,
        company: generatedData.company || prev.company,
        companyLocation: generatedData.companyLocation || prev.companyLocation,
        letterContent: generatedData.letterContent || prev.letterContent,
      }));

      showSnackbar("success", "✨ Cover letter generated successfully!");
    } catch (err) {
      console.error("AI generation failed:", err);
      showSnackbar("error", `Failed to generate cover letter: ${err.message}`);
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      <AppBar position="fixed" color="inherit" elevation={1}>
        <Toolbar>
          <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
            <DescriptionIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Cover Letter Builder
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Edit details on the left, preview updates instantly on the right
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setAiDialogOpen(true)}
              disabled={aiGenerating}
            >
              ✨ Generate with AI
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => saveToFirestore()}
              disabled={isSaving}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={handleExportStyledPDF}
              disabled={isExportingPDF}
            >
              {isExportingPDF ? "Exporting..." : "Styled PDF"}
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={downloadATSOptimizedPDF}
            >
              ATS-friendly PDF
            </Button>
          </Stack>
          <Box sx={{ ml: 2, display: "flex", alignItems: "center" }}>
            <Typography variant="caption" color="text.secondary">
              {isSaving
                ? "Saving..."
                : lastSavedAt
                ? `Saved ${formatLastSaved(lastSavedAt)}`
                : ""}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Spacer for fixed AppBar */}
      <main className="flex-1 w-full" style={{ height: "calc(100vh - 64px)" }}>
        <div
          className="mx-auto flex w-full gap-6 px-6 md:flex-row items-stretch justify-center pt-4"
          style={{ height: "100%" }}
        >
          {/* Left Editor Column - equal width */}
          <div className="w-full h-full flex flex-col">{EditorPane()}</div>

          {/* Right Preview Column - equal width */}
          <div className="w-full h-full flex flex-col">{PreviewPane()}</div>
        </div>
      </main>
      {/* Conflict dialog */}
      <Dialog
        open={conflictDialogOpen}
        onClose={() => setConflictDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Conflicting Changes</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Both your local changes and remote changes have been made. How would
            you like to proceed?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConflictDialogOpen(false)}>Cancel</Button>
          <Button
            variant="outlined"
            onClick={async () => {
              setConflictDialogOpen(false);
              await loadFromFirestore(firestoreDocId);
            }}
          >
            Use Remote
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              setConflictDialogOpen(false);
              await saveToFirestore({ force: true });
            }}
          >
            Use Local
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
      <AIGenerationDialog
        open={aiDialogOpen}
        onClose={() => setAiDialogOpen(false)}
        onGenerate={handleAIGenerate}
      />
      <AIGeneratingOverlay open={aiGenerating} />
    </Box>
  );
};

export default CoverLetter;
