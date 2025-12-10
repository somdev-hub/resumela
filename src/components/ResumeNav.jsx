import React, { useState } from "react";
import { FaRegFilePdf } from "react-icons/fa";
import { FiDownload, FiEye, FiMenu } from "react-icons/fi";
import { MdSave } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { Visibility as VisibilityIcon } from "@mui/icons-material";

const ResumeNav = ({ onPreviewToggle, onSaveTemplate, isSavingTemplate }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { docId } = useParams();

  async function downloadPDF() {
    try {
      setIsExporting(true);
      const response = await fetch(
        `https://resumela-server.onrender.com/export-pdf/${docId}`,
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
      <div className="px-4 md:px-6 flex items-center justify-between gap-3 h-full">
        <div className="hidden md:flex items-center gap-3">
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
        
        {/* Mobile Header Title */}
        <div className="md:hidden flex items-center gap-2">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <FaRegFilePdf size={16} />
          </div>
          <h1 className="text-lg font-semibold text-slate-800">Resume</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Desktop Buttons */}
          <button
            onClick={() => navigate(`/view/document/${docId}`)}
            className="hidden md:inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50"
          >
            <FiEye /> View PDF
          </button>
          <button
            onClick={onSaveTemplate}
            disabled={isSavingTemplate}
            className={`hidden md:inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm transition ${
              isSavingTemplate
                ? "cursor-not-allowed bg-amber-50 text-amber-400"
                : "text-amber-600 hover:bg-amber-50"
            }`}
            title="Save current resume as template"
          >
            {isSavingTemplate ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <MdSave /> Save as Template
              </>
            )}
          </button>
          <button
            onClick={() => downloadPDF()}
            className="hidden md:inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
          >
            <FiDownload /> ATS-friendly PDF
          </button>

          {/* Mobile Preview Button */}
          <button
            onClick={onPreviewToggle}
            className="md:hidden inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50"
          >
            <VisibilityIcon sx={{ fontSize: 18 }} /> Preview
          </button>

          {/* Mobile Hamburger Menu */}
          <IconButton
            onClick={(e) => setMenuAnchorEl(e.currentTarget)}
            sx={{ display: { xs: "inline-flex", md: "none" } }}
            size="small"
          >
            <FiMenu size={20} />
          </IconButton>

          {/* Mobile Menu Dropdown */}
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={() => setMenuAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem
              onClick={() => {
                navigate(`/view/document/${docId}`);
                setMenuAnchorEl(null);
              }}
            >
              View PDF
            </MenuItem>
            <MenuItem
              onClick={() => {
                onSaveTemplate?.();
                setMenuAnchorEl(null);
              }}
              disabled={isSavingTemplate}
            >
              {isSavingTemplate ? "Saving Template..." : "Save as Template"}
            </MenuItem>
            <MenuItem
              onClick={() => {
                downloadPDF();
                setMenuAnchorEl(null);
              }}
              disabled={isExporting}
            >
              {isExporting ? "Exporting..." : "Download PDF"}
            </MenuItem>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default ResumeNav;
