import { useCallback, useMemo, useRef, useState, useEffect } from "react";
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
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
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

const CoverLetter = () => {
  const [syncWithResume, setSyncWithResume] = useState(true);
  const params = useParams();
  const navigate = useNavigate();
  const pdfPreviewRef = useRef(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // For mobile preview toggle
  const [menuAnchorEl, setMenuAnchorEl] = useState(null); // For hamburger menu

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
  const { fontStatus, loadGoogleFont } = useFontLoading(selectedFont);

  // Firestore state for cover letter
  const [firestoreDocId, setFirestoreDocId] = useState(null);
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
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
          lastSavedSignatureRef.current = computeSignature(
            initialFormData,
            initialLayout
          );
          setLastSavedAt(new Date().toISOString());

          showSnackbar("success", "New cover letter created", 2000);
        }

        // Persist the docId to localStorage
        try {
          localStorage.setItem("coverletter_firestore_docId", urlDocId);
        } catch {
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

  async function downloadPDF() {
    try {
      setIsExporting(true);
      const response = await fetch(
        `https://resumela-server.onrender.com/export-pdf/${firestoreDocId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      setIsExporting(false);
      if (response.status !== 200) {
        alert("failed to export PDF");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${sanitizedFilename}.pdf`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      setIsExporting(false);
      alert("failed to export PDF: " + error.message);
    }
  }

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
      const response = await fetch(
        "http://localhost:5678/webhook-test/cover-letter",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume: resumeContent,
            jobUrl: jobUrl,
          }),
        }
      );

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
        <Toolbar sx={{ gap: 2 }}>
          <Avatar sx={{ bgcolor: "primary.main", mr: { md: 2 } }}>
            <DescriptionIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: "200px" }}>
            <Typography variant="h6" fontWeight={600}>
              Cover Letter Builder
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: "none", md: "block" } }}
            >
              Edit details on the left, preview updates instantly on the right
            </Typography>
          </Box>

          {/* Desktop Buttons - visible on md and up */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ display: { xs: "none", md: "flex" } }}
          >
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
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => navigate(`/view/document/${firestoreDocId}`)}
            >
              View PDF
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => downloadPDF()}
              disabled={isExporting}
            >
              Download
            </Button>
          </Stack>

          {/* Mobile Buttons - visible on sm and down */}
          {/* Preview Button */}

          {/* Hamburger Menu Button */}
          <IconButton
            onClick={() => setShowPreview(!showPreview)}
            sx={{ display: { xs: "inline-flex", md: "none" } }}
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            onClick={(e) => setMenuAnchorEl(e.currentTarget)}
            sx={{ display: { xs: "inline-flex", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Hamburger Menu Dropdown */}
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={() => setMenuAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem
              onClick={() => {
                setAiDialogOpen(true);
                setMenuAnchorEl(null);
              }}
              disabled={aiGenerating}
            >
              ✨ Generate with AI
            </MenuItem>
            <MenuItem
              onClick={() => {
                saveToFirestore();
                setMenuAnchorEl(null);
              }}
              disabled={isSaving}
            >
              Save
            </MenuItem>
            <MenuItem
              onClick={() => {
                navigate(`/view/document/${firestoreDocId}`);
                setMenuAnchorEl(null);
              }}
            >
              View PDF
            </MenuItem>
            <MenuItem
              onClick={() => {
                downloadPDF();
                setMenuAnchorEl(null);
              }}
              disabled={isExporting}
            >
              Download PDF
            </MenuItem>
          </Menu>

          {/* Save Status */}
          <Box sx={{ ml: 1, display: "flex", alignItems: "center" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
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
          className="mx-auto flex w-full gap-6 px-2 md:px-6 md:flex-row items-stretch justify-center pt-4 flex-col"
          style={{ height: "100%" }}
        >
          {/* Left Editor Column - full width on mobile, half on desktop */}
          <div className="w-full md:flex-1 h-full flex flex-col">
            {EditorPane()}
          </div>

          {/* Right Preview Column - hidden on mobile, shown as overlay with toggle, visible on desktop */}
          <div className="hidden md:flex md:flex-1 h-full flex-col">
            {PreviewPane()}
          </div>

          {/* Mobile Preview Overlay - only visible on mobile */}
          {showPreview && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setShowPreview(false)}
            />
          )}
          {showPreview && (
            <div className="fixed inset-0 left-0 top-16 right-0 bottom-0 z-50 md:hidden overflow-hidden flex flex-col bg-white">
              <div className="flex items-center justify-between p-4 border-b">
                <Typography variant="h6">Preview</Typography>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-auto">{PreviewPane()}</div>
            </div>
          )}
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
