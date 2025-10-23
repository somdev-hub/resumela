import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import jsPDF from "jspdf";
import { usePDF } from "react-to-pdf";
import {
  FiDownload,
  FiEye,
  FiPlus,
  FiX,
  FiLink,
  FiEdit2,
  FiCheck,
  FiMenu,
} from "react-icons/fi";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UrlDialog from "../components/UrlDialog";
import AddSectionDialog from "../components/AddSectionDialog";
import {
  FaRegFilePdf,
  FaGraduationCap,
  FaBriefcase,
  FaPalette,
  FaCertificate,
  FaBook,
  FaTrophy,
  FaUsers,
  FaFileAlt,
  FaUserTie,
  FaPencilAlt,
  FaList,
  FaGlobe,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLinkedin,
  FaGithub,
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
} from "react-icons/fa";
import RichTextEditor from "../components/RichTextEditor";
import ResumeHeader from "../components/ResumeHeader";
import ContactInfo from "../components/ContactInfo";
import SectionPreview from "../components/SectionPreview";
import { renderSectionForm } from "../components/SectionForms";
import SortableItem from "../components/SortableItem";

import { availableSections } from "../customization/AvailableSections";
import { fontsByCategory } from "../customization/Fonts";
import ResumeNav from "../components/ResumeNav";

