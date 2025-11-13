import React from "react";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa";

const ContactIcon = ({ type, hasAccentBackground, isAdvancedMultiMode, hasImageBackground }) => {
  const iconClass = hasAccentBackground || isAdvancedMultiMode || hasImageBackground ? "text-white opacity-80" : "text-slate-500";
  const icons = {
    email: <FaEnvelope className={iconClass} />,
    phone: <FaPhone className={iconClass} />,
    location: <FaMapMarkerAlt className={iconClass} />,
    linkedin: <FaLinkedin className={iconClass} />,
    github: <FaGithub className={iconClass} />,
  };
  return icons[type] || <span />;
};

const ContactInfo = ({ formData, personalConfig, colorConfig }) => {
  const hasAccentBackground = colorConfig?.mode === "advanced" && 
                               colorConfig?.accentMode === "accent" && 
                               colorConfig?.selectedColor;
  
  const hasImageBackground = colorConfig?.mode === "advanced" && 
                              colorConfig?.accentMode === "image" && 
                              colorConfig?.selectedImage;
  
  const isAdvancedMultiMode = colorConfig?.mode === "advanced" && colorConfig?.accentMode === "multi";
  
  const textColorClass = hasAccentBackground || isAdvancedMultiMode || hasImageBackground ? "text-white" : "text-slate-600";
  
  const parts = [
    { v: formData.email, t: "email" },
    { v: formData.phone, t: "phone" },
    { v: formData.location, t: "location" },
  ].filter((p) => p.v);

  const secondary = [
    { v: formData.linkedin, t: "linkedin", url: formData.linkedinUrl },
    { v: formData.github, t: "github", url: formData.githubUrl },
  ].filter((p) => p.v);

  const renderElem = (item, idx) => (
    <span key={item.v + idx} className="inline-flex items-center gap-2">
      <ContactIcon type={item.t} hasAccentBackground={hasAccentBackground} isAdvancedMultiMode={isAdvancedMultiMode} hasImageBackground={hasImageBackground} />
      {item.url ? <a href={item.url} className={hasAccentBackground || isAdvancedMultiMode || hasImageBackground ? "text-white underline" : ""}>{item.v}</a> : item.v}
    </span>
  );

  if (personalConfig?.arrangement === "two") {
    return (
      <div className={`mt-3 flex items-center justify-between text-xs ${textColorClass}`}>
        <div className="flex items-center gap-4">
          {parts.map((p, i) => (
            <React.Fragment key={p.v + i}>
              {renderElem(p, i)}
              {i < parts.length - 1 && <span>&nbsp;|&nbsp;</span>}
            </React.Fragment>
          ))}
        </div>
        <div className={`flex items-center gap-4 ${textColorClass}`}>
          {secondary.map((s, i) => (
            <React.Fragment key={s.v + i}>
              {renderElem(s, i)}
              {i < secondary.length - 1 && <span>&nbsp;|&nbsp;</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  const all = [...parts, ...secondary];
  return (
    <div className={`mt-3 text-xs ${textColorClass}`}>
      {all.map((item, idx) => (
        <React.Fragment key={item.v + idx}>
          {renderElem(item, idx)}
          {idx < all.length - 1 && <span>&nbsp;|&nbsp;</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ContactInfo;
