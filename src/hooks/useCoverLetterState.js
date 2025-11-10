import { useRef, useState, useCallback } from "react";

// Helper function to get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const DEFAULT_FORM_DATA = {
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  date: getCurrentDate(),
  recipientName: "",
  company: "",
  companyLocation: "",
  letterContent: "<p></p>",
  signatureImage: null,
  signatureName: "",
  signaturePlace: "",
  signatureDate: "",
};



const DEFAULT_SPACING_CONFIG = {
  fontSize: 9,
  lineHeight: 1.25,
  marginLR: 10,
  marginTB: 10,
  entrySpacing: 0,
};

const DEFAULT_PERSONAL_CONFIG = {
  align: "center",
  arrangement: "single",
  contactStyle: "icon",
};

const DEFAULT_COLOR_CONFIG = {
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
};

const DEFAULT_SELECTED_FONT = {
  family: "PT Serif",
  category: "serif",
  css: "PT+Serif:wght@400;700",
};

const DEFAULT_LAYOUT_CONFIG = {
  columns: "one",
  headerPosition: "top",
  leftColumnWidth: 50,
  rightColumnWidth: 50,
};

export { DEFAULT_FORM_DATA, DEFAULT_SPACING_CONFIG, DEFAULT_PERSONAL_CONFIG, DEFAULT_COLOR_CONFIG, DEFAULT_SELECTED_FONT, DEFAULT_LAYOUT_CONFIG };

export const useCoverLetterState = () => {
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [spacingConfig, setSpacingConfig] = useState(DEFAULT_SPACING_CONFIG);
  const [personalConfig, setPersonalConfig] = useState(DEFAULT_PERSONAL_CONFIG);
  const [colorConfig, setColorConfig] = useState(DEFAULT_COLOR_CONFIG);
  const [selectedFont, setSelectedFont] = useState(DEFAULT_SELECTED_FONT);
  const [layoutConfig, setLayoutConfig] = useState(DEFAULT_LAYOUT_CONFIG);
  const [activeTab, setActiveTab] = useState("content");
  const [activeFontCategory, setActiveFontCategory] = useState("serif");

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSignatureUpload = useCallback((event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({ ...prev, signatureImage: e.target.result }));
    };
    reader.readAsDataURL(file);
  }, []);

  const computeSignature = useCallback((data, layout) => {
    const important = {
      fullName: data?.fullName || "",
      letterContent: data?.letterContent || "",
      company: data?.company || "",
      recipientName: data?.recipientName || "",
      fontSize: layout?.spacingConfig?.fontSize || 9,
      font: layout?.selectedFont?.family || "",
    };
    return JSON.stringify(important);
  }, []);

  return {
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
    handleSignatureUpload,
    computeSignature,
  };
};

export const useCoverLetterLocalStorage = () => {
  const draftLocalStorageKey = () => "coverletter_draft_v1";

  const saveDraftToLocal = useCallback((data) => {
    try {
      window.localStorage.setItem(draftLocalStorageKey(), JSON.stringify(data));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, []);

  const loadDraftFromLocal = useCallback(() => {
    try {
      const raw = window.localStorage.getItem(draftLocalStorageKey());
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : null;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  return { saveDraftToLocal, loadDraftFromLocal };
};
