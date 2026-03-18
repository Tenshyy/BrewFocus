"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { TaskTimeStat, ProjectTimeStat } from "@/lib/stats";

interface TimeTrackingProps {
  byTask: TaskTimeStat[];
  byProject: ProjectTimeStat[];
  unlinkedCount: number;
  unlinkedMinutes: number;
}

export default function TimeTracking({
  byTask,
  byProject,
  unlinkedCount,
  unlinkedMinutes,
}: TimeTrackingProps) {
  const [view, setView] = useState<"projects" | "tasks">("projects");
  const t = useTranslations("stats");

  const maxProjectPomodoros = byProject.length > 0
    ? Math.max(...byProject.map((p) => p.pomodoroCount))
    : 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray">
          {t("timeByLabel")} {view === "projects" ? t("projects") : t("tasksLabel")}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setView("projects")}
            className={`text-[9px] uppercase tracking-[1px] px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
              view === "projects"
                ? "text-brew-orange bg-brew-bg"
                : "text-brew-gray hover:text-brew-cream"
            }`}
          >
            {t("projects")}
          </button>
          <button
            onClick={() => setView("tasks")}
            className={`text-[9px] uppercase tracking-[1px] px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
              view === "tasks"
                ? "text-brew-orange bg-brew-bg"
                : "text-brew-gray hover:text-brew-cream"
            }`}
          >
            {t("tasksLabel")}
          </button>
        </div>
      </div>

      {view === "projects" ? (
        <div className="space-y-3">
          {byProject.length === 0 ? (
            <p className="text-[11px] text-brew-gray">
              {t("timeTrackingProjectHint")}
            </p>
          ) : (
            byProject.map((project) => {
              const percent = Math.round(
                (project.pomodoroCount / maxProjectPomodoros) * 100
              );
              return (
                <div key={project.projectId}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.projectColor }}
                    />
                    <span className="text-[11px] font-bold text-brew-cream flex-1 truncate">
                      {project.projectName}
                    </span>
                    <span className="text-[12px] font-bold text-brew-orange">
                      {project.pomodoroCount}
                    </span>
                    <span className="text-[9px] text-brew-gray">pom.</span>
                  </div>
                  <div className="h-2 bg-brew-bg rounded-sm overflow-hidden mb-1">
                    <div
                      className="h-full rounded-sm transition-all duration-700"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: project.projectColor,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <div className="flex gap-3 text-[9px] text-brew-gray">
                    <span>{project.totalMinutes} min focus</span>
                    <span>{project.taskCount} {t("tasksLabel").toLowerCase()}</span>
                  </div>
                </div>
              );
            })
          )}
          {unlinkedCount > 0 && (
            <div className="text-[9px] text-brew-gray mt-2 pt-2 border-t border-brew-border">
              + {t("unlinked", { count: unlinkedCount })} ({t("unlinkedMinutes", { minutes: unlinkedMinutes })})
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {byTask.length === 0 ? (
            <p className="text-[11px] text-brew-gray">
              {t("timeTrackingTimerHint")}
            </p>
          ) : (
            byTask.slice(0, 10).map((task) => (
              <div key={task.taskId} className="flex items-center gap-2">
                {task.estimatedPomodoros && (
                  <span className="text-[9px] text-brew-orange font-bold w-[28px] text-right flex-shrink-0">
                    {task.pomodoroCount}/{task.estimatedPomodoros}
                  </span>
                )}
                <span className="text-[11px] text-brew-cream flex-1 truncate">
                  {task.taskTitle}
                </span>
                {!task.estimatedPomodoros && (
                  <span className="text-[11px] font-bold text-brew-orange">
                    {task.pomodoroCount}
                  </span>
                )}
                <span className="text-[9px] text-brew-gray flex-shrink-0">
                  ({task.totalMinutes} min)
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
