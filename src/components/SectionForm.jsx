import React from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import RichTextEditor from "./RichTextEditor";

const SectionForm = ({ section, sensors, handleDragEnd, toggleItemCollapsed, removeItemFromSection, updateSectionItem }) => (
  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => handleDragEnd(section.id, event)}>
    <SortableContext items={section.items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
      {section.items.map((item) => (
        <SortableItem key={item.id} item={item} section={section} onToggleCollapsed={toggleItemCollapsed} onRemove={removeItemFromSection}>
          <div className="grid grid-cols-1 gap-4">
            <input
              placeholder="Title"
              value={item.data.title || ""}
              onChange={(e) => updateSectionItem(section.id, item.id, "title", e.target.value)}
              className="w-full rounded-lg border px-4 py-2 text-sm"
            />
            <div>
              <RichTextEditor
                value={item.data.description}
                onChange={(html) => updateSectionItem(section.id, item.id, "description", html)}
                className="min-h-[80px]"
              />
            </div>
          </div>
        </SortableItem>
      ))}
    </SortableContext>
  </DndContext>
);

export default SectionForm;