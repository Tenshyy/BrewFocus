"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types/task";
import { useTaskStore } from "@/stores/taskStore";
import { useTimerStore } from "@/stores/timerStore";
import { useAiStore } from "@/stores/aiStore";
import { useTranslations } from "next-intl";
import CategoryBadge from "./CategoryBadge";
import RecurrencePopover from "./RecurrencePopover";
import { getRecurrenceLabel } from "@/lib/recurrence";
import { PRIORITY_COLORS } from "@/lib/constants";
import LucideIcon from "@/components/ui/LucideIcon";

interface TaskItemProps {
  task: Task;
  index: number;
  actualPomodoros?: number;
  draggable?: boolean;
}

export default function TaskItem({ task, index, actualPomodoros = 0, draggable = false }: TaskItemProps) {
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editingEstimate, setEditingEstimate] = useState(false);
  const [editEstimate, setEditEstimate] = useState(
    String(task.estimatedPomodoros ?? "")
  );
  const [recurrenceOpen, setRecurrenceOpen] = useState(false);
  const t = useTranslations("tasks");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !draggable });

  const sortableStyle = draggable
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0.5 : undefined,
      }
    : undefined;

  const isDone = task.status === "done";

  function handleSave() {
    if (editTitle.trim()) {
      updateTask(task.id, { title: editTitle.trim() });
    }
    setEditing(false);
  }

  function handleSaveEstimate() {
    const val = parseInt(editEstimate, 10);
    if (val > 0 && val <= 99) {
      updateTask(task.id, { estimatedPomodoros: val });
    }
    setEditingEstimate(false);
  }

  async function handleReEstimate() {
    // Dynamic import to avoid circular deps and keep bundle light
    const { autoEstimateTask } = await import("@/lib/ai/autoEstimate");
    autoEstimateTask(task.id);
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...(sortableStyle || {}),
        animation: !isDragging ? `slideIn 0.3s ease ${index * 0.05}s both` : undefined,
        borderLeftColor: PRIORITY_COLORS[task.priority] || undefined,
      }}
      className={`group flex items-center gap-2.5 bg-brew-bg border border-brew-border border-l-2 rounded-md px-2.5 py-2 transition-all duration-300 ${
        isDone ? "opacity-50 border-transparent" : ""
      } ${isDragging ? "shadow-lg shadow-brew-orange/20" : ""}`}
    >
      {/* Drag handle */}
      {draggable && (
        <button
          {...attributes}
          {...listeners}
          className="text-brew-gray/30 hover:text-brew-gray cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 touch-none"
          aria-label={t("reorder")}
          tabIndex={-1}
        >
          ⠿
        </button>
      )}

      {/* Checkbox */}
      <button
        onClick={() => toggleTask(task.id)}
        className={`w-4 h-4 flex-shrink-0 border-2 rounded-sm flex items-center justify-center transition-all duration-200 cursor-pointer ${
          isDone
            ? "bg-brew-orange border-brew-orange"
            : "border-brew-border hover:border-brew-gray"
        }`}
        style={isDone ? { animation: "checkBounce 0.2s ease" } : undefined}
        aria-label={isDone ? t("markUndone") : t("markDone")}
      >
        {isDone && (
          <LucideIcon name="check" size={10} className="text-[#0D0B09]" />
        )}
      </button>

      {/* Badge */}
      <CategoryBadge category={task.category} />

      {/* Pomodoro estimation badge */}
      {task.estimatedPomodoros ? (
        editingEstimate ? (
          <input
            value={editEstimate}
            onChange={(e) => setEditEstimate(e.target.value.replace(/\D/g, ""))}
            onBlur={handleSaveEstimate}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveEstimate();
              if (e.key === "Escape") setEditingEstimate(false);
            }}
            autoFocus
            className="w-8 bg-brew-orange/10 border border-brew-orange/30 rounded text-[9px] text-brew-orange text-center outline-none font-mono"
            maxLength={2}
          />
        ) : (
          <button
            onClick={() => {
              setEditEstimate(String(task.estimatedPomodoros ?? ""));
              setEditingEstimate(true);
            }}
            className="text-[11px] text-brew-orange px-1 py-0.5 rounded bg-brew-orange/10 cursor-pointer hover:bg-brew-orange/20 transition-colors flex-shrink-0"
            title={t("editEstimate")}
          >
            {actualPomodoros > 0
              ? `${actualPomodoros}/${task.estimatedPomodoros}`
              : task.estimatedPomodoros}
            p.
          </button>
        )
      ) : (
        /* Re-estimate button for tasks without estimation */
        !isDone && (
          <button
            onClick={handleReEstimate}
            className="text-[9px] text-brew-gray px-0.5 opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-opacity cursor-pointer"
            aria-label={t("estimatePomodoros")}
            title={t("estimateAi")}
          >
            p.?
          </button>
        )
      )}

      {/* Title */}
      {editing ? (
        <input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setEditing(false);
          }}
          autoFocus
          className="flex-1 bg-transparent border-b border-brew-orange text-[12px] text-brew-cream outline-none font-mono"
        />
      ) : (
        <button
          className={`flex-1 text-[12px] transition-all duration-300 cursor-pointer text-left bg-transparent border-none p-0 font-mono focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brew-orange ${
            isDone ? "line-through text-brew-gray" : "text-brew-cream"
          }`}
          onDoubleClick={() => {
            setEditTitle(task.title);
            setEditing(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setEditTitle(task.title);
              setEditing(true);
            }
          }}
          aria-label={t("editTask")}
        >
          {task.title}
        </button>
      )}

      {/* Pin to timer */}
      {!isDone && (
        <button
          onClick={() => useTimerStore.getState().setActiveTask(task.id)}
          className={`text-xs px-0.5 transition-opacity cursor-pointer ${
            useTimerStore.getState().activeTaskId === task.id
              ? "text-brew-orange opacity-100"
              : "text-brew-gray opacity-0 group-hover:opacity-70 hover:!opacity-100"
          }`}
          aria-label={t("pinTimer")}
          title={t("pinTimer")}
        >
          <LucideIcon name="pin" size={12} />
        </button>
      )}

      {/* AI Decompose */}
      {!isDone && (
        <button
          onClick={() => {
            useAiStore.getState().openSidebar("decompose");
          }}
          className="text-brew-orange text-xs px-0.5 opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-opacity cursor-pointer"
          aria-label={t("decomposeAi")}
          title={t("decomposeTask")}
        >
          <LucideIcon name="zap" size={12} />
        </button>
      )}

      {/* Recurrence */}
      {!isDone && (
        <div className="relative">
          <button
            onClick={() => setRecurrenceOpen((o) => !o)}
            className={`text-xs px-0.5 transition-opacity cursor-pointer ${
              task.recurrence
                ? "text-brew-orange opacity-100"
                : "text-brew-gray opacity-0 group-hover:opacity-70 hover:!opacity-100"
            }`}
            aria-label={t("recurrence")}
            title={task.recurrence ? getRecurrenceLabel(task.recurrence) : t("addRecurrence")}
          >
            <LucideIcon name="refresh-cw" size={12} />
          </button>
          {recurrenceOpen && (
            <RecurrencePopover
              recurrence={task.recurrence}
              onSave={(r) => {
                useTaskStore.getState().setRecurrence(task.id, r);
                setRecurrenceOpen(false);
              }}
              onClose={() => setRecurrenceOpen(false)}
            />
          )}
        </div>
      )}

      {/* Delete */}
      <button
        onClick={() => deleteTask(task.id)}
        className="text-brew-gray text-sm px-1 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity cursor-pointer"
        aria-label={t("deleteTask")}
      >
        &times;
      </button>
    </div>
  );
}
