"use client";

import { useState, useMemo, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useTranslations } from "next-intl";
import Card from "@/components/ui/Card";
import TaskItem from "./TaskItem";
import TaskEmptyState from "./TaskEmptyState";
import ParkingLot from "./ParkingLot";
import ProjectFilter from "./ProjectFilter";
import EisenhowerMatrix from "./EisenhowerMatrix";
import { useTaskStore } from "@/stores/taskStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useProjectStore } from "@/stores/projectStore";
import { useHydration } from "@/hooks/useHydration";
import { autoEstimateTask } from "@/lib/ai/autoEstimate";
import LucideIcon from "@/components/ui/LucideIcon";
import ChooseForMeButton from "./ChooseForMeButton";
import { useFeatureEnabled } from "@/components/ui/FeatureGate";

export default function TaskListCard() {
  const tasks = useTaskStore((s) => s.tasks);
  const sessions = useSessionStore((s) => s.sessions);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const hydrated = useHydration();
  const [quickAddTitle, setQuickAddTitle] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "matrix">("list");
  const t = useTranslations("tasks");
  const projectsEnabled = useFeatureEnabled("projects");
  const eisenhowerEnabled = useFeatureEnabled("eisenhower");

  // Listen for command palette view mode changes
  useEffect(() => {
    function handleViewMode(e: Event) {
      const mode = (e as CustomEvent).detail;
      if (mode === "list" || mode === "matrix") setViewMode(mode);
    }
    window.addEventListener("brewfocus:setViewMode", handleViewMode);
    return () => window.removeEventListener("brewfocus:setViewMode", handleViewMode);
  }, []);

  // Reset to list view if eisenhower is disabled
  if (!eisenhowerEnabled && viewMode === "matrix") {
    setViewMode("list");
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  function handleQuickAdd() {
    if (!quickAddTitle.trim()) return;
    const id = useTaskStore.getState().addTask({
      title: quickAddTitle.trim(),
      category: "travail",
      priority: "moyenne",
      source: "manual",
      projectId: activeProjectId || undefined,
    });
    setQuickAddTitle("");
    // Fire-and-forget AI estimation
    autoEstimateTask(id);
  }

  // Precompute actual pomodoro count per task from linked sessions
  const actualPomodorosMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sessions) {
      if (s.type === "focus" && s.completedAt && s.linkedTaskId) {
        map.set(s.linkedTaskId, (map.get(s.linkedTaskId) || 0) + 1);
      }
    }
    return map;
  }, [sessions]);

  const filteredTasks = hydrated
    ? activeProjectId
      ? tasks.filter((t) => t.projectId === activeProjectId)
      : tasks
    : [];

  // Sort: status (todo first), then order, then priority fallback
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status !== b.status) return a.status === "todo" ? -1 : 1;
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    const prio = { haute: 0, moyenne: 1, basse: 2 };
    return prio[a.priority] - prio[b.priority];
  });

  const todoTasks = sortedTasks.filter((t) => t.status === "todo");
  const doneTasks = sortedTasks.filter((t) => t.status === "done");
  const doneCount = doneTasks.length;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todoTasks.findIndex((t) => t.id === active.id);
    const newIndex = todoTasks.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = [...todoTasks];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    useTaskStore.getState().reorderTasks(reordered.map((t) => t.id));
  };

  return (
    <Card animated>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[11px] font-bold uppercase tracking-[3px] text-brew-orange">
          <span aria-hidden="true">▪ </span>{t("title")}<span aria-hidden="true"> ▪</span>
        </h2>
        <div className="flex items-center gap-2">
          {hydrated && filteredTasks.length > 0 && (
            <span className="text-[11px] text-brew-gray">
              {doneCount}/{filteredTasks.length}
            </span>
          )}
          {hydrated && eisenhowerEnabled && todoTasks.length > 0 && (
            <button
              onClick={() => setViewMode((v) => (v === "list" ? "matrix" : "list"))}
              className="text-[11px] text-brew-gray hover:text-brew-cream transition-colors cursor-pointer"
              title={viewMode === "list" ? t("matrixView") : t("listView")}
            >
              <LucideIcon name={viewMode === "list" ? "grid" : "list"} size={14} />
            </button>
          )}
        </div>
      </div>

      {hydrated && projectsEnabled && <ProjectFilter />}
      {hydrated && todoTasks.length >= 2 && <ChooseForMeButton />}

      {!hydrated || sortedTasks.length === 0 ? (
        <TaskEmptyState />
      ) : viewMode === "matrix" ? (
        <div className="max-h-[400px] overflow-y-auto pr-1">
          <EisenhowerMatrix tasks={todoTasks} />
          {/* Done tasks below matrix */}
          {doneTasks.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {doneTasks.map((task, i) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={i}
                  actualPomodoros={actualPomodorosMap.get(task.id) || 0}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
          {/* Draggable todo tasks */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={todoTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {todoTasks.map((task, i) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={i}
                  actualPomodoros={actualPomodorosMap.get(task.id) || 0}
                  draggable
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Done tasks (not draggable) */}
          {doneTasks.map((task, i) => (
            <TaskItem
              key={task.id}
              task={task}
              index={todoTasks.length + i}
              actualPomodoros={actualPomodorosMap.get(task.id) || 0}
            />
          ))}
        </div>
      )}

      {/* Quick add */}
      {hydrated && (
        <div className="mt-2">
          <input
            value={quickAddTitle}
            onChange={(e) => setQuickAddTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleQuickAdd();
            }}
            placeholder={t("addPlaceholder")}
            data-task-input
            className="w-full bg-transparent border-b border-brew-border text-[11px] text-brew-cream placeholder:text-brew-gray/40 outline-none focus:border-brew-orange/50 font-mono py-1.5 px-1"
          />
        </div>
      )}

      <ParkingLot />
    </Card>
  );
}
