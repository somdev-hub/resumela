import React, { useState, useRef, useEffect } from 'react';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
} from 'react-icons/fa';
import { FiLink } from 'react-icons/fi';

const RichTextEditor = ({ value, onChange, className = '', style = {} }) => {
  const [toolbarState, setToolbarState] = useState({
    bold: false,
    italic: false,
    underline: false,
    insertUnorderedList: false,
    insertOrderedList: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
  });

  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    refreshToolbarState();
  };

  const refreshToolbarState = () => {
    setToolbarState({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
      justifyLeft: document.queryCommandState("justifyLeft"),
      justifyCenter: document.queryCommandState("justifyCenter"),
      justifyRight: document.queryCommandState("justifyRight"),
    });
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) execCmd("createLink", url);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 p-2 border border-slate-200 rounded-lg bg-slate-50 mb-2">
        <button
          type="button"
          onClick={() => execCmd("bold")}
          className={`p-2 rounded hover:bg-slate-200 transition ${
            toolbarState.bold ? "bg-purple-200 text-purple-700" : "text-slate-600"
          }`}
          title="Bold"
        >
          <FaBold size={14} />
        </button>
        <button
          type="button"
          onClick={() => execCmd("italic")}
          className={`p-2 rounded hover:bg-slate-200 transition ${
            toolbarState.italic ? "bg-purple-200 text-purple-700" : "text-slate-600"
          }`}
          title="Italic"
        >
          <FaItalic size={14} />
        </button>
        <button
          type="button"
          onClick={() => execCmd("underline")}
          className={`p-2 rounded hover:bg-slate-200 transition ${
            toolbarState.underline ? "bg-purple-200 text-purple-700" : "text-slate-600"
          }`}
          title="Underline"
        >
          <FaUnderline size={14} />
        </button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <button
          type="button"
          onClick={() => execCmd("insertUnorderedList")}
          className={`p-2 rounded hover:bg-slate-200 transition ${
            toolbarState.insertUnorderedList ? "bg-purple-200 text-purple-700" : "text-slate-600"
          }`}
          title="Bullet List"
        >
          <FaListUl size={14} />
        </button>
        <button
          type="button"
          onClick={() => execCmd("insertOrderedList")}
          className={`p-2 rounded hover:bg-slate-200 transition ${
            toolbarState.insertOrderedList ? "bg-purple-200 text-purple-700" : "text-slate-600"
          }`}
          title="Numbered List"
        >
          <FaListOl size={14} />
        </button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <button
          type="button"
          onClick={insertLink}
          className="p-2 rounded hover:bg-slate-200 transition text-slate-600"
          title="Insert Link"
        >
          <FiLink size={14} />
        </button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <button
          type="button"
          onClick={() => execCmd("justifyLeft")}
          className={`p-2 rounded hover:bg-slate-200 transition ${
            toolbarState.justifyLeft ? "bg-purple-200 text-purple-700" : "text-slate-600"
          }`}
          title="Align Left"
        >
          <FaAlignLeft size={14} />
        </button>
        <button
          type="button"
          onClick={() => execCmd("justifyCenter")}
          className={`p-2 rounded hover:bg-slate-200 transition ${
            toolbarState.justifyCenter ? "bg-purple-200 text-purple-700" : "text-slate-600"
          }`}
          title="Align Center"
        >
          <FaAlignCenter size={14} />
        </button>
        <button
          type="button"
          onClick={() => execCmd("justifyRight")}
          className={`p-2 rounded hover:bg-slate-200 transition ${
            toolbarState.justifyRight ? "bg-purple-200 text-purple-700" : "text-slate-600"
          }`}
          title="Align Right"
        >
          <FaAlignRight size={14} />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => {
          if (e.target && onChange) {
            onChange(e.target.innerHTML);
          }
        }}
        onMouseUp={refreshToolbarState}
        onKeyUp={refreshToolbarState}
        onFocus={refreshToolbarState}
        className={`w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 ${className}`}
        style={{ whiteSpace: "pre-wrap", ...style }}
        dir="ltr"
      />
    </div>
  );
};

export default RichTextEditor;
