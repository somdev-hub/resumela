import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiMenu, FiX, FiEdit2, FiEye, FiEyeOff } from "react-icons/fi";

const SortableItem = React.memo(
  ({
    item,
    section,
    children,
    onToggleCollapsed,
    onRemove,
    onToggleVisibility,
  }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: item.id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    const isVisible = Object.prototype.hasOwnProperty.call(item, "visible")
      ? !!item.visible
      : true;
    const getItemSummary = () => {
      const { title, subtitle, date } = item.data;
      if (title) return title;
      if (subtitle) return subtitle;
      if (date) return date;
      return "Untitled Entry";
    };
    if (item.collapsed) {
      return (
        <div
          ref={setNodeRef}
          style={style}
          className="mb-3 p-2 sm:p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 w-full">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 flex-shrink-0"
                title="Drag to reorder"
              >
                <FiMenu size={18} />
              </button>
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-slate-800 text-sm sm:text-base truncate">
                  {getItemSummary()}
                </h5>
                {item.data.subtitle && item.data.title && (
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 truncate">
                    {item.data.subtitle}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {onToggleVisibility && (
                <button
                  onClick={() => onToggleVisibility(section.id, item.id)}
                  className="text-slate-600 hover:text-slate-800 p-1.5 sm:p-2"
                  title={isVisible ? "Hide from preview" : "Show in preview"}
                >
                  {isVisible ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                </button>
              )}
              <button
                onClick={() => onToggleCollapsed(section.id, item.id)}
                className="text-indigo-600 hover:text-indigo-700 p-1.5 sm:p-2"
                title="Edit"
              >
                <FiEdit2 size={16} />
              </button>
              <button
                onClick={() => onRemove && onRemove(item.id)}
                className="text-rose-600 hover:text-rose-700 p-1.5 sm:p-2"
                title="Remove"
              >
                <FiX size={18} />
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div ref={setNodeRef} style={style} className="">
        <div className="flex items-center justify-end gap-1 sm:gap-2 mb-2">
          {onToggleVisibility && (
            <button
              onClick={() => onToggleVisibility(section.id, item.id)}
              className="text-slate-600 hover:text-slate-800 p-1.5 sm:p-2"
              title={isVisible ? "Hide from preview" : "Show in preview"}
            >
              {isVisible ? <FiEye size={16} /> : <FiEyeOff size={16} />}
            </button>
          )}
          <button
            onClick={() => onRemove && onRemove(item.id)}
            className="text-rose-600 hover:text-rose-700 p-1.5 sm:p-2"
            title="Remove"
          >
            <FiX size={18} />
          </button>
        </div>
        {children}
      </div>
    );
  }
);
SortableItem.displayName = "SortableItem";
export default SortableItem;
