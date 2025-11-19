import React from "react";
import ContactInfo from "./ContactInfo";

const ResumeHeader = ({ formData, personalConfig, colorConfig }) => {
  const hasAccentBackground = colorConfig?.mode === "advanced" && 
                               colorConfig?.accentMode === "accent" && 
                               colorConfig?.selectedColor;
  
  const hasImageBackground = colorConfig?.mode === "advanced" && 
                              colorConfig?.accentMode === "image" && 
                              colorConfig?.selectedImage;
  
  const isBasicMode = colorConfig?.mode === "basic" && colorConfig?.selectedColor;
  const isBasicMultiMode = colorConfig?.mode === "basic" && colorConfig?.accentMode === "multi";
  const isAdvancedMultiMode = colorConfig?.mode === "advanced" && colorConfig?.accentMode === "multi";
  
  // For multicolor mode, use appropriate colors based on mode
  const getNameColor = () => {
    if (hasAccentBackground || hasImageBackground) return "#ffffff";
    if (isBasicMultiMode) return colorConfig.multiTextColor || "#1f2937";
    if (isBasicMode) return colorConfig.selectedColor;
    if (isAdvancedMultiMode) return colorConfig.multiHeaderTextColor || "#ffffff";
    return null;
  };
  
  const getTitleColor = () => {
    if (hasAccentBackground || hasImageBackground) return "#ffffff";
    if (isBasicMultiMode) return colorConfig.multiAccentColor || "#2c3e50";
    if (isBasicMode) return colorConfig.selectedColor;
    if (isAdvancedMultiMode) return colorConfig.multiHeaderAccentColor || colorConfig.multiHeaderTextColor || "#ffffff";
    return "#4f46e5"; // Default indigo color
  };
  
  const getProfilePictureAlignment = () => {
    switch (personalConfig.align) {
      case "left":
        return "justify-start";
      case "right":
        return "justify-end";
      default:
        return "justify-center"; // Default to center alignment
    }
  };

  // Only render the internal photo when personal alignment is center.
  // When alignment is left/right the parent (`MultiPageResume`) will render the photo
  // as a sibling so flex ordering can place it at the outer edge.
  return (
    <div className={personalConfig.align === "center" ? "text-center" : "text-left"}>
      {formData.photoUrl && personalConfig.align === "center" && (
        <div className={`flex ${getProfilePictureAlignment()} mb-4`}>
          <img
            src={formData.photoUrl}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
          />
        </div>
      )}
      <h1 
        className={`resume-name text-3xl font-semibold ${hasAccentBackground || hasImageBackground ? "text-white" : "text-slate-900"}`}
        style={getNameColor() ? { color: getNameColor() } : {}}
      >
        {formData.fullName || "Your Name"}
      </h1>
      <p 
        className={`resume-role mt-1 text-sm font-medium ${hasAccentBackground || hasImageBackground ? "text-white opacity-90" : ""}`}
        style={{ color: getTitleColor() }}
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