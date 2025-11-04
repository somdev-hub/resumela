import React, { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Image,
} from "lucide-react";

const RichTextEditor = ({ 
  initialContent = '', 
  value = '',
  onChange = () => {}, 
  placeholder = 'Start typing...',  
  className = ''
}) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      // Use value prop if provided, otherwise use initialContent
      const contentToSet = value || initialContent;
      if (contentToSet && editorRef.current.innerHTML !== contentToSet) {
        editorRef.current.innerHTML = contentToSet;
      }
    }
  }, [value, initialContent]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const changeFontSize = (e) => {
    const size = e.target.value;
    execCommand('fontSize', size);
  };

  const buttons = [
    { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
    { icon: Underline, command: 'underline', title: 'Underline (Ctrl+U)' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    
  ];

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-lg">
        {/* Toolbar */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-gray-200 p-3 flex flex-wrap gap-2 items-center">
         
          {buttons.map(({ icon: Icon, command, title, action }) => (
            <button
              key={command}
              onClick={() => action ? action() : execCommand(command)}
              className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-50 group"
              title={title}
              type="button"
            >
              <Icon size={20} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
            </button>
          ))}

          
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`min-h-64 p-4 focus:outline-none ${
            isFocused ? 'ring-2 ring-blue-500 ring-inset' : ''
          }`}
          data-placeholder={placeholder}
          style={{
            caretColor: 'black'
          }}
        />
      </div>

      <style jsx>{`
        [contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contentEditable] img {
          max-width: 100%;
          height: auto;
        }
        [contentEditable] a {
          color: #2563eb;
          text-decoration: underline;
        }
        [contentEditable] ul {
          list-style-type: disc;
          padding-left: 2rem;
          margin: 0.5rem 0;
        }
        [contentEditable] ol {
          list-style-type: decimal;
          padding-left: 2rem;
          margin: 0.5rem 0;
        }
        [contentEditable] li {
          margin: 0.25rem 0;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
