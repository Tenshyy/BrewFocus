"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDashboardStore } from "@/stores/dashboardStore";
import LucideIcon from "@/components/ui/LucideIcon";

interface DraggableWidgetProps {
  id: string;
  children: React.ReactNode;
}

export default function DraggableWidget({ id, children }: DraggableWidgetProps) {
  const editMode = useDashboardStore((s) => s.editMode);
  const widget = useDashboardStore((s) => s.widgets.find((w) => w.id === id));
  const toggleWidget = useDashboardStore((s) => s.toggleWidget);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !editMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : widget?.enabled === false ? 0.4 : 1,
  };

  if (!editMode && !widget?.enabled) return null;

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {editMode && (
        <div className="absolute -top-1 -right-1 z-10 flex items-center gap-1">
          {/* Eye toggle */}
          <button
            onClick={() => toggleWidget(id)}
            className="w-5 h-5 flex items-center justify-center rounded bg-brew-bg/80 border border-brew-border text-[10px] hover:text-brew-cream transition-colors cursor-pointer"
            title={widget?.enabled ? "Hide" : "Show"}
          >
            <LucideIcon name={widget?.enabled ? "eye" : "eye-off"} size={10} />
          </button>
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="w-5 h-5 flex items-center justify-center rounded bg-brew-bg/80 border border-brew-border text-[10px] text-brew-gray hover:text-brew-cream transition-colors cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
          >
            <LucideIcon name="grip-vertical" size={10} />
          </button>
        </div>
      )}
      {editMode && !widget?.enabled && (
        <div className="absolute inset-0 bg-brew-bg/50 rounded pointer-events-none z-[5]" />
      )}
      {children}
    </div>
  );
}
