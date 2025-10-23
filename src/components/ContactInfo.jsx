import React from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaGithub } from "react-icons/fa";

const ContactIcon = ({ type }) => {
  const icons = {
    email: <FaEnvelope className="text-slate-500" />,
    phone: <FaPhone className="text-slate-500" />,
    location: <FaMapMarkerAlt className="text-slate-500" />,
    linkedin: <FaLinkedin className="text-slate-500" />,
    github: <FaGithub className="text-slate-500" />,
  };
  return icons[type] || <span />;
};

const ContactInfo = ({ formData, personalConfig }) => {
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
      <ContactIcon type={item.t} />
      {item.url ? <a href={item.url}>{item.v}</a> : item.v}
    </span>
  );

  if (personalConfig?.arrangement === "two") {
    return (
      <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-4">
          {parts.map((p, i) => (
            <React.Fragment key={p.v + i}>
              {renderElem(p, i)}
              {i < parts.length - 1 && <span>&nbsp;|&nbsp;</span>}
            </React.Fragment>
          ))}
        </div>
        <div className="flex items-center gap-4 text-slate-600">
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
    <div className="mt-3 text-xs text-slate-600">
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