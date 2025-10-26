import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiMenu, FiCheck, FiX, FiEdit2 } from "react-icons/fi";

const SortableItem = React.memo(
  ({ item, section, children, onToggleCollapsed, onRemove }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    const getItemSummary = () => {
      const { title, subtitle, date } = item.data;
      if (title) return title;
      if (subtitle) return subtitle;
      if (date) return date;
      return "Untitled Entry";
    };
    if (item.collapsed) {
      return (
        <div ref={setNodeRef} style={style} className="mb-3 p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600" title="Drag to reorder">
                <FiMenu size={18} />
              </button>
              <div className="flex-1">
                <h5 className="font-medium text-slate-800">{getItemSummary()}</h5>
                {item.data.subtitle && item.data.title && (
                  <p className="text-sm text-slate-500 mt-1">{item.data.subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onToggleCollapsed(section.id, item.id)} className="text-indigo-600 hover:text-indigo-700 p-2" title="Edit">
                <FiEdit2 size={16} />
              </button>
              <button onClick={() => onRemove && onRemove(item.id)} className="text-rose-600 hover:text-rose-700 p-2" title="Remove">
                <FiX size={18} />
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div ref={setNodeRef} style={style} className="">
        
        {children}
      </div>
    );
  }
);
SortableItem.displayName = "SortableItem";
export default SortableItem;