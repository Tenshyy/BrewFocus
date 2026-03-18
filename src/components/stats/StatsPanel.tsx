"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
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
import Card from "@/components/ui/Card";
import StatNumber from "./StatNumber";
import WeeklyChart from "./WeeklyChart";
import CategoryBreakdown from "./CategoryBreakdown";
import PersonalBests from "./PersonalBests";
import HeatmapCalendar from "./HeatmapCalendar";
import TimeTracking from "./TimeTracking";
import ExportReport from "./ExportReport";
import DraggableWidget from "./DraggableWidget";
import { useSessionStore } from "@/stores/sessionStore";
import { useTaskStore } from "@/stores/taskStore";
import { useProjectStore } from "@/stores/projectStore";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useHydration } from "@/hooks/useHydration";
import {
  computeStreak,
  computeWeeklyChart,
  computeTotalFocus,
  computePersonalBests,
  computeTaskStats,
  computeHeatmap,
  computeTimeTracking,
  computeEstimationAccuracy,
} from "@/lib/stats";
import LucideIcon from "@/components/ui/LucideIcon";

export default function StatsPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const t = useTranslations("stats");
  const hydrated = useHydration();

  // Listen for command palette toggle
  useEffect(() => {
    function handleToggle() {
      setCollapsed((c) => !c);
    }
    window.addEventListener("brewfocus:toggleStats", handleToggle);
    return () => window.removeEventListener("brewfocus:toggleStats", handleToggle);
  }, []);

  const sessions = useSessionStore((s) => s.sessions);
  const tasks = useTaskStore((s) => s.tasks);
  const projects = useProjectStore((s) => s.projects);
  const widgets = useDashboardStore((s) => s.widgets);
  const editMode = useDashboardStore((s) => s.editMode);
  const setEditMode = useDashboardStore((s) => s.setEditMode);
  const setWidgetOrder = useDashboardStore((s) => s.setWidgetOrder);
  const resetToDefault = useDashboardStore((s) => s.resetToDefault);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;

      const reordered = [...widgets];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);
      setWidgetOrder(reordered);
    },
    [widgets, setWidgetOrder]
  );

  if (!hydrated) return null;

  const streak = computeStreak(sessions);
  const weekly = computeWeeklyChart(sessions);
  const { totalSessions, totalHours } = computeTotalFocus(sessions);
  const { rate, categories } = computeTaskStats(tasks);
  const bests = computePersonalBests(sessions, tasks);
  const heatmap = computeHeatmap(sessions);
  const timeTracking = computeTimeTracking(sessions, tasks, projects);
  const estimationAccuracy = computeEstimationAccuracy(tasks, sessions);

  const hasData = sessions.length > 0 || tasks.length > 0;
  const hasLinkedSessions = timeTracking.byTask.length > 0;

  // Widget registry: id → JSX (or null if not applicable)
  const widgetRegistry: Record<string, React.ReactNode> = {
    "stat-numbers": (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-brew-border">
        <StatNumber
          icon={<LucideIcon name="flame" size={20} />}
          value={streak}
          unit={streak === 1 ? t("day") : t("days")}
          subtitle={t("streak")}
        />
        <StatNumber
          icon={<LucideIcon name="coffee" size={20} />}
          value={totalSessions}
          unit={totalSessions === 1 ? t("pomodoro") : t("pomodoros")}
          subtitle="total"
        />
        <StatNumber
          icon={<LucideIcon name="clock" size={20} />}
          value={`${totalHours}h`}
          unit={t("focus")}
          subtitle="total"
        />
        <StatNumber
          icon={<LucideIcon name="check-circle" size={20} />}
          value={`${rate}%`}
          unit={t("tasks")}
          subtitle={t("completion")}
        />
      </div>
    ),
    "estimation-accuracy": estimationAccuracy ? (
      <div className="px-3 py-2 bg-brew-orange/10 border border-brew-orange/20 rounded-md text-center">
        <p className="text-[11px] text-brew-cream">
          <LucideIcon name="target" size={12} className="inline-block mr-1" />{estimationAccuracy.message}
        </p>
        <p className="text-[9px] text-brew-gray mt-0.5">
          {t("calibration", { count: estimationAccuracy.sampleSize })}
        </p>
      </div>
    ) : null,
    "weekly-chart": <WeeklyChart data={weekly} />,
    "category-breakdown": <CategoryBreakdown categories={categories} />,
    "personal-bests": <PersonalBests bests={bests} />,
    "heatmap-calendar": sessions.length > 7 ? (
      <div className="pt-5 border-t border-brew-border">
        <HeatmapCalendar data={heatmap} />
      </div>
    ) : null,
    "time-tracking": hasLinkedSessions ? (
      <div className="pt-5 border-t border-brew-border">
        <TimeTracking
          byTask={timeTracking.byTask}
          byProject={timeTracking.byProject}
          unlinkedCount={timeTracking.unlinkedCount}
          unlinkedMinutes={timeTracking.unlinkedMinutes}
        />
      </div>
    ) : null,
    "export-report": (
      <div className="pt-5 border-t border-brew-border">
        <ExportReport />
      </div>
    ),
  };

  return (
    <div id="stats-panel" className="max-w-[860px] mx-auto px-4 mt-4">
      <Card>
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[11px] font-bold uppercase tracking-[3px] text-brew-orange">
            <span aria-hidden="true">{"\u25AA"} </span>{t("title")}<span aria-hidden="true"> {"\u25AA"}</span>
          </h2>
          <div className="flex items-center gap-2">
            {!collapsed && hasData && (
              <button
                onClick={() => {
                  if (editMode) {
                    setEditMode(false);
                  } else {
                    setEditMode(true);
                  }
                }}
                className="text-[10px] text-brew-gray hover:text-brew-cream transition-colors cursor-pointer uppercase tracking-[1px]"
              >
                {editMode ? `\u2713 ${t("doneCustomize")}` : `\u270E ${t("customize")}`}
              </button>
            )}
            {!collapsed && editMode && (
              <button
                onClick={resetToDefault}
                className="text-[10px] text-brew-gray hover:text-brew-orange transition-colors cursor-pointer uppercase tracking-[1px]"
              >
                {"\u21BB"} {t("resetDefault")}
              </button>
            )}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="text-[10px] text-brew-gray hover:text-brew-cream transition-colors cursor-pointer uppercase tracking-[1px]"
            >
              {collapsed ? `\u25B8 ${t("expand")}` : `\u25BE ${t("collapse")}`}
            </button>
          </div>
        </div>

        {!collapsed && (
          <div style={{ animation: "slideIn 0.3s ease" }}>
            {!hasData ? (
              <p className="text-[12px] text-brew-gray text-center py-6">
                {t("empty")}
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={widgets.map((w) => w.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4 mt-4">
                    {widgets.map((w) => {
                      const content = widgetRegistry[w.id];
                      // In normal mode, skip hidden widgets and widgets with no content
                      if (!editMode && (!w.enabled || content === null)) return null;
                      // In edit mode, show all widgets but dim disabled ones
                      if (editMode && content === null) {
                        // Widget has no data to show — still show placeholder in edit mode
                        return (
                          <DraggableWidget key={w.id} id={w.id}>
                            <div className="px-3 py-2 border border-dashed border-brew-border rounded text-center">
                              <p className="text-[10px] text-brew-gray/50">
                                {t(`widget${w.id.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("")}`)}
                              </p>
                            </div>
                          </DraggableWidget>
                        );
                      }
                      return (
                        <DraggableWidget key={w.id} id={w.id}>
                          {content}
                        </DraggableWidget>
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
