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

  const contactStyle = personalConfig?.contactStyle || "icon";

  const renderElem = (item, idx) => {
    const content = item.url ? (
      <a href={item.url} className={hasAccentBackground || isAdvancedMultiMode || hasImageBackground ? "text-white underline" : ""}>
        {item.v}
      </a>
    ) : (
      item.v
    );

    if (contactStyle === "icon") {
      return (
        <span key={item.v + idx} className="inline-flex items-center gap-2">
          <ContactIcon type={item.t} hasAccentBackground={hasAccentBackground} isAdvancedMultiMode={isAdvancedMultiMode} hasImageBackground={hasImageBackground} />
          {content}
        </span>
      );
    }

    // For 'bullet' and 'bar' styles, don't render icons; just render text
    return (
      <span key={item.v + idx} className="inline-flex items-center gap-1">
        {content}
      </span>
    );
  };

  const separatorForStyle = () => {
    // No separator when using icon style
    if (contactStyle === "icon") return null;
    if (contactStyle === "bullet") {
      // larger, lighter bullet for better readability
      return <span className="mx-2 text-sm text-slate-400">&bull;</span>;
    }
    // 'bar' fallback
    return <span className="mx-1">|</span>;
  };

  if (personalConfig?.arrangement === "two") {
    return (
      <div className={`mt-3 flex items-center justify-between text-xs ${textColorClass}`}>
        <div className="flex items-center gap-2">
          {parts.map((p, i) => (
            <React.Fragment key={p.v + i}>
              {renderElem(p, i)}
              {i < parts.length - 1 && separatorForStyle()}
            </React.Fragment>
          ))}
        </div>
        <div className={`flex items-center gap-2 ${textColorClass}`}>
          {secondary.map((s, i) => (
            <React.Fragment key={s.v + i}>
              {renderElem(s, i)}
              {i < secondary.length - 1 && separatorForStyle()}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  const all = [...parts, ...secondary];

  // For icon style, use a flex container with gap to space entries (no separators)
  if (contactStyle === "icon") {
    // Align icon items according to personalConfig.align when not using two-column arrangement
    const align = personalConfig?.align || "left";
    // For icon style, when header align is 'right' we still want the
    // contact entries to be left-aligned within the content area (so they
    // line up with name/title). Therefore map both 'left' and 'right'
    // to `justify-start`. Keep `justify-between` for two-column arrangement.
    const justifyClass =
      personalConfig?.arrangement === "two"
        ? "justify-between"
        : align === "center"
        ? "justify-center"
        : "justify-start";

    return (
      <div className={`mt-1 flex items-center flex-wrap gap-3 text-xs ${textColorClass} ${justifyClass}`}>
        {all.map((item, idx) => (
          <React.Fragment key={item.v + idx}>
            {renderElem(item, idx)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // For bullet/bar styles, keep inline separators
  return (
    <div className={`mt-3 text-xs ${textColorClass}`}>
      {all.map((item, idx) => (
        <React.Fragment key={item.v + idx}>
          {renderElem(item, idx)}
          {idx < all.length - 1 && separatorForStyle()}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ContactInfo;
