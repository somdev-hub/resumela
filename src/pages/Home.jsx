import React, { useEffect, useState } from "react";
import { FaFileAlt } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";

import Navbar from "../components/Navbar";
import Cards from "../components/Cards";
import { useNavigate, useLocation } from "react-router-dom";
import { initFirestore } from "../firebase/firestore";
import { collection, getDocs, deleteDoc, doc, updateDoc, setDoc } from "firebase/firestore";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";

// Generate a simple text preview with key document info
const generatePreviewContent = (doc, type) => {
  if (type === "resume") {
    const formData = doc.formData || {};
    const sections = doc.sections || [];
    
    return {
      name: formData.fullName || "Untitled Resume",
      title: formData.title || "",
      contact: [formData.email, formData.phone].filter(Boolean).join(" • "),
      stats: `${sections.length} sections`,
    };
  } else {
    return {
      name: doc.fullName || "Untitled Cover Letter",
      company: doc.recipientCompany || "",
      preview: doc.letterContent?.substring(0, 60) + "..." || "Letter content...",
      stats: doc.date || "",
    };
  }
};

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState({}); // Store preview content data for each doc
  const [user, setUser] = useState(null); // Track authentication state
  const [authLoading, setAuthLoading] = useState(true); // Track if auth is being checked

  useEffect(() => {
    let mounted = true;
    async function fetchResumes() {
      // Only fetch if user is authenticated
      if (!user) {
        if (mounted) {
          setResumes([]);
          setPreviewData({});
          setLoading(false);
        }
        return;
      }
      
      setLoading(true);
      try {
        const db = initFirestore();
        // Fetch both resumes and cover letters
        const resumeSnaps = await getDocs(collection(db, "resume_content"));
        const coverLetterSnaps = await getDocs(collection(db, "coverletter_content"));
        
        const resumeItems = resumeSnaps.docs.map((d) => {
          const data = d.data() || {};
          const title =
            (data.formData && data.formData.fullName) ||
            data.title ||
            "Untitled Resume";
          const updatedAt = data.updatedAt
            ? data.updatedAt.toDate
              ? data.updatedAt.toDate().toISOString()
              : data.updatedAt
            : data.createdAt
            ? data.createdAt.toDate
              ? data.createdAt.toDate().toISOString()
              : data.createdAt
            : new Date().toISOString();
          
          // Generate preview content for resume
          if (mounted) {
            const preview = generatePreviewContent(data, "resume");
            setPreviewData((prev) => ({ ...prev, [d.id]: preview }));
          }
          
          return {
            id: d.id,
            title,
            updatedAt,
            type: "resume",
            created: true,
          };
        });

        const coverLetterItems = coverLetterSnaps.docs.map((d) => {
          const data = d.data() || {};
          const title =
            (data.fullName ? `Cover Letter - ${data.fullName}` : null) ||
            data.title ||
            "Untitled Cover Letter";
          const updatedAt = data.updatedAt
            ? data.updatedAt.toDate
              ? data.updatedAt.toDate().toISOString()
              : data.updatedAt
            : data.createdAt
            ? data.createdAt.toDate
              ? data.createdAt.toDate().toISOString()
              : data.createdAt
            : new Date().toISOString();
          
          // Generate preview content for cover letter
          if (mounted) {
            const preview = generatePreviewContent(data, "cover");
            setPreviewData((prev) => ({ ...prev, [d.id]: preview }));
          }
          
          return {
            id: d.id,
            title,
            updatedAt,
            type: "cover",
            created: true,
          };
        });

        // Combine and sort by updatedAt
        const allItems = [...resumeItems, ...coverLetterItems].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        if (mounted) setResumes(allItems);
      } catch (err) {
        // Keep simple for now — surface error in console
        console.error("Failed to load documents:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchResumes();
    return () => {
      mounted = false;
    };
  }, [location.pathname, user]); // Re-fetch when user changes

  const handleDelete = async (docId, docType) => {
    const ok = window.confirm("Delete this document? This action cannot be undone.");
    if (!ok) return;
    setLoading(true);
    try {
      const db = initFirestore();
      if (docType === "resume") {
        // delete resume content doc
        await deleteDoc(doc(db, "resume_content", docId));
        // try to delete resume layout doc with same id if present (ignore errors)
        try {
          await deleteDoc(doc(db, "resume_layout", docId));
        } catch (e) {
          // ignore missing layout doc
          console.debug("No layout doc to delete or failed:", e?.message || e);
        }
      } else if (docType === "cover") {
        // delete cover letter content doc
        await deleteDoc(doc(db, "coverletter_content", docId));
        // try to delete cover letter layout doc with same id if present (ignore errors)
        try {
          await deleteDoc(doc(db, "coverletter_layout", docId));
        } catch (e) {
          // ignore missing layout doc
          console.debug("No layout doc to delete or failed:", e?.message || e);
        }
      }
      // remove locally
      setResumes((prev) => prev.filter((r) => r.id !== docId));
    } catch (err) {
      console.error("Failed to delete document:", err);
      // keep simple UX for now
      window.alert("Failed to delete document. See console for details.");
    } finally {
      setLoading(false);
    }
  };
  // Helper to get time ago string
  const getTimeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
  };

  const [userName, setUserName] = useState("");

  // Create New dialog state: choose Resume or Cover Letter
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState("resume");

  // Menu and edit title state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [editTitleOpen, setEditTitleOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDocType, setEditDocType] = useState(null);

  const closeCreateDialog = () => setCreateDialogOpen(false);

  const handleCreateConfirm = () => {
    closeCreateDialog();
    // Generate a unique ID for the new document
    const newDocId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (createType === "resume") navigate(`/resume/${newDocId}`);
    else if (createType === "cover") navigate(`/cover-letter/${newDocId}`);
  };

  const handleCreateDirectly = (type) => {
    // Generate a unique ID for the new document
    const newDocId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Navigate to the new document with the generated ID
    if (type === "resume") navigate(`/resume/${newDocId}`);
    else if (type === "cover") navigate(`/cover-letter/${newDocId}`);
  };

  const handleMenuOpen = (e, docId, docType) => {
    setMenuAnchor(e.currentTarget);
    setSelectedDocId(docId);
    setEditDocType(docType);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedDocId(null);
  };

  const handleEditTitle = () => {
    const doc = resumes.find((r) => r.id === selectedDocId);
    if (doc) {
      setEditTitle(doc.title);
      setEditTitleOpen(true);
    }
    handleMenuClose();
  };

  const handleSaveTitle = async () => {
    if (!editTitle.trim()) return;
    try {
      const db = initFirestore();
      const collectionName =
        editDocType === "resume" ? "resume_content" : "coverletter_content";
      const docRef = doc(db, collectionName, selectedDocId);
      await updateDoc(docRef, { title: editTitle });
      setResumes((prev) =>
        prev.map((r) =>
          r.id === selectedDocId ? { ...r, title: editTitle } : r
        )
      );
    } catch (err) {
      console.error("Failed to update title:", err);
    } finally {
      setEditTitleOpen(false);
      setEditTitle("");
    }
  };

  const handleDuplicate = async () => {
    handleMenuClose();
    const sourceDoc = resumes.find((r) => r.id === selectedDocId);
    if (!sourceDoc) return;

    try {
      const db = initFirestore();
      const collectionName =
        editDocType === "resume" ? "resume_content" : "coverletter_content";
      const sourceData = (await getDocs(collection(db, collectionName))).docs.find(
        (d) => d.id === selectedDocId
      );

      if (!sourceData) return;

      // Generate a unique ID for the new document
      const newDocId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newTitle = `${sourceDoc.title} (Copy)`;
      const sourceContent = sourceData.data();

      // Add the duplicate document with a new timestamp and new ID
      const newDocData = {
        ...sourceContent,
        title: newTitle,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newDocRef = doc(db, collectionName, newDocId);
      await setDoc(newDocRef, newDocData);

      // Also try to duplicate layout if it exists
      const layoutCollectionName =
        editDocType === "resume" ? "resume_layout" : "coverletter_layout";
      try {
        const layoutSnaps = await getDocs(collection(db, layoutCollectionName));
        const sourceLayout = layoutSnaps.docs.find(
          (d) => d.id === selectedDocId
        );
        if (sourceLayout) {
          const newLayoutRef = doc(db, layoutCollectionName, newDocId);
          await setDoc(newLayoutRef, sourceLayout.data());
        }
      } catch (e) {
        console.debug("No layout to duplicate:", e);
      }

      // Add the new document to the resumes list
      const newItem = {
        id: newDocId,
        title: newTitle,
        updatedAt: new Date().toISOString(),
        type: editDocType,
        created: true,
      };
      
      setResumes((prev) => [newItem, ...prev].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      ));

      // Navigate to the new document
      if (editDocType === "resume") navigate(`/resume/${newDocId}`);
      else if (editDocType === "cover") navigate(`/cover-letter/${newDocId}`);
    } catch (err) {
      console.error("Failed to duplicate document:", err);
    }
  };

  useEffect(() => {
    let mounted = true;
    let unsubscribe = null;
    (async () => {
      try {
        // dynamic import so we don't need a top-level import change
        const { getAuth, onAuthStateChanged } = await import("firebase/auth");
        const auth = getAuth();
        // use onAuthStateChanged so we react to when Firebase finishes initializing the user
        unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          if (mounted) {
            setUser(currentUser); // Set user state
            setAuthLoading(false); // Auth check complete
            const name =
              currentUser?.displayName ||
              (currentUser?.email ? currentUser.email.split("@")[0] : "") ||
              "Guest";
            setUserName(name);
          }
        });
      } catch (err) {
        console.error("Failed to get auth user:", err);
        if (mounted) {
          setAuthLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  return (
    <div className=" bg-gray-50 flex flex-col items-center justify-center">
      <Navbar />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">
          Welcome back, {userName || "Guest"}!
        </h2>
        <p className="text-lg text-gray-600">
          What would you like to do today?
        </p>
      </div>
      
      <Dialog open={createDialogOpen} onClose={closeCreateDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Create new document</DialogTitle>
        <DialogContent>
          <RadioGroup
            value={createType}
            onChange={(e) => setCreateType(e.target.value)}
          >
            <FormControlLabel value="resume" control={<Radio />} label="Resume" />
            <FormControlLabel value="cover" control={<Radio />} label="Cover letter" />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateConfirm}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Cards 
        newResume={()=>handleCreateDirectly("resume")}
        newCoverLetter={()=>handleCreateDirectly("cover")}
      />

      {/* Your Documents Section */}
      <div className="mt-12 w-full max-w-6xl px-4">
        <h2 className="text-3xl font-bold mb-8">Your Documents</h2>

        {/* Show message if not logged in */}
        {!authLoading && !user && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg mb-4">
              Please log in to view your documents.
            </p>
            <Button
              variant="contained"
              onClick={() => navigate("/login")}
            >
              Log In
            </Button>
          </div>
        )}

        {/* Show loading state while checking auth */}
        {authLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading...</p>
          </div>
        )}

        {/* Show documents only if logged in */}
        {!authLoading && user && (
          <>
            {/* Resumes Section */}
            {resumes.filter((doc) => doc.type === "resume").length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-4">Resumes</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {(loading ? [] : resumes.filter((doc) => doc.type === "resume")).map((doc) => {
                const preview = previewData[doc.id];
                return (
                  <div key={doc.id} className="flex flex-col">
                    {/* A4 Aspect Ratio Card - 1:1.414 */}
                    <div 
                      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer mb-3 flex flex-col"
                      onClick={() => navigate(`/resume/${doc.id}`)}
                      style={{ aspectRatio: "1/1.414" }}
                    >
                      {preview ? (
                        <div className="w-full h-full bg-gradient-to-br from-blue-50 via-white to-gray-50 p-4 flex flex-col justify-between text-sm">
                          <div>
                            <h3 className="font-bold text-base text-gray-900 truncate">{preview.name}</h3>
                            {preview.title && <p className="text-xs text-gray-600 truncate">{preview.title}</p>}
                            {preview.contact && <p className="text-xs text-gray-500 truncate mt-1">{preview.contact}</p>}
                          </div>
                          <div className="text-xs text-gray-400 text-center">
                            {preview.stats}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <p className="text-xs text-gray-400">Loading...</p>
                        </div>
                      )}
                    </div>

                    {/* Title and Date Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                          {doc.title}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {getTimeAgo(doc.updatedAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleMenuOpen(e, doc.id, "resume")}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <BsThreeDots size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Create New Resume Card */}
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => handleCreateDirectly("resume")}
                  className="cursor-pointer bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors mb-3 flex-1 flex flex-col items-center justify-center"
                >
                  <div className="text-gray-400 text-3xl">+</div>
                </button>
                <p className="text-sm text-gray-600 text-center">New resume</p>
              </div>
            </div>
          </div>
        )}

        {/* Cover Letters Section */}
        {resumes.filter((doc) => doc.type === "cover").length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Cover Letters</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {(loading ? [] : resumes.filter((doc) => doc.type === "cover")).map((doc) => {
                const preview = previewData[doc.id];
                return (
                  <div key={doc.id} className="flex flex-col">
                    {/* A4 Aspect Ratio Card - 1:1.414 */}
                    <div 
                      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer mb-3 flex flex-col"
                      onClick={() => navigate(`/cover-letter/${doc.id}`)}
                      style={{ aspectRatio: "1/1.414" }}
                    >
                      {preview ? (
                        <div className="w-full h-full bg-gradient-to-br from-amber-50 via-white to-gray-50 p-4 flex flex-col justify-between text-sm">
                          <div>
                            <h3 className="font-bold text-base text-gray-900 truncate">{preview.name}</h3>
                            {preview.company && <p className="text-xs text-gray-600 truncate">{preview.company}</p>}
                            {preview.preview && <p className="text-xs text-gray-500 mt-2 line-clamp-3">{preview.preview}</p>}
                          </div>
                          <div className="text-xs text-gray-400 text-center">
                            {preview.stats}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <p className="text-xs text-gray-400">Loading...</p>
                        </div>
                      )}
                    </div>

                    {/* Title and Date Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                          {doc.title}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {getTimeAgo(doc.updatedAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleMenuOpen(e, doc.id, "cover")}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <BsThreeDots size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Create New Cover Letter Card */}
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => handleCreateDirectly("cover")}
                  className="cursor-pointer bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors mb-3 flex-1 flex flex-col items-center justify-center"
                >
                  <div className="text-gray-400 text-3xl">+</div>
                </button>
                <p className="text-sm text-gray-600 text-center">New letter</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && resumes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No documents yet. Create your first resume or cover letter!
            </p>
          </div>
        )}
          </>
        )}
      </div>

      {/* Menu for document actions */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditTitle}>Edit title</MenuItem>
        <MenuItem onClick={handleDuplicate}>Duplicate</MenuItem>
        <MenuItem
          onClick={() => {
            handleDelete(selectedDocId, editDocType);
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Edit Title Dialog */}
      <Dialog open={editTitleOpen} onClose={() => setEditTitleOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit title</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Document title"
            fullWidth
            variant="outlined"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTitleOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTitle}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Home;
