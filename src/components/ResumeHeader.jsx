import React from "react";
import ContactInfo from "./ContactInfo";

const ResumeHeader = ({ formData, personalConfig }) => (
  <div className={personalConfig.align === "center" ? "text-center" : "text-left"}>
    <h1 className="resume-name text-3xl font-semibold text-slate-900">
      {formData.fullName || "Your Name"}
    </h1>
    <p className="resume-role mt-1 text-sm font-medium text-indigo-600">
      {formData.title || "Professional Title"}
    </p>
    <ContactInfo formData={formData} personalConfig={personalConfig} />
  </div>
);

export default ResumeHeader;