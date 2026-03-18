"use client";

import { useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable,
  useDraggable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useTranslations } from "next-intl";
import type { Task } from "@/types/task";
import { classifyTask, reclassifyFromQuadrant, type Quadrant } from "@/lib/eisenhower";
import { useTaskStore } from "@/stores/taskStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useMemo, useState } from "react";
import CategoryBadge from "./CategoryBadge";
import { PRIORITY_COLORS } from "@/lib/constants";
import LucideIcon from "@/components/ui/LucideIcon";

interface EisenhowerMatrixProps {
  tasks: Task[];
}

const QUADRANTS: { id: Quadrant; labelKey: string; color: string }[] = [
  { id: "do", labelKey: "quadrantDo", color: "#e05a33" },
  { id: "schedule", labelKey: "quadrantSchedule", color: "#5B8EC9" },
  { id: "delegate", labelKey: "quadrantDelegate", color: "#E07A3A" },
  { id: "eliminate", labelKey: "quadrantEliminate", color: "#8A8078" },
];

function QuadrantDrop({
  id,
  label,
  color,
  tasks,
  actualPomodorosMap,
}: {
  id: Quadrant;
  label: string;
  color: string;
  tasks: Task[];
  actualPomodorosMap: Map<string, number>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-1 p-2 rounded-lg border transition-colors min-h-[80px] ${
        isOver ? "bg-brew-orange/10 border-brew-orange/30" : "bg-brew-bg/50 border-brew-border"
      }`}
    >
      <span
        className="text-[9px] font-bold uppercase tracking-[2px] mb-1"
        style={{ color }}
      >
        {label}
      </span>
      {tasks.map((task) => (
        <CompactTaskItem
          key={task.id}
          task={task}
          actualPomodoros={actualPomodorosMap.get(task.id) || 0}
        />
      ))}
      {tasks.length === 0 && (
        <span className="text-[9px] text-brew-gray/40 italic">—</span>
      )}
    </div>
  );
}

function CompactTaskItem({
  task,
  actualPomodoros,
}: {
  task: Task;
  actualPomodoros: number;
}) {
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const isDone = task.status === "done";
  const t = useTranslations("tasks");

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        borderLeftColor: PRIORITY_COLORS[task.priority] || undefined,
        borderLeftWidth: 2,
      }
    : {
        borderLeftColor: PRIORITY_COLORS[task.priority] || undefined,
        borderLeftWidth: 2,
      };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-1.5 bg-brew-panel border border-brew-border rounded px-1.5 py-1 cursor-grab active:cursor-grabbing touch-none ${
        isDragging ? "opacity-30" : ""
      }`}
      style={style}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleTask(task.id);
        }}
        className={`w-3 h-3 flex-shrink-0 border rounded-sm flex items-center justify-center transition-all cursor-pointer ${
          isDone
            ? "bg-brew-orange border-brew-orange"
            : "border-brew-border hover:border-brew-gray"
        }`}
        aria-label={isDone ? t("markUndone") : t("markDone")}
      >
        {isDone && <LucideIcon name="check" size={8} className="text-[#0D0B09]" />}
      </button>

      <CategoryBadge category={task.category} />

      <span
        className={`flex-1 text-[10px] truncate ${
          isDone ? "line-through text-brew-gray" : "text-brew-cream"
        }`}
      >
        {task.title}
      </span>

      {task.estimatedPomodoros && (
        <span className="text-[8px] text-brew-orange flex-shrink-0">
          {actualPomodoros > 0
            ? `${actualPomodoros}/${task.estimatedPomodoros}`
            : task.estimatedPomodoros}
          p.
        </span>
      )}
    </div>
  );
}

export default function EisenhowerMatrix({ tasks }: EisenhowerMatrixProps) {
  const t = useTranslations("tasks");
  const updateTask = useTaskStore((s) => s.updateTask);
  const sessions = useSessionStore((s) => s.sessions);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const actualPomodorosMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sessions) {
      if (s.type === "focus" && s.completedAt && s.linkedTaskId) {
        map.set(s.linkedTaskId, (map.get(s.linkedTaskId) || 0) + 1);
      }
    }
    return map;
  }, [sessions]);

  const classified = useMemo(() => {
    const result: Record<Quadrant, Task[]> = {
      do: [],
      schedule: [],
      delegate: [],
      eliminate: [],
    };
    for (const task of tasks) {
      result[classifyTask(task)].push(task);
    }
    return result;
  }, [tasks]);

  const handleDragStart = useCallback((event: { active: { id: string | number } }) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const taskId = String(active.id);
      const targetQuadrant = String(over.id) as Quadrant;

      // Only update if dropped in a different quadrant
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      const currentQuadrant = classifyTask(task);
      if (currentQuadrant === targetQuadrant) return;

      const updates = reclassifyFromQuadrant(targetQuadrant);
      updateTask(taskId, updates);
    },
    [tasks, updateTask]
  );

  const activeTask = useMemo(
    () => (activeId ? tasks.find((t) => t.id === activeId) : null),
    [tasks, activeId]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-2 gap-1.5">
        {QUADRANTS.map((q) => (
          <QuadrantDrop
            key={q.id}
            id={q.id}
            label={t(q.labelKey)}
            color={q.color}
            tasks={classified[q.id]}
            actualPomodorosMap={actualPomodorosMap}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="bg-brew-panel border border-brew-orange/40 rounded px-2 py-1 text-[10px] text-brew-cream shadow-lg">
            {activeTask.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
