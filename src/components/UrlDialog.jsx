import React from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";

const UrlDialog = ({ open, field, tempUrl, onClose, onSave, onChange }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>
      {field ? `Set URL for ${field}` : "Set URL"}
    </DialogTitle>
    <DialogContent>
      <input
        type="url"
        value={tempUrl}
        onChange={onChange}
        placeholder="https://"
        className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 mb-4"
      />
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-3 py-2 rounded border">
          Cancel
        </button>
        <button onClick={onSave} className="px-3 py-2 rounded bg-indigo-600 text-white">
          Save
        </button>
      </div>
    </DialogContent>
  </Dialog>
);

export default UrlDialog;
