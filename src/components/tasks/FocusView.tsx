"use client";

import { useTranslations } from "next-intl";
import { useTaskStore } from "@/stores/taskStore";
import { useHydration } from "@/hooks/useHydration";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { Task } from "@/types/task";
import LucideIcon from "@/components/ui/LucideIcon";

const PRIORITY_ORDER: Record<string, number> = { haute: 0, moyenne: 1, basse: 2 };

function getTopTasks(tasks: Task[], max: number): Task[] {
  return tasks
    .filter((t) => t.status === "todo" && !t.parentId)
    .sort((a, b) => {
      // Urgent tasks first
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      // Then by priority
      const pa = PRIORITY_ORDER[a.priority] ?? 1;
      const pb = PRIORITY_ORDER[b.priority] ?? 1;
      if (pa !== pb) return pa - pb;
      // Then by deadline proximity
      if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      // Then by order
      return (a.order ?? 0) - (b.order ?? 0);
    })
    .slice(0, max);
}

export default function FocusView() {
  const t = useTranslations("focusView");
  const hydrated = useHydration();
  const tasks = useTaskStore((s) => s.tasks);
  const toggleTask = useTaskStore((s) => s.toggleTask);

  if (!hydrated) return null;

  const focusTasks = getTopTasks(tasks, 3);

  return (
    <div className="max-w-[860px] mx-auto px-4 mb-4">
      <div className="bg-brew-panel/60 border border-brew-border rounded-xl p-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[2px] text-brew-orange mb-3">
          <LucideIcon name="target" size={12} className="inline-block mr-1" />{t("title")}
        </h2>

        {focusTasks.length === 0 ? (
          <p className="text-xs text-brew-gray/50 text-center py-4">{t("empty")}</p>
        ) : (
          <div className="space-y-2">
            {focusTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-brew-bg/50 hover:bg-brew-orange/5 transition-colors cursor-pointer group"
              >
                {/* Checkbox */}
                <div
                  className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    task.status === "done"
                      ? "bg-brew-orange border-brew-orange"
                      : "border-brew-border group-hover:border-brew-orange/50"
                  }`}
                >
                  {task.status === "done" && (
                    <LucideIcon name="check" size={12} className="text-brew-bg" />
                  )}
                </div>

                {/* Category dot */}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[task.category] }}
                />

                {/* Title */}
                <span
                  className={`flex-1 text-left text-sm truncate ${
                    task.status === "done"
                      ? "text-brew-gray/40 line-through"
                      : "text-brew-cream"
                  }`}
                >
                  {task.title}
                </span>

                {/* Pomodoro estimate */}
                {task.estimatedPomodoros && task.estimatedPomodoros > 0 && (
                  <span className="text-[10px] text-brew-gray flex-shrink-0">
                    {task.estimatedPomodoros}p.
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
