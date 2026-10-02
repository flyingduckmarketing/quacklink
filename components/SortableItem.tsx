"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export default function SortableItem({
  id,
  children,
  className = "",
  handleClassName = "",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  handleClassName?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={className}>
      <button
        type="button"
        aria-label="Drag to reorder"
        className={`cursor-grab touch-none text-slate-400 hover:text-slate-600 active:cursor-grabbing ${handleClassName}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>
      {children}
    </div>
  );
}
