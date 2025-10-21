import React, { useCallback, useMemo, useRef, useState } from "react";
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
import RichTextEditor from '../components/RichTextEditor';

const SortableItem = React.memo(
  ({ item, section, children, onToggleCollapsed, onRemove }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: item.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const getItemSummary = () => {
      const { title, subtitle, date } = item.data;
      if (title) return title;
      if (subtitle) return subtitle;
      if (date) return date;
      return "Untitled Entry";
    };

    if (item.collapsed) {
      return (
        <div
          ref={setNodeRef}
          style={style}
          className="mb-3 p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
                title="Drag to reorder"
              >
                <FiMenu size={18} />
              </button>
              <div className="flex-1">
                <h5 className="font-medium text-slate-800">
                  {getItemSummary()}
                </h5>
                {item.data.subtitle && item.data.title && (
                  <p className="text-sm text-slate-500 mt-1">
                    {item.data.subtitle}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleCollapsed(section.id, item.id)}
                className="text-indigo-600 hover:text-indigo-700 p-2"
                title="Edit"
              >
                <FiEdit2 size={16} />
              </button>
              <button
                onClick={() => onRemove(section.id, item.id)}
                className="text-rose-600 hover:text-rose-700 p-2"
                title="Remove"
              >
                <FiX size={18} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="mb-6 p-4 border rounded-lg bg-slate-50"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
              title="Drag to reorder"
            >
              <FiMenu size={18} />
            </button>
            <h4 className="font-semibold text-slate-700">
              {section.name === "Professional Experience"
                ? "Experience"
                : section.name.replace(/s$/, "")}{" "}
              Entry
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleCollapsed(section.id, item.id)}
              className="text-green-600 hover:text-green-700 px-3 py-1 rounded-md border border-green-200 bg-green-50 text-sm font-medium flex items-center gap-1"
              title="Done"
            >
              <FiCheck size={14} /> Done
            </button>
            <button
              onClick={() => onRemove(section.id, item.id)}
              className="text-rose-600 hover:text-rose-700"
              title="Remove"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>
        {children}
      </div>
    );
  }
);

SortableItem.displayName = "SortableItem";

const Resume = () => {
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

  const fontsByCategory = {
    serif: [
      { family: "PT Serif", css: "PT+Serif:wght@400;700" },
      { family: "Amiri", css: "Amiri:ital,wght@0,400;0,700" },
      { family: "Vollkorn", css: "Vollkorn:ital,wght@0,400;0,700" },
      { family: "Lora", css: "Lora:ital,wght@0,400;0,700" },
      { family: "Crimson Pro", css: "Crimson+Pro:ital,wght@0,400;0,700" },
      { family: "EB Garamond", css: "EB+Garamond:ital,wght@0,400;0,700" },
      { family: "Zilla Slab", css: "Zilla+Slab:ital,wght@0,400;0,700" },
      { family: "Cormorant Garamond", css: "Cormorant+Garamond:ital,wght@0,400;0,700" },
    ],
    sans: [
      { family: "Inter", css: "Inter:ital,wght@0,400;0,700" },
      { family: "Source Sans 3", css: "Source+Sans+3:ital,wght@0,400;0,700" },
      { family: "Roboto", css: "Roboto:ital,wght@0,400;0,700" },
      { family: "Montserrat", css: "Montserrat:ital,wght@0,400;0,700" },
      { family: "Lato", css: "Lato:ital,wght@0,400;0,700" },
      { family: "Open Sans", css: "Open+Sans:ital,wght@0,400;0,700" },
    ],
    mono: [
      { family: "Roboto Mono", css: "Roboto+Mono:ital,wght@0,400;0,700" },
      { family: "Source Code Pro", css: "Source+Code+Pro:ital,wght@0,400;0,700" },
      { family: "Fira Code", css: "Fira+Code:ital,wght@0,400;0,700" },
      { family: "JetBrains Mono", css: "JetBrains+Mono:ital,wght@0,400;0,700" },
      { family: "Inconsolata", css: "Inconsolata:ital,wght@0,400;0,700" },
    ],
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

  const availableSections = [
    {
      id: "education",
      name: "Education",
      icon: FaGraduationCap,
      description:
        "Show off your primary education, college degrees & exchange semesters.",
    },
    {
      id: "experience",
      name: "Professional Experience",
      icon: FaBriefcase,
      description:
        "A place to highlight your professional experience - including internships.",
    },
    {
      id: "skills",
      name: "Skills",
      icon: FaPalette,
      description:
        "List your technical, managerial or soft skills in this section.",
    },
    {
      id: "languages",
      name: "Languages",
      icon: FaGlobe,
      description:
        "You speak more than one language? Make sure to list them here.",
    },
    {
      id: "certificates",
      name: "Certificates",
      icon: FaCertificate,
      description:
        "Drivers licenses and other industry-specific certificates you have belong here.",
    },
    {
      id: "interests",
      name: "Interests",
      icon: FaBook,
      description:
        "Do you have interests that align with your career aspiration?",
    },
    {
      id: "projects",
      name: "Projects",
      icon: FaList,
      description:
        "Worked on a particular challenging project in the past? Mention it here.",
    },
    {
      id: "courses",
      name: "Courses",
      icon: FaBook,
      description:
        "Did you complete MOOCs or an evening course? Show them off in this section.",
    },
    {
      id: "awards",
      name: "Awards",
      icon: FaTrophy,
      description:
        "Awards like student competitions or industry accolades belong here.",
    },
    {
      id: "organisations",
      name: "Organisations",
      icon: FaUsers,
      description:
        "If you volunteer or participate in a good cause, why not state it?",
    },
    {
      id: "publications",
      name: "Publications",
      icon: FaFileAlt,
      description:
        "Academic publications or book releases have a dedicated place here.",
    },
    {
      id: "references",
      name: "References",
      icon: FaUserTie,
      description:
        "If you have former colleagues or bosses that vouch for you, list them.",
    },
    {
      id: "declaration",
      name: "Declaration",
      icon: FaPencilAlt,
      description: "You need a declaration with signature?",
    },
    {
      id: "custom",
      name: "Custom",
      icon: FaList,
      description:
        "You didn't find what you are looking for? Or you want to combine two sections to save space?",
    },
  ];

  const pdfPreviewRef = useRef(null);
  const photoInputRef = useRef(null);

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

  const contactLine = useMemo(() => {
    return [formData.email, formData.phone, formData.location]
      .filter(Boolean)
      .join(" | ");
  }, [formData.email, formData.phone, formData.location]);

  const secondaryLine = useMemo(() => {
    return [formData.linkedin, formData.github].filter(Boolean).join(" | ");
  }, [formData.github, formData.linkedin]);

  const ContactIcon = ({ type }) => {
    if (type === 'email') return <FaEnvelope className="text-slate-500" />;
    if (type === 'phone') return <FaPhone className="text-slate-500" />;
    if (type === 'location') return <FaMapMarkerAlt className="text-slate-500" />;
    if (type === 'linkedin') return <FaLinkedin className="text-indigo-600" />;
    if (type === 'github') return <FaGithub className="text-indigo-600" />;
    return <span className="h-2 w-2 rounded-full bg-indigo-500 inline-block" />;
  };

  const renderContactInfo = () => {
    const parts = [
      { v: formData.email, t: 'email' },
      { v: formData.phone, t: 'phone' },
      { v: formData.location, t: 'location' },
    ].filter(p => p.v);
    const secondary = [
      { v: formData.linkedin, t: 'linkedin' },
      { v: formData.github, t: 'github' },
    ].filter(p => p.v);

    // row-wise spread across single row (two arrangement means spread primary left and secondary right)
    if (personalConfig.arrangement === 'two') {
      return (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-4">
            {parts.map(p => (
              <div key={p.v} className="inline-flex items-center gap-2"><ContactIcon type={p.t} />{p.v}</div>
            ))}
          </div>
          <div className="flex items-center gap-4 text-indigo-500">
            {secondary.map(s => (
              <div key={s.v} className="inline-flex items-center gap-2"><ContactIcon type={s.t} />{s.v}</div>
            ))}
          </div>
        </div>
      );
    }

    // single arrangement
    if (personalConfig.contactStyle === 'bullet') {
      return (
        <div className="mt-3 text-xs text-slate-600">
          {parts.map((p) => (
            <span key={p.v} className="inline-block mr-3">• {p.v}</span>
          ))}
          {secondary.length > 0 && (<div className="mt-1 text-xs uppercase tracking-wider text-indigo-500">{secondary.map(s => s.v).join(' | ')}</div>)}
        </div>
      );
    }

    if (personalConfig.contactStyle === 'bar') {
      return (
        <div className="mt-3 text-xs text-slate-600">
          {parts.map(p => p.v).join(' | ')}
          {secondary.length > 0 && (<div className="mt-1 text-xs uppercase tracking-wider text-indigo-500">{secondary.map(s => s.v).join(' | ')}</div>)}
        </div>
      );
    }

    // default: icon style (semantic icons)
    return (
      <div className="mt-3 text-xs text-slate-600">
        {parts.map(p => (
          <span key={p.v} className="inline-flex items-center mr-3 gap-2"><ContactIcon type={p.t} />{p.v}</span>
        ))}
        {secondary.length > 0 && (<div className="mt-1 text-xs uppercase tracking-wider text-indigo-500">{secondary.map(s => s.v).join(' | ')}</div>)}
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
              item.id === itemId
                ? { ...item, collapsed: !item.collapsed }
                : item
            ),
          };
        }
        return section;
      })
    );
  };

  const handleDragEnd = (sectionId, event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((prev) =>
        prev.map((section) => {
          if (section.id === sectionId) {
            const oldIndex = section.items.findIndex(
              (item) => item.id === active.id
            );
            const newIndex = section.items.findIndex(
              (item) => item.id === over.id
            );
            return {
              ...section,
              items: arrayMove(section.items, oldIndex, newIndex),
            };
          }
          return section;
        })
      );
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const renderSectionForm = (section) => {
    switch (section.id) {
      case "education":
        return (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(section.id, event)}
          >
            <SortableContext
              items={section.items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {section.items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  section={section}
                  onToggleCollapsed={toggleItemCollapsed}
                  onRemove={removeItemFromSection}
                >
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      placeholder="Degree / Certification"
                      value={item.data.title || ""}
                      onChange={(e) =>
                        updateSectionItem(
                          section.id,
                          item.id,
                          "title",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
                    />
                    <input
                      placeholder="Institution"
                      value={item.data.subtitle || ""}
                      onChange={(e) =>
                        updateSectionItem(
                          section.id,
                          item.id,
                          "subtitle",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        placeholder="Date (e.g., 2020 - 2024)"
                        value={item.data.date || ""}
                        onChange={(e) =>
                          updateSectionItem(
                            section.id,
                            item.id,
                            "date",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
                      />
                      <input
                        placeholder="Location"
                        value={item.data.location || ""}
                        onChange={(e) =>
                          updateSectionItem(
                            section.id,
                            item.id,
                            "location",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <RichTextEditor
                        value={item.data.description}
                        onChange={(html) => updateSectionItem(section.id, item.id, "description", html)}
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        );

      case "experience":
        return (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(section.id, event)}
          >
            <SortableContext
              items={section.items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {section.items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  section={section}
                  onToggleCollapsed={toggleItemCollapsed}
                  onRemove={removeItemFromSection}
                >
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      placeholder="Job Title"
                      value={item.data.title || ""}
                      onChange={(e) =>
                        updateSectionItem(
                          section.id,
                          item.id,
                          "title",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
                    />
                    <input
                      placeholder="Company"
                      value={item.data.subtitle || ""}
                      onChange={(e) =>
                        updateSectionItem(
                          section.id,
                          item.id,
                          "subtitle",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        placeholder="Date (e.g., Jan 2023 - Present)"
                        value={item.data.date || ""}
                        onChange={(e) =>
                          updateSectionItem(
                            section.id,
                            item.id,
                            "date",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
                      />
                      <input
                        placeholder="Location"
                        value={item.data.location || ""}
                        onChange={(e) =>
                          updateSectionItem(
                            section.id,
                            item.id,
                            "location",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <RichTextEditor
                        value={item.data.description}
                        onChange={(html) => updateSectionItem(section.id, item.id, "description", html)}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </SortableItem>
              ))}
              
            </SortableContext>
          </DndContext>
        );

      case "skills":
        return (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(section.id, event)}
          >
            <SortableContext
              items={section.items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {section.items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  section={section}
                  onToggleCollapsed={toggleItemCollapsed}
                  onRemove={removeItemFromSection}
                >
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      placeholder="Category (e.g., Languages, Frameworks)"
                      value={item.data.title || ""}
                      onChange={(e) =>
                        updateSectionItem(
                          section.id,
                          item.id,
                          "title",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
                    />
                    <div>
                      <RichTextEditor
                        value={item.data.description}
                        onChange={(html) => updateSectionItem(section.id, item.id, "description", html)}
                        className="min-h-[60px]"
                      />
                    </div>
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        );

      case "projects":
        return (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(section.id, event)}
          >
            <SortableContext
              items={section.items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {section.items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  section={section}
                  onToggleCollapsed={toggleItemCollapsed}
                  onRemove={removeItemFromSection}
                >
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      placeholder="Project Name"
                      value={item.data.title || ""}
                      onChange={(e) =>
                        updateSectionItem(
                          section.id,
                          item.id,
                          "title",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
                    />
                    <input
                      placeholder="Technologies / Role"
                      value={item.data.subtitle || ""}
                      onChange={(e) =>
                        updateSectionItem(
                          section.id,
                          item.id,
                          "subtitle",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
                    />
                    <input
                      placeholder="Date"
                      value={item.data.date || ""}
                      onChange={(e) =>
                        updateSectionItem(
                          section.id,
                          item.id,
                          "date",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
                    />
                    <div>
                      <RichTextEditor
                        value={item.data.description}
                        onChange={(html) => updateSectionItem(section.id, item.id, "description", html)}
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        );

      default:
        return (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(section.id, event)}
          >
            <SortableContext
              items={section.items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {section.items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  section={section}
                  onToggleCollapsed={toggleItemCollapsed}
                  onRemove={removeItemFromSection}
                >
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      placeholder="Title"
                      value={item.data.title || ""}
                      onChange={(e) =>
                        updateSectionItem(
                          section.id,
                          item.id,
                          "title",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
                    />
                    <div>
                      <RichTextEditor
                        value={item.data.description}
                        onChange={(html) => updateSectionItem(section.id, item.id, "description", html)}
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                </SortableItem>
              ))}
              \n{" "}
            </SortableContext>
          </DndContext>
        );
    }
  };

  const renderPreviewSection = (section) => {
    if (!section.items.length) return null;

    const renderItem = (item) => (
      <div key={item.id} className="resume-entry" style={{}}>
        {item.data.title && (
          <h3 className="resume-item-title font-bold text-slate-900">{item.data.title}</h3>
        )}
        {item.data.subtitle && (
          <p className="text-sm italic text-slate-700">
            {item.data.subtitle}
          </p>
        )}
        {(item.data.date || item.data.location) && (
          <p className="text-xs text-slate-600 mt-1">
            {[item.data.date, item.data.location]
              .filter(Boolean)
              .join(" | ")}
          </p>
        )}
        {item.data.description && (
          <div
            className="resume-item-description text-sm text-slate-700 mt-2"
            style={{ lineHeight: spacingConfig.lineHeight }}
            dangerouslySetInnerHTML={{ __html: item.data.description }}
          />
        )}
      </div>
    );

    return (
      <div key={section.id} className="mb-6">
        <h2 className="resume-section-heading text-lg font-bold text-slate-900 border-b-2 border-slate-900 pb-1 mb-4">
          {section.name.toUpperCase()}
        </h2>
        <div>
          {section.items.map((item) => renderItem(item))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-30 h-20 bg-white/90 backdrop-blur border-b border-indigo-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-3 h-full">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <FaRegFilePdf size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">
                Resume Builder
              </h1>
              <p className="text-sm text-slate-500">
                Build your professional resume with customizable sections.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toPDF()}
              className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50"
            >
              <FiEye /> Styled PDF
            </button>
            <button
              onClick={downloadATSOptimizedPDF}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
            >
              <FiDownload /> ATS-friendly PDF
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full pt-20">
        <div className="mx-auto flex w-full  px-6 md:flex-row items-start h-[calc(100vh-80px)] justify-center pt-4">
          {/* Left Editor Column */}
          <section className="  h-full">
            <div className="w-full rounded-2xl bg-white/90 p-8 shadow-xl ring-1 ring-indigo-100 h-full flex flex-col">
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
                      <h3 className="text-base font-semibold text-slate-800 mb-4">Layout</h3>
                      
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
                              <span className="text-xs text-slate-600">Left</span>
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
                                  rightColumnWidth: 100 - parseInt(e.target.value),
                                }))
                              }
                              className="w-full"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-slate-600">Right</span>
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
                                  leftColumnWidth: 100 - parseInt(e.target.value),
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
                      <h3 className="text-base font-semibold text-slate-800 mb-4">Font</h3>
                      <div className="flex items-center gap-3 mb-4">
                        {['serif', 'sans', 'mono'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setActiveFontCategory(cat)}
                            className={`px-4 py-2 rounded-lg border transition text-sm ${activeFontCategory === cat ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'border-slate-200 text-slate-700'}`}
                          >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {fontsByCategory[activeFontCategory].map((f) => (
                          <button
                            key={f.family}
                            onClick={() => { setSelectedFont({ family: f.family, category: activeFontCategory, css: f.css }); loadGoogleFont(f.css); }}
                            className={`w-full text-left px-4 py-2 rounded-lg border transition text-sm ${selectedFont.family === f.family ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'border-slate-200 text-slate-700'}`}
                          >
                            {f.family}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Personal Details Section */}
                    <div className="mb-8">
                      <h3 className="text-base font-semibold text-slate-800 mb-4">Personal Details</h3>

                      <div className="mb-4">
                        <div className="mb-2 text-sm font-medium text-slate-700">Align</div>
                        <div className="flex gap-3">
                          {[
                            { key: 'left', label: 'Left' },
                            { key: 'center', label: 'Center' },
                            { key: 'right', label: 'Right' },
                          ].map(opt => (
                            <button
                              key={opt.key}
                              onClick={() => setPersonalConfig(prev => ({ ...prev, align: opt.key }))}
                              className={`px-4 py-3 rounded-lg border w-32 text-sm ${personalConfig.align === opt.key ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'border-slate-200 text-slate-700'}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="mb-2 text-sm font-medium text-slate-700">Arrangement</div>
                        <div className="flex gap-3">
                          <button onClick={() => setPersonalConfig(prev => ({ ...prev, arrangement: 'single' }))} className={`px-4 py-3 rounded-lg border w-40 text-sm ${personalConfig.arrangement === 'single' ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'border-slate-200 text-slate-700'}`}>Single column</button>
                          <button onClick={() => setPersonalConfig(prev => ({ ...prev, arrangement: 'two' }))} className={`px-4 py-3 rounded-lg border w-40 text-sm ${personalConfig.arrangement === 'two' ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'border-slate-200 text-slate-700'}`}>Two columns</button>
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 text-sm font-medium text-slate-700">Contact style</div>
                        <div className="flex gap-3">
                          <button onClick={() => setPersonalConfig(prev => ({ ...prev, contactStyle: 'icon' }))} className={`px-4 py-3 rounded-lg border w-32 text-sm ${personalConfig.contactStyle === 'icon' ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'border-slate-200 text-slate-700'}`}>Icon</button>
                          <button onClick={() => setPersonalConfig(prev => ({ ...prev, contactStyle: 'bullet' }))} className={`px-4 py-3 rounded-lg border w-32 text-sm ${personalConfig.contactStyle === 'bullet' ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'border-slate-200 text-slate-700'}`}>Bullet</button>
                          <button onClick={() => setPersonalConfig(prev => ({ ...prev, contactStyle: 'bar' }))} className={`px-4 py-3 rounded-lg border w-32 text-sm ${personalConfig.contactStyle === 'bar' ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'border-slate-200 text-slate-700'}`}>Bar</button>
                        </div>
                      </div>
                    </div>

                    {/* Spacing Section */}
                    <div className="mb-8">
                      <h3 className="text-base font-semibold text-slate-800 mb-4">Spacing</h3>

                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-slate-700">Font Size</label>
                          <span className="text-sm text-slate-600">{spacingConfig.fontSize}pt</span>
                        </div>
                        <input
                          type="range"
                          min="8"
                          max="14"
                          value={spacingConfig.fontSize}
                          onChange={(e) =>
                            setSpacingConfig((prev) => ({ ...prev, fontSize: parseInt(e.target.value) }))
                          }
                          className="w-full"
                        />
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-slate-700">Line Height</label>
                          <span className="text-sm text-slate-600">{spacingConfig.lineHeight}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="2"
                          step="0.05"
                          value={spacingConfig.lineHeight}
                          onChange={(e) =>
                            setSpacingConfig((prev) => ({ ...prev, lineHeight: parseFloat(e.target.value) }))
                          }
                          className="w-full"
                        />
                      </div>

                      <div className="mb-6 grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700">Left & Right Margin</label>
                            <span className="text-sm text-slate-600">{spacingConfig.marginLR}mm</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="25"
                            value={spacingConfig.marginLR}
                            onChange={(e) =>
                              setSpacingConfig((prev) => ({ ...prev, marginLR: parseInt(e.target.value) }))
                            }
                            className="w-full"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700">Top & Bottom Margin</label>
                            <span className="text-sm text-slate-600">{spacingConfig.marginTB}mm</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="25"
                            value={spacingConfig.marginTB}
                            onChange={(e) =>
                              setSpacingConfig((prev) => ({ ...prev, marginTB: parseInt(e.target.value) }))
                            }
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-slate-700">Space between Entries</label>
                          <span className="text-sm text-slate-600">{spacingConfig.entrySpacing}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          value={spacingConfig.entrySpacing}
                          onChange={(e) =>
                            setSpacingConfig((prev) => ({ ...prev, entrySpacing: parseInt(e.target.value) }))
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
                          const section = sections.find((s) => s.id === sectionId);
                          const Icon = section?.icon;
                          return (
                            <div
                              key={sectionId}
                              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                            >
                              <div className="flex gap-1">
                                <button
                                  onClick={() =>
                                    index > 0 && handleSectionReorder(index, index - 1)
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
                              {Icon && <Icon size={16} className="text-slate-600" />}
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
                    {personalFields.map(({ label, name, type, colSpan }) => (
                      <div
                        key={name}
                        className={colSpan === 2 ? "md:col-span-2" : ""}
                      >
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          {label}
                        </label>
                        <input
                          type={type}
                          name={name}
                          value={formData[name]}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Professional Profile
                    </label>
                    <RichTextEditor
                      value={formData.profile}
                      onChange={(html) => setFormData((prev) => ({ ...prev, profile: html }))}
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

                  <Dialog
                    open={showAddSection}
                    onClose={() => setShowAddSection(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                      sx: {
                        borderRadius: 3,
                      },
                    }}
                  >
                    <DialogTitle
                      sx={{
                        m: 0,
                        p: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="text.primary"
                      >
                        Add content
                      </Typography>
                      <IconButton
                        aria-label="close"
                        onClick={() => setShowAddSection(false)}
                        sx={{
                          color: "text.secondary",
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ p: 3 }}>
                      <div className="flex flex-wrap justify-between gap-4">
                        {availableSections.map((section) => {
                          const Icon = section.icon;
                          const isAdded = sections.find(
                            (s) => s.id === section.id && s.visible
                          );
                          return (
                            <Card
                              sx={{
                                cursor: isAdded ? "not-allowed" : "pointer",
                                opacity: isAdded ? 0.5 : 1,
                                transition: "all 0.2s",
                                "&:hover": {
                                  boxShadow: isAdded ? 1 : 4,
                                  borderColor: isAdded
                                    ? "divider"
                                    : "primary.main",
                                },
                                border: "1px solid",
                                borderColor: "divider",
                                width: "32%",
                                display: "flex",
                                flexDirection: "column",
                              }}
                              onClick={() => !isAdded && addSection(section.id)}
                            >
                              <CardContent
                                sx={{
                                  p: 2.5,
                                  flexGrow: 1,
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <Box
                                  sx={{ display: "flex", gap: 2, flexGrow: 1 }}
                                >
                                  <Icon
                                    style={{
                                      color: "#6366f1",
                                      fontSize: 24,
                                      marginTop: 2,
                                      flexShrink: 0,
                                    }}
                                  />
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={600}
                                      color="text.primary"
                                      gutterBottom
                                    >
                                      {section.name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ display: "block" }}
                                    >
                                      {section.description}
                                    </Typography>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </DialogContent>
                  </Dialog>
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

                          {renderSectionForm(section)}

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
              <div className="flex items-start justify-center  px-2">
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
                      padding: `${spacingConfig.marginTB * 3.78}px ${spacingConfig.marginLR * 3.78}px`,
                      // expose CSS variables for font-size, line-height and entry spacing
                      ['--resume-font-size']: `${spacingConfig.fontSize}pt`,
                      ['--resume-line-height']: spacingConfig.lineHeight,
                      ['--resume-entry-spacing']: `${spacingConfig.entrySpacing}px`,
                      fontFamily: selectedFont.family ? `'${selectedFont.family}', serif` : undefined,
                    }}
                  >
                    <style>{`
                      /* Derived sizes to create a typographic hierarchy based on the base font size */
                      .resume-preview {
                        --resume-size-name: calc(var(--resume-font-size) * 2.2);
                        --resume-size-role: calc(var(--resume-font-size) * 1.15);
                        --resume-size-section: calc(var(--resume-font-size) * 1.15);
                        --resume-size-title: calc(var(--resume-font-size) * 1.0);
                        --resume-size-body: calc(var(--resume-font-size) * 0.95);
                        font-size: var(--resume-size-body);
                        line-height: var(--resume-line-height);
                      }
                      /* Specific element overrides to form a clear hierarchy */
                      .resume-preview .resume-name { font-size: var(--resume-size-name) !important; line-height: 1.05 !important; }
                      .resume-preview .resume-role { font-size: var(--resume-size-role) !important; color: #4f46e5 !important; }
                      .resume-preview .resume-section-heading { font-size: var(--resume-size-section) !important; font-weight: 700 !important; }
                      .resume-preview .resume-item-title { font-size: var(--resume-size-title) !important; font-weight: 700 !important; }
                      .resume-preview .resume-item-description { font-size: var(--resume-size-body) !important; line-height: var(--resume-line-height) !important; }
                      .resume-preview .resume-entry { margin-bottom: var(--resume-entry-spacing) !important; }
                    `}</style>
                    <div className="h-full flex flex-col">
                      {/* Header with photo */}
                      <div
                        className={`${
                          layoutConfig.headerPosition === "left"
                            ? "flex gap-6"
                            : layoutConfig.headerPosition === "right"
                            ? "flex gap-6 flex-row-reverse"
                            : "block"
                        } ${layoutConfig.headerPosition === "top" ? "border-b border-slate-200 pb-6" : ""}`}
                        style={{ textAlign: personalConfig.align }}
                      >
                        {formData.photoUrl && (
                          <div
                            className={`${
                              layoutConfig.headerPosition === "top" ? "h-24 w-24" : "h-20 w-20"
                            } rounded-full overflow-hidden border-2 border-slate-200 flex-shrink-0`}
                          >
                            <img
                              src={formData.photoUrl}
                              alt="profile"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className={`${layoutConfig.headerPosition === "top" ? "" : "flex-1"}`}>
                          {personalConfig.align === 'center' ? (
                            <>
                              <h1 className="resume-name text-3xl font-semibold text-slate-900">
                                {formData.fullName || "Your Name"}
                              </h1>
                              <p className="resume-role mt-1 text-sm font-medium text-indigo-600">
                                {formData.title || "Professional Title"}
                              </p>
                            </>
                          ) : (
                            <div className="flex items-center justify-between">
                              {personalConfig.align === 'left' ? (
                                <>
                                  <h1 className="resume-name text-3xl font-semibold text-slate-900 mr-4">
                                    {formData.fullName || "Your Name"}
                                  </h1>
                                  <p className="resume-role text-sm font-medium text-indigo-600">
                                    {formData.title || "Professional Title"}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="resume-role text-sm font-medium text-indigo-600">
                                    {formData.title || "Professional Title"}
                                  </p>
                                  <h1 className="resume-name text-3xl font-semibold text-slate-900">
                                    {formData.fullName || "Your Name"}
                                  </h1>
                                </>
                              )}
                            </div>
                          )}

                          {renderContactInfo()}
                        </div>
                      </div>

                      <div className="mt-6 flex-1 overflow-hidden">
                        {formData.profile && (
                          <div className="mb-6">
                            <h2 className="resume-section-heading text-lg font-bold text-slate-900 border-b-2 border-slate-900 pb-1 mb-4">
                              PROFILE
                            </h2>
                            <div
                              className="text-sm text-slate-700 leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: formData.profile }}
                            />
                          </div>
                        )}

                        {/* Dynamic Sections */}
                        {(() => {
                          const visibleSections = sectionOrder
                            .map((sectionId) => sections.find((s) => s.id === sectionId))
                            .filter((section) => section && section.visible);
                          if (layoutConfig.columns === "one") {
                            return (
                              <div className="space-y-6">
                                {visibleSections.map((section) => renderPreviewSection(section))}
                              </div>
                            );
                          } else if (layoutConfig.columns === "two") {
                            const leftSections = visibleSections.filter((_, idx) => idx % 2 === 0);
                            const rightSections = visibleSections.filter((_, idx) => idx % 2 === 1);
                            return (
                              <div
                                className="grid gap-6"
                                style={{
                                  gridTemplateColumns: `${layoutConfig.leftColumnWidth}% ${layoutConfig.rightColumnWidth}%`,
                                }}
                              >
                                <div className="space-y-6">
                                  {leftSections.map((section) => renderPreviewSection(section))}
                                </div>
                                <div className="space-y-6">
                                  {rightSections.map((section) => renderPreviewSection(section))}
                                </div>
                              </div>
                            );
                          } else { // mix
                            const first = visibleSections[0];
                            const rest = visibleSections.slice(1);
                            const leftRest = rest.filter((_, idx) => idx % 2 === 0);
                            const rightRest = rest.filter((_, idx) => idx % 2 === 1);
                            return (
                              <div>
                                {first && renderPreviewSection(first)}
                                {rest.length > 0 && (
                                  <div
                                    className="grid gap-6 mt-6"
                                    style={{
                                      gridTemplateColumns: `${layoutConfig.leftColumnWidth}% ${layoutConfig.rightColumnWidth}%`,
                                    }}
                                  >
                                    <div className="space-y-6">
                                      {leftRest.map((section) => renderPreviewSection(section))}
                                    </div>
                                    <div className="space-y-6">
                                      {rightRest.map((section) => renderPreviewSection(section))}
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