const Resume = () => {
  // ...existing code...
  const A4_WIDTH_PX = 794;
  const A4_HEIGHT_PX = 1123;
  const [formData, setFormData] = useState({
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
  });

  const [sections, setSections] = useState([
    {
      id: "education",
      name: "Education",
      icon: FaGraduationCap,
      visible: true,
      items: [],
    },
    {
      id: "experience",
      name: "Professional Experience",
      icon: FaBriefcase,
      visible: true,
      items: [],
    },
    { id: "skills", name: "Skills", icon: FaPalette, visible: true, items: [] },
    {
      id: "projects",
      name: "Projects",
      icon: FaList,
      visible: true,
      items: [],
    },
  ]);

  const [showAddSection, setShowAddSection] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [layoutConfig, setLayoutConfig] = useState({
    columns: "two",
    headerPosition: "top",
    leftColumnWidth: 50,
    rightColumnWidth: 50,
  });
  const [spacingConfig, setSpacingConfig] = useState({
    fontSize: 9, // in pt
    lineHeight: 1.25,
    marginLR: 10, // left & right margin in mm
    marginTB: 10, // top & bottom margin in mm
    entrySpacing: 12, // px between entries
  });
  // Personal details customization
  const [personalConfig, setPersonalConfig] = useState({
    align: "center", // left | center | right
    arrangement: "single", // single | two
    contactStyle: "icon", // icon | bullet | bar
  });
  const [selectedFont, setSelectedFont] = useState({
    family: "PT Serif",
    category: "serif",
    css: "PT+Serif:wght@400;700",
  });

  const [activeFontCategory, setActiveFontCategory] = useState("serif");

  // URL dialog state for LinkedIn / GitHub
  const [urlDialog, setUrlDialog] = useState({
    open: false,
    field: null,
    tempUrl: "",
  });

  const openUrlDialog = (field) => {
    setUrlDialog({ open: true, field, tempUrl: formData[field + "Url"] || "" });
  };

  const closeUrlDialog = () =>
    setUrlDialog({ open: false, field: null, tempUrl: "" });

  const saveUrlFromDialog = () => {
    if (!urlDialog.field) return closeUrlDialog();
    setFormData((prev) => ({
      ...prev,
      [urlDialog.field + "Url"]: urlDialog.tempUrl,
    }));
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

  // load initial font
  React.useEffect(() => {
    if (selectedFont && selectedFont.css) loadGoogleFont(selectedFont.css);
  }, [selectedFont]);
  const [sectionOrder, setSectionOrder] = useState([
    "education",
    "experience",
    "skills",
    "certifications",
    "languages",
    "volunteering",
    "awards",
    "publications",
    "projects",
  ]);

  const pdfPreviewRef = useRef(null);
  const photoInputRef = useRef(null);

  // refs and state for measuring section heights and distributing them into columns
  const measureContainerRef = useRef(null);
  const measureRefs = useRef({}); // map sectionId -> DOM node
  const sectionsAreaRef = useRef(null); // the vertical space for sections in preview
  const [sectionHeights, setSectionHeights] = useState({});
  const [distributed, setDistributed] = useState({ left: [], right: [], first: null });

  const sanitizedFilename = useMemo(() => {
    const trimmed = formData.fullName.trim();
    return trimmed
      ? trimmed.replace(/[^a-z0-9]+/gi, "_").toLowerCase()
      : "resume";
  }, [formData.fullName]);

  const { toPDF, targetRef } = usePDF({
    filename: `${sanitizedFilename}_resume.pdf`,
    resolution: 2,
  });

  const combinedPreviewRef = useCallback(
    (node) => {
      pdfPreviewRef.current = node;
      if (targetRef && "current" in targetRef) {
        targetRef.current = node;
      }
    },
    [targetRef]
  );

  // Measure section heights and distribute into left/right columns based on available height
  useEffect(() => {
    if (!measureContainerRef.current) return;

    const visibleSections = sectionOrder
      .map((sectionId) => sections.find((s) => s.id === sectionId))
      .filter((s) => s && s.visible);

    // prepare container
    const container = measureContainerRef.current;
    container.innerHTML = "";

    // set container width in px to match left column width in preview
    const preview = pdfPreviewRef.current;
    if (preview) {
      const previewInnerWidth = preview.clientWidth - (spacingConfig.marginLR * 2 * 3.78 || 0);
      const leftPx = Math.floor((layoutConfig.leftColumnWidth / 100) * previewInnerWidth);
      container.style.width = `${leftPx}px`;
    }

    // create react root
    const root = ReactDOM.createRoot(container);

    const MeasurementApp = () => (
      <div style={{ width: "100%" }}>
        {visibleSections.map((section) => (
          <div key={section.id} data-section-id={section.id} className="measure-entry">
            <SectionPreview section={section} spacingConfig={spacingConfig} />
          </div>
        ))}
      </div>
    );

    root.render(<MeasurementApp />);

    // measure heights after mount
    const id = setTimeout(() => {
      const heights = {};
      visibleSections.forEach((section) => {
        const node = container.querySelector(`[data-section-id="${section.id}"]`);
        heights[section.id] = node ? node.offsetHeight : 0;
      });

      setSectionHeights(heights);

      // compute available height in preview area for sections (exclude header/profile areas)
      const preview = pdfPreviewRef.current;
      let availableHeight = 0;
      if (preview) {
        // measure height available to the sections block
        const header = preview.querySelector(".resume-header") || preview.querySelector(".pb-6") || null;
        const profile = preview.querySelector(".mb-6") || null;
        availableHeight = preview.clientHeight - (header ? header.offsetHeight : 0) - (profile ? profile.offsetHeight : 0) - 40;
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
        if (leftUsed + h <= columnHeight || left.length === 0) {
          left.push(section);
          leftUsed += h;
        } else {
          right.push(section);
        }
      }

      setDistributed({ left, right, first: null });

      // unmount measurement root after measurement to keep DOM clean
      setTimeout(() => root.unmount(), 20);
    }, 50);

    return () => clearTimeout(id);
  }, [sections, sectionOrder, layoutConfig, spacingConfig, selectedFont]);

  const contactLine = useMemo(() => {
    return [formData.email, formData.phone, formData.location]
      .filter(Boolean)
      .join(" | ");
  }, [formData.email, formData.phone, formData.location]);

  const secondaryLine = useMemo(() => {
    return [formData.linkedin, formData.github].filter(Boolean).join(" | ");
  }, [formData.github, formData.linkedin]);

  const ContactIcon = ({ type }) => {
    if (type === "email") return <FaEnvelope className="text-slate-500" />;
    if (type === "phone") return <FaPhone className="text-slate-500" />;
    if (type === "location")
      return <FaMapMarkerAlt className="text-slate-500" />;
    if (type === "linkedin") return <FaLinkedin className="text-slate-500" />;
    if (type === "github") return <FaGithub className="text-slate-500" />;
    return <span className="h-2 w-2 rounded-full bg-indigo-500 inline-block" />;
  };

  const renderContactInfo = () => {
    const parts = [
      { v: formData.email, t: "email" },
      { v: formData.phone, t: "phone" },
      { v: formData.location, t: "location" },
    ].filter((p) => p.v);
    const secondary = [
      { v: formData.linkedin, t: "linkedin", url: formData.linkedinUrl },
      { v: formData.github, t: "github", url: formData.githubUrl },
    ].filter((p) => p.v);
    // helper to render a contact element (icon + text or anchor)
    const renderElem = (item, idx) => {
      const content = item.url ? (
        <a href={item.url} className="hover:underline">
          {item.v}
        </a>
      ) : (
        item.v
      );
      return (
        <span key={item.v + idx} className="inline-flex items-center gap-2">
          <ContactIcon type={item.t} />
          {content}
        </span>
      );
    };

    // row-wise spread across single row (two arrangement keeps left/right but both use same inline style)
    if (personalConfig.arrangement === "two") {
      return (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-4">
            {parts.map((p, i) => (
              <React.Fragment key={p.v + i}>
                {renderElem(p, i)}
                {i < parts.length - 1 && (
                  <span className="text-slate-600">&nbsp;|&nbsp;</span>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            {secondary.map((s, i) => (
              <React.Fragment key={s.v + i}>
                {renderElem(s, i)}
                {i < secondary.length - 1 && (
                  <span className="text-slate-600">&nbsp;|&nbsp;</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      );
    }

    // For single arrangement and other contact styles, render all items inline with icons and separators
    const all = [...parts, ...secondary];
    return (
      <div className="mt-3 text-xs text-slate-600">
        {all.map((item, idx) => (
          <React.Fragment key={item.v + idx}>
            {renderElem(item, idx)}
            {idx < all.length - 1 && (
              <span className="text-slate-600">&nbsp;|&nbsp;</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({ ...prev, photoUrl: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const triggerPhotoPicker = () => {
    if (photoInputRef.current) photoInputRef.current.click();
  };

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, photoUrl: null }));
    if (photoInputRef.current) photoInputRef.current.value = null;
  };

  const handleSectionReorder = (fromIndex, toIndex) => {
    const newOrder = [...sectionOrder];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    setSectionOrder(newOrder);
  };

  const addSection = (sectionId) => {
    const sectionTemplate = availableSections.find((s) => s.id === sectionId);
    if (!sectionTemplate) return;

    const exists = sections.find((s) => s.id === sectionId);
    if (exists) {
      setSections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, visible: true } : s))
      );
    } else {
      setSections((prev) => [
        ...prev,
        {
          id: sectionId,
          name: sectionTemplate.name,
          icon: sectionTemplate.icon,
          visible: true,
          items: [],
        },
      ]);
    }
    // Ensure the new section is added to sectionOrder at the end (preserve chronological order)
    setSectionOrder((prevOrder) =>
      prevOrder.includes(sectionId) ? prevOrder : [...prevOrder, sectionId]
    );
    setShowAddSection(false);
  };

  const removeSection = (sectionId) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, visible: false } : s))
    );
  };

  const addItemToSection = (sectionId) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: [
              ...section.items,
              { id: Date.now(), data: {}, collapsed: false },
            ],
          };
        }
        return section;
      })
    );
  };

  const removeItemFromSection = (sectionId, itemId) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.filter((item) => item.id !== itemId),
          };
        }
        return section;
      })
    );
  };

  const updateSectionItem = (sectionId, itemId, field, value) => {
    setSections((prev) =>
      prev.map((section) => {
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
      })
    );
  };

  const toggleItemCollapsed = (sectionId, itemId) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map((item) =>
              item.id === itemId ? { ...item, collapsed: !item.collapsed } : item
            ),
          };
        }
        return section;
      })
    );
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

    if (formData.profile) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("PROFILE", margin, y);
      y += 18;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const profileLines = doc.splitTextToSize(
        formData.profile,
        pageWidth - margin * 2
      );
      profileLines.forEach((line) => {
        doc.text(line, margin, y);
        y += 14;
      });
      y += 10;
    }

    sections
      .filter((s) => s.visible && s.items.length > 0)
      .forEach((section) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(section.name.toUpperCase(), margin, y);
        y += 18;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        section.items.forEach((item) => {
          const data = item.data;
          if (data.title) {
            doc.setFont("helvetica", "bold");
            doc.text(data.title, margin, y);
            doc.setFont("helvetica", "normal");
            y += 14;
          }
          if (data.subtitle) {
            doc.text(data.subtitle, margin, y);
            y += 14;
          }
          if (data.date || data.location) {
            doc.text(
              [data.date, data.location].filter(Boolean).join(" | "),
              margin,
              y
            );
            y += 14;
          }
          if (data.description) {
            const descLines = doc.splitTextToSize(
              data.description,
              pageWidth - margin * 2
            );
            descLines.forEach((line) => {
              doc.text(line, margin, y);
              y += 14;
            });
          }
          y += 8;
        });
        y += 10;
      });

    doc.save(`${sanitizedFilename}_ats.pdf`);
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

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      <ResumeNav
        toPDF={toPDF}
        downloadATSOptimizedPDF={downloadATSOptimizedPDF}
      />

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
                                setLayoutConfig((prev) => ({
                                  ...prev,
                                  columns: option.value,
                                }))
                              }
                              className={`flex items-center justify-center w-20 h-20 rounded-lg border-2 transition ${
                                layoutConfig.columns === option.value
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
                                setLayoutConfig((prev) => ({
                                  ...prev,
                                  headerPosition: option.value,
                                }))
                              }
                              className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition ${
                                layoutConfig.headerPosition === option.value
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
                                {layoutConfig.leftColumnWidth}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="30"
                              max="70"
                              value={layoutConfig.leftColumnWidth}
                              onChange={(e) =>
                                setLayoutConfig((prev) => ({
                                  ...prev,
                                  leftColumnWidth: parseInt(e.target.value),
                                  rightColumnWidth:
                                    100 - parseInt(e.target.value),
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
                                {layoutConfig.rightColumnWidth}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="30"
                              max="70"
                              value={layoutConfig.rightColumnWidth}
                              onChange={(e) =>
                                setLayoutConfig((prev) => ({
                                  ...prev,
                                  rightColumnWidth: parseInt(e.target.value),
                                  leftColumnWidth:
                                    100 - parseInt(e.target.value),
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
                              setSelectedFont({
                                family: f.family,
                                category: activeFontCategory,
                                css: f.css,
                              });
                              loadGoogleFont(f.css);
                            }}
                            className={`w-full text-left px-4 py-2 rounded-lg border transition text-sm ${
                              selectedFont.family === f.family
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
                                setPersonalConfig((prev) => ({
                                  ...prev,
                                  align: opt.key,
                                }))
                              }
                              className={`px-4 py-3 rounded-lg border w-32 text-sm ${
                                personalConfig.align === opt.key
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
                              setPersonalConfig((prev) => ({
                                ...prev,
                                arrangement: "single",
                              }))
                            }
                            className={`px-4 py-3 rounded-lg border w-40 text-sm ${
                              personalConfig.arrangement === "single"
                                ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                                : "border-slate-200 text-slate-700"
                            }`}
                          >
                            Single column
                          </button>
                          <button
                            onClick={() =>
                              setPersonalConfig((prev) => ({
                                ...prev,
                                arrangement: "two",
                              }))
                            }
                            className={`px-4 py-3 rounded-lg border w-40 text-sm ${
                              personalConfig.arrangement === "two"
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
                              setPersonalConfig((prev) => ({
                                ...prev,
                                contactStyle: "icon",
                              }))
                            }
                            className={`px-4 py-3 rounded-lg border w-32 text-sm ${
                              personalConfig.contactStyle === "icon"
                                ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                                : "border-slate-200 text-slate-700"
                            }`}
                          >
                            Icon
                          </button>
                          <button
                            onClick={() =>
                              setPersonalConfig((prev) => ({
                                ...prev,
                                contactStyle: "bullet",
                              }))
                            }
                            className={`px-4 py-3 rounded-lg border w-32 text-sm ${
                              personalConfig.contactStyle === "bullet"
                                ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                                : "border-slate-200 text-slate-700"
                            }`}
                          >
                            Bullet
                          </button>
                          <button
                            onClick={() =>
                              setPersonalConfig((prev) => ({
                                ...prev,
                                contactStyle: "bar",
                              }))
                            }
                            className={`px-4 py-3 rounded-lg border w-32 text-sm ${
                              personalConfig.contactStyle === "bar"
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
                            {spacingConfig.fontSize}pt
                          </span>
                        </div>
                        <input
                          type="range"
                          min="8"
                          max="14"
                          value={spacingConfig.fontSize}
                          onChange={(e) =>
                            setSpacingConfig((prev) => ({
                              ...prev,
                              fontSize: parseInt(e.target.value),
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
                            {spacingConfig.lineHeight}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="2"
                          step="0.05"
                          value={spacingConfig.lineHeight}
                          onChange={(e) =>
                            setSpacingConfig((prev) => ({
                              ...prev,
                              lineHeight: parseFloat(e.target.value),
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
                              {spacingConfig.marginLR}mm
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="25"
                            value={spacingConfig.marginLR}
                            onChange={(e) =>
                              setSpacingConfig((prev) => ({
                                ...prev,
                                marginLR: parseInt(e.target.value),
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
                              {spacingConfig.marginTB}mm
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="25"
                            value={spacingConfig.marginTB}
                            onChange={(e) =>
                              setSpacingConfig((prev) => ({
                                ...prev,
                                marginTB: parseInt(e.target.value),
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
                            {spacingConfig.entrySpacing}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          value={spacingConfig.entrySpacing}
                          onChange={(e) =>
                            setSpacingConfig((prev) => ({
                              ...prev,
                              entrySpacing: parseInt(e.target.value),
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
                        {sectionOrder.map((sectionId, index) => {
                          const section = sections.find(
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
                                    index < sectionOrder.length - 1 &&
                                    handleSectionReorder(index, index + 1)
                                  }
                                  disabled={index === sectionOrder.length - 1}
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
                          {formData.photoUrl ? (
                            <img
                              src={formData.photoUrl}
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
                          {formData.photoUrl && (
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
                                    value={formData[name]}
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
                          value={formData.profile}
                          onChange={(html) =>
                            setFormData((prev) => ({ ...prev, profile: html }))
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
                        sections={sections}
                        addSection={addSection}
                      />
                      {/* Active Sections */}
                      {sections
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
                                <button
                                  onClick={() => removeSection(section.id)}
                                  className="text-rose-600 hover:text-rose-700 text-sm"
                                >
                                  Remove Section
                                </button>
                              </div>

                              {renderSectionForm(
                                section,
                                updateSectionItem,
                                removeItemFromSection,
                                toggleItemCollapsed
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
              <div className="flex items-start justify-center ">
                <div className="relative">
                  <div
                    className="pointer-events-none absolute right-6 top-6 flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600"
                    data-html2canvas-ignore="true"
                  >
                    <span className="h-2 w-2 rounded-full bg-indigo-500" /> Live
                    preview
                  </div>
                  <div
                    ref={combinedPreviewRef}
                    className="resume-preview relative w-[794px] h-[1123px] bg-white shadow-xl ring-1 ring-indigo-100 border border-slate-200 overflow-hidden"
                    style={{
                      width: `${A4_WIDTH_PX}px`,
                      minWidth: `${A4_WIDTH_PX}px`,
                      height: `${A4_HEIGHT_PX}px`,
                      minHeight: `${A4_HEIGHT_PX}px`,
                      padding: `${spacingConfig.marginTB * 3.78}px ${
                        spacingConfig.marginLR * 3.78
                      }px`,
                      // expose CSS variables for font-size, line-height and entry spacing
                      ["--resume-font-size"]: `${spacingConfig.fontSize}pt`,
                      ["--resume-line-height"]: spacingConfig.lineHeight,
                      ["--resume-entry-spacing"]: `${spacingConfig.entrySpacing}px`,
                      fontFamily: selectedFont.family
                        ? `'${selectedFont.family}', serif`
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
                        width: `calc(${layoutConfig.leftColumnWidth}% - 0px)`,
                        pointerEvents: "none",
                        visibility: "hidden",
                      }}
                    />
                    <style>{`
                      /* Derived sizes to create a typographic hierarchy based on the base font size */
                      .resume-preview {
                        --resume-size-name: calc(var(--resume-font-size) * 2.2);
                        --resume-size-role: calc(var(--resume-font-size) * 1.15);
                        --resume-size-section: calc(var(--resume-font-size) * 1.2);
                        --resume-size-title: calc(var(--resume-font-size) * 1.1);
                        --resume-size-subtitle: calc(var(--resume-font-size) * 1);
                        --resume-size-body: calc(var(--resume-font-size) * 1.075);
                        font-size: var(--resume-size-body);
                        line-height: var(--resume-line-height);
                      }
                      /* Specific element overrides to form a clear hierarchy */
                      .resume-preview .resume-name { font-size: var(--resume-size-name) !important; line-height: 1.05 !important; }
                      .resume-preview .resume-role { font-size: var(--resume-size-role) !important; color: #000000 !important; font-style: italic !important; }
                      .resume-preview .resume-section-heading { font-size: var(--resume-size-section) !important; font-weight: 700 !important; }
                      .resume-preview .resume-item-title { font-size: var(--resume-size-title) !important; font-weight: 700 !important; }
                      .resume-preview .resume-item-subtitle { font-size: var(--resume-size-subtitle) !important; font-style: italic !important; color: #4B5563 !important; }
                      .resume-preview .resume-item-description { font-size: var(--resume-size-body) !important; line-height: var(--resume-line-height) !important; }
                      .resume-preview .resume-entry { margin-bottom: var(--resume-entry-spacing) !important; }
                    `}</style>
                    <div className="h-full flex flex-col">
                      {/* Header with photo and contact info using ResumeHeader */}
                      <div
                        className={`${
                          layoutConfig.headerPosition === "left"
                            ? "flex gap-6"
                            : layoutConfig.headerPosition === "right"
                            ? "flex gap-6 flex-row-reverse"
                            : "block"
                        } ${
                          layoutConfig.headerPosition === "top"
                            ? "border-b border-slate-200 pb-6"
                            : ""
                        }`}
                        style={{ textAlign: personalConfig.align }}
                      >
                        {formData.photoUrl && (
                          <div
                            className={`${
                              layoutConfig.headerPosition === "top"
                                ? "h-24 w-24"
                                : "h-20 w-20"
                            } rounded-full overflow-hidden border-2 border-slate-200 flex-shrink-0`}
                          >
                            <img
                              src={formData.photoUrl}
                              alt="profile"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className={layoutConfig.headerPosition === "top" ? "" : "flex-1"}>
                          <ResumeHeader formData={formData} personalConfig={personalConfig} />
                        </div>
                      </div>

                      <div className="mt-6 flex-1 overflow-hidden">
                        {formData.profile && (
                          <div className="mb-6">
                            <h2 className="resume-section-heading text-lg font-bold text-slate-900 border-b-2 border-slate-900 pb-1 mb-4">
                              PROFILE
                            </h2>
                            <div
                              className="resume-item-description text-sm text-slate-700 leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: formData.profile,
                              }}
                            />
                          </div>
                        )}

                        {/* Dynamic Sections */}
                        {(() => {
                          const visibleSections = sectionOrder
                            .map((sectionId) =>
                              sections.find((s) => s.id === sectionId)
                            )
                            .filter((section) => section && section.visible);

                          // If columns is one, render as before
                          if (layoutConfig.columns === "one") {
                            return (
                              <div className="space-y-6">
                                {visibleSections.map((section) => (
                                  <SectionPreview
                                    key={section.id}
                                    section={section}
                                    spacingConfig={spacingConfig}
                                  />
                                ))}
                              </div>
                            );
                          } else if (layoutConfig.columns === "two") {
                            // Use measured distribution if available; fallback to estimated-height distribution
                            let leftSections = [];
                            let rightSections = [];
                            if (distributed.left && distributed.left.length) {
                              leftSections = distributed.left;
                              rightSections = distributed.right;
                            } else {
                              // estimate heights when we don't have measurements
                              const estimateHeight = (section) => {
                                const base = 40; // section heading
                                const perItem = 48; // approximate per item (title + subtitle/description)
                                return base + (section.items ? section.items.length * perItem : 0);
                              };
                              const totalHeight = visibleSections.reduce((s, sec) => s + estimateHeight(sec), 0);
                              const columnHeight = (pdfPreviewRef.current ? pdfPreviewRef.current.clientHeight : 900) - 120;
                              let acc = 0;
                              for (let i = 0; i < visibleSections.length; i++) {
                                const sec = visibleSections[i];
                                const h = estimateHeight(sec);
                                if (acc + h <= columnHeight || leftSections.length === 0) {
                                  leftSections.push(sec);
                                  acc += h;
                                } else {
                                  rightSections.push(sec);
                                }
                              }
                            }
                            return (
                              <div
                                className="grid gap-6"
                                style={{
                                  gridTemplateColumns: `${layoutConfig.leftColumnWidth}% ${layoutConfig.rightColumnWidth}%`,
                                }}
                              >
                                <div className="space-y-6">
                                  {leftSections.map((section) => (
                                    <SectionPreview
                                      key={section.id}
                                      section={section}
                                      spacingConfig={spacingConfig}
                                    />
                                  ))}
                                </div>
                                <div className="space-y-6">
                                  {rightSections.map((section) => (
                                    <SectionPreview
                                      key={section.id}
                                      section={section}
                                      spacingConfig={spacingConfig}
                                    />
                                  ))}
                                </div>
                              </div>
                            );
                          } else {
                            // mix
                            const first = visibleSections[0];
                            const rest = visibleSections.slice(1);
                            const leftRest = distributed.left.length ? distributed.left.slice(first ? 0 : 0) : rest.slice(0, Math.ceil(rest.length / 2));
                            const rightRest = distributed.right.length ? distributed.right.slice(0) : rest.slice(Math.ceil(rest.length / 2));
                            return (
                              <div>
                                {first && (
                                  <SectionPreview
                                    key={first.id}
                                    section={first}
                                    spacingConfig={spacingConfig}
                                  />
                                )}
                                {rest.length > 0 && (
                                  <div
                                    className="grid gap-6 mt-6"
                                    style={{
                                      gridTemplateColumns: `${layoutConfig.leftColumnWidth}% ${layoutConfig.rightColumnWidth}%`,
                                    }}
                                  >
                                    <div className="space-y-6">
                                      {leftRest.map((section) => (
                                        <SectionPreview
                                          key={section.id}
                                          section={section}
                                          spacingConfig={spacingConfig}
                                        />
                                      ))}
                                    </div>
                                    <div className="space-y-6">
                                      {rightRest.map((section) => (
                                        <SectionPreview
                                          key={section.id}
                                          section={section}
                                          spacingConfig={spacingConfig}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Resume;
