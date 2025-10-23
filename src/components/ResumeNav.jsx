import React from "react";
import { FaRegFilePdf } from "react-icons/fa";
import { FiDownload, FiEye } from "react-icons/fi";

const ResumeNav = ({ toPDF, downloadATSOptimizedPDF }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-20 bg-white/90 backdrop-blur border-b border-indigo-100 shadow-sm">
      <div className=" px-6 flex items-center justify-between gap-3 h-full">
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
  );
};

export default ResumeNav;
