import React, { useState } from "react";
import { FaRegFilePdf } from "react-icons/fa";
import { FiDownload, FiEye } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { exportResumeToPDF } from "../utils/ResumeExporter";

const ResumeNav = () => {
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();
  const { docId } = useParams();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportResumeToPDF("preview-resume", "My_Resume", {
        onSuccess: () => {
          setIsExporting(false);
          // Show success message
        },
        onError: (error) => {
          setIsExporting(false);
          alert("Failed to export PDF");
        },
      });
    } catch (error) {
      setIsExporting(false);
    }
  };

  async function downloadPDF() {
    try {
      setIsExporting(true);
      const response = await fetch(
        `https://resumela-server.vercel.app/export-pdf/${docId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      setIsExporting(false);
      if (response.status !== 200) {
        alert("failed to export PDF");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf";
      a.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      setIsExporting(false);
      alert("failed to export PDF: " + error.message);
    }
  }

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
            onClick={() => navigate(`/view/document/${docId}`)}
            className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50"
          >
            <FiEye /> View PDF
          </button>
          <button
            onClick={() => downloadPDF()}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
          >
            <FiDownload /> {isExporting ? "Exporting..." : "ATS-friendly PDF"}
          </button>
        </div>
      </div>
    </header>
  );
};

export default ResumeNav;
