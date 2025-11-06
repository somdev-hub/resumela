import React, { useCallback, useRef, useState, useEffect } from "react";
// MUI components for polished toasts/dialogs/progress
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import ReactDOM from "react-dom/client";
// Map to reuse a React root for measurement containers to avoid createRoot() being called multiple times
const measurementRoots = new WeakMap();
// pdf generation is handled server-side; client-side html2canvas/jsPDF removed
import { FiPlus, FiChevronDown, FiChevronUp, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import MultiPageResume from "../components/MultiPageResume";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import UrlDialog from "../components/UrlDialog";
import AddSectionDialog from "../components/AddSectionDialog";
import RichTextEditor from "../components/RichTextEditor";
import SectionPreview from "../components/SectionPreview";
import { renderSectionForm } from "../components/SectionForms";
import { useParams, useNavigate } from "react-router-dom";

import { availableSections } from "../customization/AvailableSections";
import { fontsByCategory } from "../customization/Fonts";
import ResumeNav from "../components/ResumeNav";
import firestore from "../firebase/firestore";

const Resume = () => {
  // ...existing code...
  const A4_WIDTH_PX = 794;
  const A4_HEIGHT_PX = 1123;

  // Central resume state: single source of truth for resume contents and presentation
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

  const [showAddSection, setShowAddSection] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [activeFontCategory, setActiveFontCategory] = useState("serif");

  // URL dialog state for LinkedIn / GitHub
  const [urlDialog, setUrlDialog] = useState({
    open: false,
    field: null,
    tempUrl: "",
    target: null, // null | { sectionId, itemId }
  });

  // firestore doc id used to link content and layout documents
  const [firestoreDocId, setFirestoreDocId] = useState(null);
  // local input for loading a specific doc id
  const [loadDocId, setLoadDocId] = useState("");
  // saving state & lightweight toast/status
  const [isSaving, setIsSaving] = useState(false);
  // snackbar state (replaces inline saveMessage)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  // last saved timestamp
  const [lastSavedAt, setLastSavedAt] = useState(null);
  // conflict confirmation dialog state
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const pendingSaveRef = useRef({});
  // refs for autosave debounce & last-saved signature
  const autosaveTimerRef = useRef(null);
  const lastSavedSignatureRef = useRef(null);
  // track last local edit timestamp and per-field edit timestamps to enable three-way merge
  const lastLocalChangeAtRef = useRef(null);
  const lastEditsRef = useRef(new Map()); // Map<path, timestamp>
  const hasUserEditedRef = useRef(false); // Track if user has made any edits

  const showSnackbar = (severity, text, timeout = 3000) => {
    setSnackbarSeverity(severity);
    setSnackbarMsg(text);
    setSnackbarOpen(true);
    if (timeout) setTimeout(() => setSnackbarOpen(false), timeout);
  };

  const draftLocalStorageKey = () => {
    try {
      return firestoreDocId
        ? `resume_draft_${firestoreDocId}`
        : `resume_draft_temp`;
    } catch {
      return `resume_draft_temp`;
    }
  };

  const saveDraftToLocal = (r) => {
    try {
      const sanitized = {
        formData: r.formData,
        sections: (r.sections || []).map((s) => ({
          id: s.id,
          name: s.name,
          visible: s.visible,
          items: (s.items || []).map((it) => ({
            id: it.id,
            collapsed: !!it.collapsed,
            data: it.data || {},
          })),
        })),
      };
      const payload = {
        ts: Date.now(),
        content: sanitized,
        edits: Array.from(lastEditsRef.current.entries()),
      };
      localStorage.setItem(draftLocalStorageKey(), JSON.stringify(payload));
      lastLocalChangeAtRef.current = Date.now();
    } catch (e) {
      // ignore localStorage errors
    }
  };

  const openUrlDialog = (target) => {
    // target can be a string (personal field name) or an object { sectionId, itemId, field }
    if (typeof target === "string") {
      setUrlDialog({
        open: true,
        field: target,
        tempUrl: resume.formData[target + "Url"] || "",
        target: null,
      });
    } else {
      const { sectionId, itemId, field } = target || {};
      const section = resume.sections.find((s) => s.id === sectionId);
      const item = section?.items?.find((it) => it.id === itemId);
      const val = item?.data?.[field + "Url"] || "";
      setUrlDialog({
        open: true,
        field: field || null,
        tempUrl: val,
        target: { sectionId, itemId },
      });
    }
  };

  const closeUrlDialog = () =>
    setUrlDialog({ open: false, field: null, tempUrl: "", target: null });

  const saveUrlFromDialog = () => {
    if (!urlDialog.field) return closeUrlDialog();

    if (!urlDialog.target) {
      // personal field
      setResume((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          [urlDialog.field + "Url"]: urlDialog.tempUrl,
        },
      }));
      // record edit
      lastEditsRef.current.set(`formData.${urlDialog.field}Url`, Date.now());
    } else {
      // section item field
      const { sectionId, itemId } = urlDialog.target;
      setResume((prev) => ({
        ...prev,
        sections: prev.sections.map((section) => {
          if (section.id !== sectionId) return section;
          return {
            ...section,
            items: section.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    data: {
                      ...item.data,
                      [urlDialog.field + "Url"]: urlDialog.tempUrl,
                    },
                  }
                : item
            ),
          };
        }),
      }));
      // record edit for that field
      lastEditsRef.current.set(
        `sections.${sectionId}.items.${itemId}.data.${urlDialog.field}Url`,
        Date.now()
      );
    }

    closeUrlDialog();
  };

  const loadGoogleFont = (cssFamily) => {
    // check if already loaded
    if (document.querySelector(`link[data-googlefont='${cssFamily}']`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${cssFamily}&display=swap`;
    link.setAttribute("data-googlefont", cssFamily);
    document.head.appendChild(link);
  };

  // load initial font from central state
  React.useEffect(() => {
    if (resume.selectedFont && resume.selectedFont.css)
      loadGoogleFont(resume.selectedFont.css);
  }, [resume.selectedFont]);

  const params = useParams();
  const navigate = useNavigate();

  // On mount or when docId param changes, handle document loading/creation
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
        const content = await firestore.getResumeContent(urlDocId);
        
        if (content) {
          // Document exists, load it
          await loadFromFirestore(urlDocId);
        } else {
          // Document doesn't exist, create it as "Untitled Resume"
          const initialContent = {
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
            sections: [],
          };
          
          const initialLayout = {
            layoutConfig: resume.layoutConfig,
            spacingConfig: resume.spacingConfig,
            personalConfig: resume.personalConfig,
            selectedFont: resume.selectedFont,
            sectionOrder: resume.sectionOrder,
          };
          
          // Create the document in Firestore with the URL's docId
          await firestore.saveResumeContent(urlDocId, {
            ...initialContent,
            title: "Untitled Resume",
          });
          await firestore.saveResumeLayout(urlDocId, initialLayout);
          
          // Update signature to prevent immediate re-save
          lastSavedSignatureRef.current = computeSignature(resume);
          setLastSavedAt(new Date().toISOString());
          
          showSnackbar("success", "New resume created", 2000);
        }
        
        // Persist the docId to localStorage
        try {
          localStorage.setItem("resume_firestore_docId", urlDocId);
        } catch (e) {
          // ignore localStorage errors
        }
      } catch (err) {
        console.error("Failed to initialize document:", err);
        showSnackbar("error", "Failed to initialize resume", 3000);
      }
    };
    
    initializeDocument();
  }, [params?.docId]);

  // keep loadDocId in sync when firestoreDocId changes
  useEffect(() => {
    if (firestoreDocId) setLoadDocId(firestoreDocId);
  }, [firestoreDocId]);

  // Autosave: debounce resume changes and save automatically
  useEffect(() => {
    let sig = null;
    try {
      sig = JSON.stringify({
        formData: resume.formData,
        sections: resume.sections,
        layoutConfig: resume.layoutConfig,
        spacingConfig: resume.spacingConfig,
        personalConfig: resume.personalConfig,
        selectedFont: resume.selectedFont,
        sectionOrder: resume.sectionOrder,
      });
    } catch (e) {
      sig = null;
    }

    if (sig && lastSavedSignatureRef.current === sig) {
      // still persist draft locally even if signature matches
      saveDraftToLocal(resume);
      return; // nothing changed since last save
    }

    // Mark that user has made edits
    hasUserEditedRef.current = true;

    // persist draft locally on every change
    saveDraftToLocal(resume);

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      // Only autosave to Firestore if we have a doc ID and not currently saving
      if (!isSaving && firestoreDocId) {
        saveToFirestore({ skipConflictCheck: true });
      }
    }, 2500);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [resume]);

  // helper to compute a deterministic signature of the important resume parts
  const computeSignature = (r) => {
    try {
      return JSON.stringify({
        formData: r.formData,
        sections: r.sections,
        layoutConfig: r.layoutConfig,
        spacingConfig: r.spacingConfig,
        personalConfig: r.personalConfig,
        selectedFont: r.selectedFont,
        sectionOrder: r.sectionOrder,
      });
    } catch (e) {
      return null;
    }
  };

  const formatLastSaved = (iso) => {
    if (!iso) return "Never";
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch (e) {
      return iso;
    }
  };

  // Local aliases used in render: ensure these are defined to avoid accidental
  // `spacingConfig` / `layoutConfig` undefined errors in templates that reference
  // them directly. Use safe fallbacks to an empty object.

  const pdfPreviewRef = useRef(null);
  const photoInputRef = useRef(null);

  // refs and state for measuring section heights and distributing them into columns
  const measureContainerRef = useRef(null);
  const [distributed, setDistributed] = useState({
    left: [],
    right: [],
    first: null,
  });

  const combinedPreviewRef = useCallback((node) => {
    pdfPreviewRef.current = node;
  }, []);

  // DnD sensors for sortable lists in the editor
  const pointerSensor = useSensor(PointerSensor);
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });
  const sensors = useSensors(pointerSensor, keyboardSensor);

  const handleDragEnd = (sectionId, event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setResume((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.id !== sectionId) return section;
        const ids = section.items.map((i) => i.id);
        const oldIndex = ids.indexOf(active.id);
        const newIndex = ids.indexOf(over.id);
        if (oldIndex === -1 || newIndex === -1) return section;
        return {
          ...section,
          items: arrayMove(section.items, oldIndex, newIndex),
        };
      }),
    }));
  };

  // Measure section heights and distribute into left/right columns based on available height
  useEffect(() => {
    if (!measureContainerRef.current) return;

    const visibleSections = resume.sectionOrder
      .map((sectionId) => resume.sections.find((s) => s.id === sectionId))
      .filter((s) => s && s.visible);

    // prepare container
    const container = measureContainerRef.current;

    // compute px per mm conversion used elsewhere
    const PX_PER_MM = 3.78;

    // set container width in px to match actual left column width in preview (more reliable)
    const preview = pdfPreviewRef.current;
    if (preview) {
      // try to locate the actual grid container with inline grid-template-columns style
      const grid = preview.querySelector('[style*="grid-template-columns"]');
      if (grid && grid.children && grid.children.length >= 1) {
        const leftCol = grid.children[0];
        if (leftCol && leftCol.clientWidth) {
          container.style.width = `${leftCol.clientWidth}px`;
        }
      }

      // fallback: compute from preview inner width minus LR padding
      if (!container.style.width) {
        const paddingLR = (resume.spacingConfig.marginLR || 0) * PX_PER_MM;
        const previewInnerWidth = preview.clientWidth - paddingLR * 2;
        const leftPx = Math.floor(
          (resume.layoutConfig.leftColumnWidth / 100) * previewInnerWidth
        );
        container.style.width = `${leftPx}px`;
      }

      container.style.boxSizing = "border-box";

      // copy relevant CSS variables and font-family from preview to measurement container
      const cs = getComputedStyle(preview);
      [
        "--resume-font-size",
        "--resume-line-height",
        "--resume-entry-spacing",
      ].forEach((v) => {
        const val = cs.getPropertyValue(v);
        if (val) container.style.setProperty(v, val.trim());
      });
      container.style.fontFamily = cs.fontFamily;
    }

    // create or reuse a react root for this container. Reusing prevents calling createRoot() multiple times
    let root = measurementRoots.get(container);
    if (!root) {
      root = ReactDOM.createRoot(container);
      measurementRoots.set(container, root);
    }

    const MeasurementApp = () => (
      <div style={{ width: "100%" }}>
        {visibleSections.map((section) => (
          <div
            key={section.id}
            data-section-id={section.id}
            className="measure-entry"
          >
            <SectionPreview
              section={section}
              spacingConfig={resume.spacingConfig}
            />
          </div>
        ))}
      </div>
    );

    // render measurement UI
    root.render(<MeasurementApp />);

    // measure heights after mount
    const id = setTimeout(() => {
      const heights = {};
      visibleSections.forEach((section) => {
        const node = container.querySelector(
          `[data-section-id="${section.id}"]`
        );
        heights[section.id] = node ? node.offsetHeight : 0;
      });

      // compute available height in preview area for sections (exclude header/profile areas and padding)
      let availableHeight = 0;
      if (preview) {
        const paddingTB = (resume.spacingConfig.marginTB || 0) * PX_PER_MM;

        // measure header/profile heights if present
        const header =
          preview.querySelector(".resume-header") ||
          preview.querySelector(".pb-6") ||
          null;
        const profile = preview.querySelector(".mb-6") || null;

        const headerHeight = header ? header.offsetHeight : 0;
        const profileHeight = profile ? profile.offsetHeight : 0;

        // available height should be the preview inner height minus header/profile
        const previewInnerHeight = preview.clientHeight - paddingTB * 2;
        availableHeight = Math.max(
          0,
          previewInnerHeight - headerHeight - profileHeight
        );
      }

      // distribute sections into left/right columns trying to fill left first
      const left = [];
      const right = [];
      let leftUsed = 0;
      const columnHeight = availableHeight || 800;

      // preserve original visibleSections order while filling left column
      for (let i = 0; i < visibleSections.length; i++) {
        const section = visibleSections[i];
        const h = heights[section.id] || 100;

        // If this is the first section, always place in left even if it overflows
        if (left.length === 0) {
          left.push(section);
          leftUsed += h;
          continue;
        }

        // Only move to right if the section would cross the bottom padding (i.e. not fit)
        if (leftUsed + h <= columnHeight) {
          left.push(section);
          leftUsed += h;
        } else {
          right.push(section);
        }
      }

      setDistributed({ left, right, first: null });

      // unmount measurement UI after measurement to keep DOM clean. Render null rather than unmounting the root
      setTimeout(() => {
        try {
          root.render(null);
        } catch (e) {
          // swallowing errors during cleanup is OK — measurement is optional
        }
      }, 20);
    }, 50);

    return () => clearTimeout(id);
  }, [
    resume.sections,
    resume.sectionOrder,
    resume.layoutConfig,
    resume.spacingConfig,
    resume.selectedFont,
  ]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setResume((prev) => ({
      ...prev,
      formData: { ...prev.formData, [name]: value },
    }));
    try {
      lastEditsRef.current.set(`formData.${name}`, Date.now());
    } catch {}
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setResume((prev) => ({
        ...prev,
        formData: { ...prev.formData, photoUrl: e.target.result },
      }));
      try {
        lastEditsRef.current.set(`formData.photoUrl`, Date.now());
      } catch {}
    };
    reader.readAsDataURL(file);
  };

  const triggerPhotoPicker = () => {
    if (photoInputRef.current) photoInputRef.current.click();
  };

  const removePhoto = () => {
    setResume((prev) => ({
      ...prev,
      formData: { ...prev.formData, photoUrl: null },
    }));
    if (photoInputRef.current) photoInputRef.current.value = null;
  };

  const handleSectionReorder = (fromIndex, toIndex) => {
    setResume((prev) => {
      const newOrder = [...prev.sectionOrder];
      const [moved] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, moved);
      return { ...prev, sectionOrder: newOrder };
    });
  };

  // console.log(resume);
  

  // Save resume to Firestore (content and layout in separate collections)
  // options: force - bypass conflict check; skipConflictCheck - used by autosave to avoid prompting user
  const saveToFirestore = async ({
    force = false,
    skipConflictCheck = false,
  } = {}) => {
    // compute signature for current local state
    const localSig = computeSignature(resume);
    // allow conflict-resolution merge to write into this variable when needed
    let resumeToSave = resume;

    // conflict detection: only run if we have a linked doc, not forcing, and caller hasn't asked to skip checks (autosave)
    if (firestoreDocId && !force && !skipConflictCheck) {
      try {
        const remote = await firestore.getResumeContent(firestoreDocId);
        if (remote) {
          // Prefer server-side timestamp for change detection if available
          const remoteTs = remote.updatedAt || remote.createdAt || null;
          let remoteIso = null;
          try {
            if (remoteTs && typeof remoteTs.toDate === "function")
              remoteIso = remoteTs.toDate().toISOString();
            else if (remoteTs) remoteIso = new Date(remoteTs).toISOString();
          } catch (e) {
            remoteIso = null;
          }

          // If we have a lastSavedAt timestamp and remote is newer, check for content differences before prompting
          if (lastSavedAt && remoteIso) {
            try {
              if (new Date(remoteIso) > new Date(lastSavedAt)) {
                // remote changed since our last save — compare content-only payloads to avoid false positives
                const remoteSig = JSON.stringify({
                  formData: remote.formData || {},
                  sections: remote.sections || [],
                });
                const localSigContent = JSON.stringify({
                  formData: resume.formData || {},
                  sections: resume.sections || [],
                });
                if (remoteSig !== localSigContent) {
                  // Attempt a three-way, timestamp-based merge using per-field last edit times.
                  // If merge is not possible or remote timestamp is missing, fall back to prompting the user.
                  let remoteUpdatedMs = 0;
                  try {
                    if (
                      remote.updatedAt &&
                      typeof remote.updatedAt.toDate === "function"
                    )
                      remoteUpdatedMs = remote.updatedAt.toDate().getTime();
                    else if (remote.updatedAt)
                      remoteUpdatedMs = new Date(remote.updatedAt).getTime();
                  } catch (e) {
                    remoteUpdatedMs = 0;
                  }

                  // If we couldn't parse a remote timestamp, ask the user to confirm (safer fallback)
                  if (!remoteUpdatedMs) {
                    pendingSaveRef.current = { force: false };
                    setConflictDialogOpen(true);
                    showSnackbar(
                      "warning",
                      "Remote changes detected. Confirm to overwrite."
                    );
                    return;
                  }

                  // helper to get last edit timestamp for a path
                  const getLastEditTs = (path) => {
                    try {
                      const v = lastEditsRef.current.get(path);
                      return typeof v === "number" ? v : 0;
                    } catch (e) {
                      return 0;
                    }
                  };

                  // start merge from remote as base
                  const merged = JSON.parse(JSON.stringify(remote));

                  // merge formData fields by per-field last edit timestamp
                  merged.formData = merged.formData || {};
                  const localForm = resume.formData || {};
                  Object.keys({ ...merged.formData, ...localForm }).forEach(
                    (k) => {
                      const path = `formData.${k}`;
                      const localTs = getLastEditTs(path);
                      if (localTs && localTs > remoteUpdatedMs)
                        merged.formData[k] = localForm[k];
                      else
                        merged.formData[k] = merged.formData[k] ?? localForm[k];
                    }
                  );

                  // merge sections by id
                  merged.sections = merged.sections || [];
                  const localSections = resume.sections || [];
                  const sectionIds = new Set([
                    ...merged.sections.map((s) => s.id),
                    ...localSections.map((s) => s.id),
                  ]);

                  const mergedSections = [];
                  sectionIds.forEach((sid) => {
                    const rsec =
                      (merged.sections || []).find((s) => s.id === sid) || null;
                    const lsec =
                      (localSections || []).find((s) => s.id === sid) || null;
                    if (!rsec && lsec) {
                      // only local -> include
                      mergedSections.push(JSON.parse(JSON.stringify(lsec)));
                      return;
                    }
                    if (rsec && !lsec) {
                      // only remote -> include
                      mergedSections.push(JSON.parse(JSON.stringify(rsec)));
                      return;
                    }

                    // both exist -> merge fields and items
                    const out = JSON.parse(JSON.stringify(rsec || {}));
                    out.name =
                      getLastEditTs(`sections.${sid}.name`) > remoteUpdatedMs
                        ? lsec.name
                        : out.name;
                    out.visible =
                      getLastEditTs(`sections.${sid}.visible`) > remoteUpdatedMs
                        ? lsec.visible ?? out.visible
                        : out.visible;

                    // items union
                    const rItems = (rsec.items || []).slice();
                    const lItems = (lsec.items || []).slice();
                    const itemIds = new Set([
                      ...rItems.map((i) => i.id),
                      ...lItems.map((i) => i.id),
                    ]);
                    out.items = [];
                    itemIds.forEach((iid) => {
                      const rit = rItems.find((it) => it.id === iid) || null;
                      const lit = lItems.find((it) => it.id === iid) || null;
                      if (!rit && lit) {
                        out.items.push(JSON.parse(JSON.stringify(lit)));
                        return;
                      }
                      if (rit && !lit) {
                        out.items.push(JSON.parse(JSON.stringify(rit)));
                        return;
                      }

                      // both items present -> merge data keys
                      const oitem = JSON.parse(JSON.stringify(rit || {}));
                      oitem.data = oitem.data || {};
                      const ldata = (lit && lit.data) || {};
                      const dataKeys = new Set([
                        ...Object.keys(oitem.data || {}),
                        ...Object.keys(ldata || {}),
                      ]);
                      dataKeys.forEach((dk) => {
                        const path = `sections.${sid}.items.${iid}.data.${dk}`;
                        const localTs = getLastEditTs(path);
                        if (localTs && localTs > remoteUpdatedMs)
                          oitem.data[dk] = ldata[dk];
                        else oitem.data[dk] = oitem.data[dk] ?? ldata[dk];
                      });
                      // collapsed preference
                      const collapsedPath = `sections.${sid}.items.${iid}.collapsed`;
                      oitem.collapsed =
                        getLastEditTs(collapsedPath) > remoteUpdatedMs
                          ? lit.collapsed ?? oitem.collapsed
                          : oitem.collapsed;

                      out.items.push(oitem);
                    });

                    mergedSections.push(out);
                  });

                  // assign merged sections
                  merged.sections = mergedSections;

                  // At this point we have a merged object. Update local UI with merged result before saving
                  setResume((prev) => ({ ...prev, ...merged }));
                  // use merged object for the actual save that follows in this function
                  resumeToSave = merged;

                  // continue to save but mark as forced since we've already reconciled
                  // (will proceed below to persist merged content)
                }
              }
            } catch (e) {
              // if anything fails during comparison or merge, fallback to prompting the user
              try {
                pendingSaveRef.current = { force: false };
                setConflictDialogOpen(true);
                showSnackbar(
                  "warning",
                  "Remote changes detected. Confirm to overwrite."
                );
                return;
              } catch (_) {
                return;
              }
            }
          }
        }
      } catch (e) {
        // If remote check fails, we'll proceed with save and let server handle errors
        console.warn("Remote signature check failed, proceeding to save", e);
      }
    }

    try {
      setIsSaving(true);
      showSnackbar("info", "Saving...", 0);

      // prepare content (personal fields + sections)
      // sanitize objects for Firestore (remove functions, DOM nodes, undefined)
      const sanitizeForFirestore = (v) => {
        if (v == null) return v;
        if (typeof v === "function") return undefined;
        if (v instanceof Date) return v.toISOString();
        if (Array.isArray(v))
          return v
            .map((x) => sanitizeForFirestore(x))
            .filter((x) => x !== undefined);
        if (typeof v === "object") {
          const out = {};
          Object.keys(v).forEach((k) => {
            try {
              const val = v[k];
              if (typeof val === "function" || typeof val === "undefined") {
                // skip
                return;
              }
              const s = sanitizeForFirestore(val);
              if (typeof s !== "undefined") out[k] = s;
            } catch (e) {
              // skip problematic keys
            }
          });
          return out;
        }
        return v;
      };

      const content = {
        formData: sanitizeForFirestore(resumeToSave.formData),
        sections: (resumeToSave.sections || []).map((s) => ({
          id: s.id,
          name: s.name,
          visible: s.visible,
          // items: sanitize deeply but avoid saving component/icon references
          items: (s.items || []).map((it) => ({
            id: it.id,
            collapsed: !!it.collapsed,
            data: sanitizeForFirestore(it.data || {}),
          })),
        })),
      };

      // prepare layout
      const layout = sanitizeForFirestore({
        layoutConfig: resumeToSave.layoutConfig,
        spacingConfig: resumeToSave.spacingConfig,
        personalConfig: resumeToSave.personalConfig,
        selectedFont: resumeToSave.selectedFont,
        sectionOrder: resumeToSave.sectionOrder,
      });

      // Use the existing docId from URL/state
      const docId = firestoreDocId;
      if (!docId) {
        showSnackbar("error", "No document ID available");
        return;
      }
      
      // Save to existing document
      await firestore.saveResumeContent(docId, content);
      await firestore.saveResumeLayout(docId, layout);

      // persist doc id so subsequent sessions reuse the same document
      try {
        if (docId) localStorage.setItem("resume_firestore_docId", docId);
      } catch (e) {
        // ignore localStorage errors
      }

      // update last saved signature — prefer server timestamp if available
      try {
        const savedRemote = await firestore.getResumeContent(docId);
        const sig = JSON.stringify({
          formData: savedRemote?.formData || {},
          sections: savedRemote?.sections || [],
        });
        lastSavedSignatureRef.current = sig;
        // prefer server's updatedAt when present
        let serverIso = null;
        try {
          const ts = savedRemote?.updatedAt || savedRemote?.createdAt || null;
          if (ts && typeof ts.toDate === "function")
            serverIso = ts.toDate().toISOString();
          else if (ts) serverIso = new Date(ts).toISOString();
        } catch (e) {
          serverIso = null;
        }
        setLastSavedAt(serverIso || new Date().toISOString());
      } catch (e) {
        lastSavedSignatureRef.current = localSig;
        setLastSavedAt(new Date().toISOString());
      }

      showSnackbar("success", "Saved", 2500);

      console.log("Saved resume to Firestore, docId=", docId);
    } catch (err) {
      console.error("Failed to save resume to Firestore:", err);
      showSnackbar("error", "Save failed", 3500);
    } finally {
      setIsSaving(false);
    }
  };

  // Load resume content & layout from Firestore by doc id
  const loadFromFirestore = async (docId) => {
    if (!docId) {
      showSnackbar("error", "No doc id", 3000);
      return;
    }
    setIsSaving(true);
    showSnackbar("info", "Loading...", 0);
    try {
      const content = await firestore.getResumeContent(docId);
      console.log(content);
      
      const layout = await firestore.getResumeLayout(docId);

      if (!content && !layout) {
        showSnackbar("error", "Document not found", 2500);
        return;
      }

      // Ensure sectionOrder contains only explicitly added sections
      const validSectionOrder = (layout?.sectionOrder || []).filter((sectionId) =>
        (content?.sections || []).some((s) => s.id === sectionId)
      );

      // Hydrate sections with icons from availableSections
      const hydratedSections = (content?.sections || []).map((s) => ({
        ...s,
        icon: availableSections.find((a) => a.id === s.id)?.icon,
      }));

      setResume((prev) => ({
        ...prev,
        ...(content || {}),
        sections: hydratedSections.length
          ? hydratedSections
          : content?.sections || prev.sections,
        ...(layout || {}),
        sectionOrder: validSectionOrder,
      }));

      setFirestoreDocId(docId);
      try {
        localStorage.setItem("resume_firestore_docId", docId);
      } catch (e) {}

      // Update last saved signature from the loaded content
      try {
        const sig = JSON.stringify({
          formData: content?.formData || {},
          sections: content?.sections || [],
        });
        lastSavedSignatureRef.current = sig;
        setLastSavedAt(new Date().toISOString());
      } catch (e) {}

      showSnackbar("success", "Loaded", 2000);
    } catch (err) {
      console.error("Failed to load from Firestore:", err);
      showSnackbar("error", "Load failed", 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const addSection = (sectionId) => {
    const sectionTemplate = availableSections.find((s) => s.id === sectionId);
    if (!sectionTemplate) return;
    setResume((prev) => {
      const exists = prev.sections.find((s) => s.id === sectionId);
      const newSections = exists
        ? prev.sections.map((s) =>
            s.id === sectionId ? { ...s, visible: true } : s
          )
        : [
            ...prev.sections,
            {
              id: sectionId,
              name: sectionTemplate.name,
              icon: sectionTemplate.icon,
              visible: true,
              items: [],
            },
          ];

      const newOrder = prev.sectionOrder.includes(sectionId)
        ? prev.sectionOrder
        : [...prev.sectionOrder, sectionId];

      return { ...prev, sections: newSections, sectionOrder: newOrder };
    });
    setShowAddSection(false);
  };

  // sections are removed implicitly when they have no items; explicit removeSection function removed

  const addItemToSection = (sectionId) => {
    const newItemId = Date.now();
    setResume((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: [
              ...section.items,
              { id: newItemId, data: {}, collapsed: false },
            ],
          };
        }
        return section;
      }),
    }));
    try {
      lastEditsRef.current.set(
        `sections.${sectionId}.items.${newItemId}`,
        Date.now()
      );
    } catch {}
  };

  const removeItemFromSection = (sectionId, itemId) => {
    setResume((prev) => {
      const newSections = prev.sections.map((section) => {
        if (section.id !== sectionId) return section;
        const newItems = section.items.filter((item) => item.id !== itemId);
        // If no items remain, mark section as not visible (remove it)
        if (!newItems || newItems.length === 0) {
          return { ...section, items: [], visible: false };
        }
        return { ...section, items: newItems };
      });
      return { ...prev, sections: newSections };
    });
  };

  const updateSectionItem = (sectionId, itemId, field, value) => {
    setResume((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map((item) =>
              item.id === itemId
                ? { ...item, data: { ...item.data, [field]: value } }
                : item
            ),
          };
        }
        return section;
      }),
    }));
    try {
      lastEditsRef.current.set(
        `sections.${sectionId}.items.${itemId}.data.${field}`,
        Date.now()
      );
    } catch {}
  };

  const toggleItemCollapsed = (sectionId, itemId) => {
    setResume((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map((item) =>
              item.id === itemId
                ? { ...item, collapsed: !item.collapsed }
                : item
            ),
          };
        }
        return section;
      }),
    }));
  };

  const toggleItemVisibility = (sectionId, itemId) => {
    setResume((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map((item) =>
              item.id === itemId
                ? { ...item, visible: Object.prototype.hasOwnProperty.call(item, "visible") ? !item.visible : false }
                : item
            ),
          };
        }
        return section;
      }),
    }));
    try {
      lastEditsRef.current.set(`sections.${sectionId}.items.${itemId}.visible`, Date.now());
    } catch (e) {}
  };

  // Inline edit state for section title
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingSectionName, setEditingSectionName] = useState("");

  const startEditSection = (section) => {
    setEditingSectionId(section.id);
    setEditingSectionName(section.name || "");
  };

  const cancelEditSection = () => {
    setEditingSectionId(null);
    setEditingSectionName("");
  };

  const saveSectionName = (sectionId) => {
    setResume((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, name: editingSectionName } : s
      ),
    }));
    try {
      lastEditsRef.current.set(`sections.${sectionId}.name`, Date.now());
    } catch (e) {}
    cancelEditSection();
  };

  const toggleSectionCollapsed = (sectionId) => {
    setResume((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId
          ? { ...s, collapsed: Object.prototype.hasOwnProperty.call(s, "collapsed") ? !s.collapsed : true }
          : s
      ),
    }));
    try {
      lastEditsRef.current.set(`sections.${sectionId}.collapsed`, Date.now());
    } catch (e) {}
  };

  const personalFields = [
    { label: "Full Name", name: "fullName", type: "text", colSpan: 1 },
    { label: "Professional Title", name: "title", type: "text", colSpan: 1 },
    { label: "Email", name: "email", type: "email", colSpan: 1 },
    { label: "Phone", name: "phone", type: "text", colSpan: 1 },
    { label: "Location", name: "location", type: "text", colSpan: 2 },
    { label: "LinkedIn", name: "linkedin", type: "text", colSpan: 1 },
    { label: "GitHub", name: "github", type: "text", colSpan: 1 },
  ];

  // ...existing code...

  // const { printFn, componentRef } = useResumePrint();

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      <ResumeNav />

      <main className="flex-1 w-full pt-20">
        <div className="mx-auto flex w-full gap-2 px-6 md:flex-row items-start h-[calc(100vh-80px)] justify-center pt-4">
          {/* Left Editor Column */}
          <section className="w-full  h-full">
            <div className="w-full bg-white/90 p-8 shadow-xl ring-1 ring-indigo-100 h-full flex flex-col">
              {/* Tabs */}
              <div className="flex items-center gap-2 mb-6 border-b border-slate-200">
                <button
                  onClick={() => setActiveTab("content")}
                  className={`px-4 py-2 font-medium border-b-2 transition ${
                    activeTab === "content"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Content
                </button>
                <button
                  onClick={() => setActiveTab("customize")}
                  className={`px-4 py-2 font-medium border-b-2 transition ${
                    activeTab === "customize"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Customize
                </button>
              </div>

              <div className="flex-1 overflow-y-auto hide-scrollbar pr-2">
                {activeTab === "customize" ? (
                  // Customize Tab
                  <div>
                    {/* Layout Section */}
                    <div className="mb-8">
                      <h3 className="text-base font-semibold text-slate-800 mb-4">
                        Layout
                      </h3>

                      <div className="mb-6">
                        <label className="text-sm font-medium text-slate-700 block mb-3">
                          Columns
                        </label>
                        <div className="flex gap-3">
                          {[
                            { value: "one", label: "One", icon: "|||" },
                            { value: "two", label: "Two", icon: "||" },
                            { value: "mix", label: "Mix", icon: "|≡|" },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() =>
                                setResume((prev) => ({
                                  ...prev,
                                  layoutConfig: {
                                    ...prev.layoutConfig,
                                    columns: option.value,
                                  },
                                }))
                              }
                              className={`flex items-center justify-center w-20 h-20 rounded-lg border-2 transition ${
                                resume.layoutConfig.columns === option.value
                                  ? "border-indigo-600 bg-indigo-50"
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <div className="text-xs text-slate-600 font-medium">
                                {option.label}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="text-sm font-medium text-slate-700 block mb-3">
                          Header Position
                        </label>
                        <div className="flex gap-3">
                          {[
                            { value: "top", label: "Top" },
                            { value: "left", label: "Left" },
                            { value: "right", label: "Right" },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() =>
                                setResume((prev) => ({
                                  ...prev,
                                  layoutConfig: {
                                    ...prev.layoutConfig,
                                    headerPosition: option.value,
                                  },
                                }))
                              }
                              className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition ${
                                resume.layoutConfig.headerPosition ===
                                option.value
                                  ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                                  : "border-slate-200 text-slate-700 hover:border-slate-300"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="text-sm font-medium text-slate-700 block mb-3">
                          Column Width
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-slate-600">
                                Left
                              </span>
                              <span className="text-xs font-medium text-slate-700">
                                {resume.layoutConfig.leftColumnWidth}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="30"
                              max="70"
                              value={resume.layoutConfig.leftColumnWidth}
                              onChange={(e) =>
                                setResume((prev) => ({
                                  ...prev,
                                  layoutConfig: {
                                    ...prev.layoutConfig,
                                    leftColumnWidth: parseInt(e.target.value),
                                    rightColumnWidth:
                                      100 - parseInt(e.target.value),
                                  },
                                }))
                              }
                              className="w-full"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-slate-600">
                                Right
                              </span>
                              <span className="text-xs font-medium text-slate-700">
                                {resume.layoutConfig.rightColumnWidth}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="30"
                              max="70"
                              value={resume.layoutConfig.rightColumnWidth}
                              onChange={(e) =>
                                setResume((prev) => ({
                                  ...prev,
                                  layoutConfig: {
                                    ...prev.layoutConfig,
                                    rightColumnWidth: parseInt(e.target.value),
                                    leftColumnWidth:
                                      100 - parseInt(e.target.value),
                                  },
                                }))
                              }
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Font Section */}
                    <div className="mb-8">
                      <h3 className="text-base font-semibold text-slate-800 mb-4">
                        Font
                      </h3>
                      <div className="flex items-center gap-3 mb-4">
                        {["serif", "sans", "mono"].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setActiveFontCategory(cat)}
                            className={`px-4 py-2 rounded-lg border transition text-sm ${
                              activeFontCategory === cat
                                ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                                : "border-slate-200 text-slate-700"
                            }`}
                          >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {fontsByCategory[activeFontCategory].map((f) => (
                          <button
                            key={f.family}
                            onClick={() => {
                              setResume((prev) => ({
                                ...prev,
                                selectedFont: {
                                  family: f.family,
                                  category: activeFontCategory,
                                  css: f.css,
                                },
                              }));
                              loadGoogleFont(f.css);
                            }}
                            className={`w-full text-left px-4 py-2 rounded-lg border transition text-sm ${
                              resume.selectedFont.family === f.family
                                ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                                : "border-slate-200 text-slate-700"
                            }`}
                          >
                            {f.family}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Personal Details Section */}
                    <div className="mb-8">
                      <h3 className="text-base font-semibold text-slate-800 mb-4">
                        Personal Details
                      </h3>

                      <div className="mb-4">
                        <div className="mb-2 text-sm font-medium text-slate-700">
                          Align
                        </div>
                        <div className="flex gap-3">
                          {[
                            { key: "left", label: "Left" },
                            { key: "center", label: "Center" },
                            { key: "right", label: "Right" },
                          ].map((opt) => (
                            <button
                              key={opt.key}
                              onClick={() =>
                                setResume((prev) => ({
                                  ...prev,
                                  personalConfig: {
                                    ...prev.personalConfig,
                                    align: opt.key,
                                  },
                                }))
                              }
                              className={`px-4 py-3 rounded-lg border w-32 text-sm ${
                                resume.personalConfig.align === opt.key
                                  ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                                  : "border-slate-200 text-slate-700"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="mb-2 text-sm font-medium text-slate-700">
                          Arrangement
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              setResume((prev) => ({
                                ...prev,
                                personalConfig: {
                                  ...prev.personalConfig,
                                  arrangement: "single",
                                },
                              }))
                            }
                            className={`px-4 py-3 rounded-lg border w-40 text-sm ${
                              resume.personalConfig.arrangement === "single"
                                ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                                : "border-slate-200 text-slate-700"
                            }`}
                          >
                            Single column
                          </button>
                          <button
                            onClick={() =>
                              setResume((prev) => ({
                                ...prev,
                                personalConfig: {
                                  ...prev.personalConfig,
                                  arrangement: "two",
                                },
                              }))
                            }
                            className={`px-4 py-3 rounded-lg border w-40 text-sm ${
                              resume.personalConfig.arrangement === "two"
                                ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                                : "border-slate-200 text-slate-700"
                            }`}
                          >
                            Two columns
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 text-sm font-medium text-slate-700">
                          Contact style
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              setResume((prev) => ({
                                ...prev,
                                personalConfig: {
                                  ...prev.personalConfig,
                                  contactStyle: "icon",
                                },
                              }))
                            }
                            className={`px-4 py-3 rounded-lg border w-32 text-sm ${
                              resume.personalConfig.contactStyle === "icon"
                                ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                                : "border-slate-200 text-slate-700"
                            }`}
                          >
                            Icon
                          </button>
                          <button
                            onClick={() =>
                              setResume((prev) => ({
                                ...prev,
                                personalConfig: {
                                  ...prev.personalConfig,
                                  contactStyle: "bullet",
                                },
                              }))
                            }
                            className={`px-4 py-3 rounded-lg border w-32 text-sm ${
                              resume.personalConfig.contactStyle === "bullet"
                                ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                                : "border-slate-200 text-slate-700"
                            }`}
                          >
                            Bullet
                          </button>
                          <button
                            onClick={() =>
                              setResume((prev) => ({
                                ...prev,
                                personalConfig: {
                                  ...prev.personalConfig,
                                  contactStyle: "bar",
                                },
                              }))
                            }
                            className={`px-4 py-3 rounded-lg border w-32 text-sm ${
                              resume.personalConfig.contactStyle === "bar"
                                ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                                : "border-slate-200 text-slate-700"
                            }`}
                          >
                            Bar
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Spacing Section */}
                    <div className="mb-8">
                      <h3 className="text-base font-semibold text-slate-800 mb-4">
                        Spacing
                      </h3>

                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-slate-700">
                            Font Size
                          </label>
                          <span className="text-sm text-slate-600">
                            {resume.spacingConfig.fontSize}pt
                          </span>
                        </div>
                        <input
                          type="range"
                          min="8"
                          max="14"
                          value={resume.spacingConfig.fontSize}
                          onChange={(e) =>
                            setResume((prev) => ({
                              ...prev,
                              spacingConfig: {
                                ...prev.spacingConfig,
                                fontSize: parseInt(e.target.value),
                              },
                            }))
                          }
                          className="w-full"
                        />
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-slate-700">
                            Line Height
                          </label>
                          <span className="text-sm text-slate-600">
                            {resume.spacingConfig.lineHeight}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="2"
                          step="0.05"
                          value={resume.spacingConfig.lineHeight}
                          onChange={(e) =>
                            setResume((prev) => ({
                              ...prev,
                              spacingConfig: {
                                ...prev.spacingConfig,
                                lineHeight: parseFloat(e.target.value),
                              },
                            }))
                          }
                          className="w-full"
                        />
                      </div>

                      <div className="mb-6 grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700">
                              Left & Right Margin
                            </label>
                            <span className="text-sm text-slate-600">
                              {resume.spacingConfig.marginLR}mm
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="25"
                            value={resume.spacingConfig.marginLR}
                            onChange={(e) =>
                              setResume((prev) => ({
                                ...prev,
                                spacingConfig: {
                                  ...prev.spacingConfig,
                                  marginLR: parseInt(e.target.value),
                                },
                              }))
                            }
                            className="w-full"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700">
                              Top & Bottom Margin
                            </label>
                            <span className="text-sm text-slate-600">
                              {resume.spacingConfig.marginTB}mm
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="25"
                            value={resume.spacingConfig.marginTB}
                            onChange={(e) =>
                              setResume((prev) => ({
                                ...prev,
                                spacingConfig: {
                                  ...prev.spacingConfig,
                                  marginTB: parseInt(e.target.value),
                                },
                              }))
                            }
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-slate-700">
                            Space between Entries
                          </label>
                          <span className="text-sm text-slate-600">
                            {resume.spacingConfig.entrySpacing}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          value={resume.spacingConfig.entrySpacing}
                          onChange={(e) =>
                            setResume((prev) => ({
                              ...prev,
                              spacingConfig: {
                                ...prev.spacingConfig,
                                entrySpacing: parseInt(e.target.value),
                              },
                            }))
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                    {/* Section Order */}
                    <div className="border-t border-slate-200 pt-6">
                      <h3 className="text-base font-semibold text-slate-800 mb-4">
                        Change Section Order
                      </h3>
                      <div className="space-y-2">
                        {resume.sectionOrder.map((sectionId, index) => {
                          const section = resume.sections.find(
                            (s) => s.id === sectionId
                          );
                          const Icon = section?.icon;
                          return (
                            <div
                              key={sectionId}
                              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                            >
                              <div className="flex gap-1">
                                <button
                                  onClick={() =>
                                    index > 0 &&
                                    handleSectionReorder(index, index - 1)
                                  }
                                  disabled={index === 0}
                                  className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
                                  title="Move up"
                                >
                                  ↑
                                </button>
                                <button
                                  onClick={() =>
                                    index < resume.sectionOrder.length - 1 &&
                                    handleSectionReorder(index, index + 1)
                                  }
                                  disabled={
                                    index === resume.sectionOrder.length - 1
                                  }
                                  className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
                                  title="Move down"
                                >
                                  ↓
                                </button>
                              </div>
                              {Icon && (
                                <Icon size={16} className="text-slate-600" />
                              )}
                              <span className="text-sm font-medium text-slate-700">
                                {section?.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Personal Info */}
                    <div>
                      <h2 className="text-lg font-semibold text-slate-800">
                        Personal Information
                      </h2>
                      <p className="text-sm text-slate-500 mb-6">
                        Basic details about yourself
                      </p>

                      {/* Photo Upload */}
                      <div className="mb-6 flex items-center gap-4">
                        <div className="h-24 w-24 rounded-full border-2 border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden">
                          {resume.formData.photoUrl ? (
                            <img
                              src={resume.formData.photoUrl}
                              alt="profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-slate-400 text-center px-2">
                              No photo
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={triggerPhotoPicker}
                            className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm font-medium"
                          >
                            Upload Photo
                          </button>
                          {resume.formData.photoUrl && (
                            <button
                              onClick={removePhoto}
                              className="inline-flex items-center gap-2 rounded-md bg-rose-100 px-3 py-1 text-sm font-medium text-rose-600"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {personalFields.map(
                          ({ label, name, type, colSpan }) => {
                            const isSocial =
                              name === "linkedin" || name === "github";
                            return (
                              <div
                                key={name}
                                className={colSpan === 2 ? "md:col-span-2" : ""}
                              >
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                  {label}
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type={type}
                                    name={name}
                                    value={resume.formData[name]}
                                    onChange={handleInputChange}
                                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                  />
                                  {isSocial && (
                                    <button
                                      type="button"
                                      onClick={() => openUrlDialog(name)}
                                      className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100"
                                      title={`Add URL for ${label}`}
                                    >
                                      Link
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>

                      {/* URL Dialog using MUI Dialog component */}
                      <UrlDialog
                        open={urlDialog.open}
                        field={urlDialog.field}
                        tempUrl={urlDialog.tempUrl}
                        onClose={closeUrlDialog}
                        onSave={saveUrlFromDialog}
                        onChange={(e) =>
                          setUrlDialog((prev) => ({
                            ...prev,
                            tempUrl: e.target.value,
                          }))
                        }
                      />

                      <div className="mt-6">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Professional Profile
                        </label>
                        <RichTextEditor
                          value={resume.formData.profile}
                          onChange={(html) =>
                            setResume((prev) => ({
                              ...prev,
                              formData: { ...prev.formData, profile: html },
                            }))
                          }
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>

                    {/* Sections */}
                    <div className="mt-10 border-t border-slate-200 pt-8">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-slate-800">
                          Resume Sections
                        </h2>
                        <button
                          onClick={() => setShowAddSection(!showAddSection)}
                          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
                        >
                          <FiPlus /> Add Section
                        </button>
                      </div>

                      <AddSectionDialog
                        open={showAddSection}
                        onClose={() => setShowAddSection(false)}
                        availableSections={availableSections}
                        sections={resume.sections}
                        addSection={addSection}
                      />
                      {/* Active Sections */}
                      {resume.sections
                        .filter((s) => s.visible)
                        .map((section) => {
                          const Icon = section.icon;
                          return (
                            <div
                              key={section.id}
                              className="mb-8 p-6 bg-white rounded-xl border border-slate-200"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <Icon className="text-indigo-600" size={20} />
                                  <h3 className="text-base font-semibold text-slate-800">
                                    {section.name}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => toggleSectionCollapsed(section.id)}
                                    className="text-slate-600 hover:text-slate-800 text-sm p-1"
                                    title={section.collapsed ? "Expand section" : "Collapse section"}
                                  >
                                    {section.collapsed ? (
                                      <FiChevronDown size={18} />
                                    ) : (
                                      <FiChevronUp size={18} />
                                    )}
                                  </button>
                                  {editingSectionId === section.id ? (
                                    <div className="flex items-center gap-2">
                                      <input
                                        value={editingSectionName}
                                        onChange={(e) => setEditingSectionName(e.target.value)}
                                        className="rounded-md border px-2 py-1 text-sm"
                                      />
                                      <button
                                        onClick={() => saveSectionName(section.id)}
                                        className="text-indigo-600 hover:text-indigo-700 p-1"
                                        title="Save"
                                      >
                                        <FiCheck />
                                      </button>
                                      <button
                                        onClick={cancelEditSection}
                                        className="text-slate-500 hover:text-slate-700 p-1"
                                        title="Cancel"
                                      >
                                        <FiX />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => startEditSection(section)}
                                      className="text-slate-600 hover:text-slate-800 text-sm p-1"
                                      title="Edit section title"
                                    >
                                      <FiEdit2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {section.collapsed ? (
                                <div className="text-sm text-slate-500 mb-3">{(section.items || []).length} items — collapsed</div>
                              ) : (
                                <>
                                  {renderSectionForm(
                                    section,
                                    updateSectionItem,
                                    removeItemFromSection,
                                    toggleItemCollapsed,
                                    openUrlDialog,
                                    sensors,
                                    handleDragEnd,
                                    toggleItemVisibility
                                  )}

                                  <button
                                    onClick={() => addItemToSection(section.id)}
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
                                  >
                                    <FiPlus /> Add{" "}
                                    {section.name === "Professional Experience"
                                      ? "Experience"
                                      : section.name.replace(/s$/, "")}
                                  </button>
                                </>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Right Preview Column */}
          <section className=" md:flex-[0_0_auto] h-full flex justify-center flex-col">
            <div className="flex-1 overflow-auto hide-scrollbar">
              <div className="flex items-start justify-center py-6">
                <div className="relative" id="preview-resume">
                  <div
                    ref={combinedPreviewRef}
                    id="resume-preview"
                    className="resume-preview relative"
                    style={{
                      // expose CSS variables for font-size, line-height and entry spacing
                      ["--resume-font-size"]: `${resume.spacingConfig.fontSize}pt`,
                      ["--resume-line-height"]: resume.spacingConfig.lineHeight,
                      ["--resume-entry-spacing"]: `${resume.spacingConfig.entrySpacing}px`,
                      fontFamily: resume.selectedFont.family
                        ? `'${resume.selectedFont.family}', serif`
                        : undefined,
                    }}
                  >
                    {/* Hidden measurement container used to compute section heights for column-aware distribution */}
                    <div
                      ref={measureContainerRef}
                      aria-hidden
                      style={{
                        position: "absolute",
                        left: -10000,
                        top: -10000,
                        width: `calc(${resume.layoutConfig.leftColumnWidth}% - 0px)`,
                        pointerEvents: "none",
                        visibility: "hidden",
                      }}
                    />
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
                      .resume-preview .resume-role { font-size: var(--resume-size-role) !important; color: #000000 !important; font-style: italic !important; }
                      .resume-preview .resume-section-heading { font-size: var(--resume-size-section) !important; font-weight: 700 !important; }
                      .resume-preview .resume-item-title { font-size: var(--resume-size-title) !important; font-weight: 700 !important; }
                      .resume-preview .resume-item-subtitle { font-size: var(--resume-size-subtitle) !important; font-style: italic !important; color: #4B5563 !important; }
                      .resume-preview .resume-item-description { font-size: var(--resume-size-body) !important; line-height: var(--resume-line-height) !important; color:black; }
                      .resume-preview .resume-entry { margin-bottom: var(--resume-entry-spacing) !important; }
                      /* Variant for compact entries: same as .resume-entry but no bottom spacing */
                      .resume-preview .resume-entry-no-margin { margin-bottom: 0 !important; }
                      .resume-preview .resume-entry-less-margin { margin-bottom: calc(var(--resume-entry-spacing) * 0.5) !important; }
                    `}</style>
                    
                    {/* Multi-page resume component with overflow handling */}
                    <MultiPageResume 
                      resume={resume}
                      A4_WIDTH_PX={A4_WIDTH_PX}
                      A4_HEIGHT_PX={A4_HEIGHT_PX}
                      formatLastSaved={formatLastSaved}
                      lastSavedAt={lastSavedAt}
                      isSaving={isSaving}
                      loadDocId={loadDocId}
                      setLoadDocId={setLoadDocId}
                      loadFromFirestore={loadFromFirestore}
                      saveToFirestore={saveToFirestore}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>

      {/* Conflict confirmation dialog when remote changes detected */}
      <Dialog
        open={conflictDialogOpen}
        onClose={() => setConflictDialogOpen(false)}
      >
        <>
          <DialogTitle>Remote changes detected</DialogTitle>
          <DialogContent>
            Remote version of this resume was changed since you last saved.
            Overwrite remote with your current changes?
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setConflictDialogOpen(false);
                showSnackbar("info", "Save cancelled");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={async () => {
                setConflictDialogOpen(false);
                await saveToFirestore({ force: true });
              }}
            >
              Overwrite
            </Button>
          </DialogActions>
        </>
      </Dialog>
    </div>
  );
};

export default Resume;
