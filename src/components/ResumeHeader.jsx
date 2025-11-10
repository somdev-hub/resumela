import React from "react";
import ContactInfo from "./ContactInfo";

const ResumeHeader = ({ formData, personalConfig, colorConfig }) => {
  const hasAccentBackground = colorConfig?.mode === "advanced" && 
                               colorConfig?.accentMode === "accent" && 
                               colorConfig?.selectedColor;
  
  const isBasicMode = colorConfig?.mode === "basic" && colorConfig?.selectedColor;
  const isMultiMode = colorConfig?.mode === "advanced" && colorConfig?.accentMode === "multi";
  
  // For multicolor mode, use multiTextColor for text
  const getNameColor = () => {
    if (hasAccentBackground) return "#ffffff";
    if (isBasicMode) return colorConfig.selectedColor;
    if (isMultiMode) return colorConfig.multiTextColor || "#1f2937";
    return null;
  };
  
  const getTitleColor = () => {
    if (hasAccentBackground) return "#ffffff";
    if (isBasicMode) return colorConfig.selectedColor;
    if (isMultiMode) return colorConfig.multiAccentColor || "#2c3e50";
    return null;
  };
  
  return (
    <div className={personalConfig.align === "center" ? "text-center" : "text-left"}>
      <h1 
        className={`resume-name text-3xl font-semibold ${hasAccentBackground ? "text-white" : "text-slate-900"}`}
        style={getNameColor() ? { color: getNameColor() } : {}}
      >
        {formData.fullName || "Your Name"}
      </h1>
      <p 
        className={`resume-role mt-1 text-sm font-medium ${hasAccentBackground ? "text-white opacity-90" : "text-indigo-600"}`}
        style={getTitleColor() ? { color: getTitleColor() } : {}}
      >
        {formData.title || "Professional Title"}
      </p>
      <ContactInfo 
        formData={formData} 
        personalConfig={personalConfig} 
        colorConfig={colorConfig}
      />
    </div>
  );
};

export default ResumeHeader;