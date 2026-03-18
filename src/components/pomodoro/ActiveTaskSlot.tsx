"use client";

import { useState, useRef, useEffect } from "react";
import { useTimerStore } from "@/stores/timerStore";
import { useTaskStore } from "@/stores/taskStore";
import { useTranslations } from "next-intl";
import CategoryBadge from "@/components/tasks/CategoryBadge";

export default function ActiveTaskSlot() {
  const activeTaskId = useTimerStore((s) => s.activeTaskId);
  const setActiveTask = useTimerStore((s) => s.setActiveTask);
  const tasks = useTaskStore((s) => s.tasks);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("tasks");

  const activeTask = activeTaskId
    ? tasks.find((tk) => tk.id === activeTaskId)
    : null;

  // If the pinned task was deleted, unpin
  useEffect(() => {
    if (activeTaskId && !activeTask) {
      setActiveTask(null);
    }
  }, [activeTaskId, activeTask, setActiveTask]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const todoTasks = tasks.filter((tk) => tk.status === "todo");

  if (activeTask) {
    return (
      <div className="flex items-center gap-2 bg-brew-bg border border-brew-border rounded-md px-2.5 py-1.5 mt-2 max-w-[260px]">
        <CategoryBadge category={activeTask.category} />
        <span className="text-[11px] text-brew-cream truncate flex-1">
          {activeTask.title}
        </span>
        <button
          onClick={() => setActiveTask(null)}
          className="text-brew-gray text-xs hover:text-brew-cream transition-colors cursor-pointer flex-shrink-0"
          aria-label={t("detach")}
        >
          &times;
        </button>
      </div>
    );
  }

  return (
    <div className="relative mt-2" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="text-[11px] text-brew-gray hover:text-brew-orange transition-colors cursor-pointer"
      >
        {t("pinTask")}
      </button>

      {dropdownOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[240px] bg-brew-panel border border-brew-border rounded-lg shadow-lg z-40 max-h-[200px] overflow-y-auto">
          {todoTasks.length === 0 ? (
            <p className="text-[11px] text-brew-gray p-3 text-center">
              {t("noTasks")}
            </p>
          ) : (
            todoTasks.map((tk) => (
              <button
                key={tk.id}
                onClick={() => {
                  setActiveTask(tk.id);
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-brew-bg transition-colors text-left cursor-pointer"
              >
                <CategoryBadge category={tk.category} />
                <span className="text-[11px] text-brew-cream truncate">
                  {tk.title}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
