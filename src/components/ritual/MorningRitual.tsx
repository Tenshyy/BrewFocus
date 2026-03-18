"use client";

import { useTaskStore } from "@/stores/taskStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useRitualStore } from "@/stores/ritualStore";
import { useAiStore } from "@/stores/aiStore";
import { useTranslations } from "next-intl";
import LucideIcon from "@/components/ui/LucideIcon";
import {
  computeStreak,
  computeYesterdayPomodoros,
  getUpcomingDeadlines,
} from "@/lib/stats";

export default function MorningRitual() {
  const tasks = useTaskStore((s) => s.tasks);
  const sessions = useSessionStore((s) => s.sessions);
  const dismissRitual = useRitualStore((s) => s.dismissRitual);
  const openSidebar = useAiStore((s) => s.openSidebar);
  const t = useTranslations("ritual");

  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const streak = computeStreak(sessions);
  const yesterdayPomodoros = computeYesterdayPomodoros(sessions);
  const upcoming = getUpcomingDeadlines(tasks, 48);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("morning") : hour < 18 ? t("afternoon") : t("evening");

  function handleStart() {
    dismissRitual();
  }

  function handlePlan() {
    dismissRitual();
    openSidebar("planner");
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{
        backgroundColor: "rgba(13, 11, 9, 0.95)",
        animation: "fadeIn 0.4s ease",
      }}
    >
      <div
        className="bg-brew-panel border border-brew-border rounded-xl p-8 max-w-[400px] w-[90vw] text-center"
        style={{
          animation: "slideIn 0.5s ease",
          boxShadow: "0 0 60px rgba(224, 122, 58, 0.1)",
        }}
      >
        {/* Greeting */}
        <p className="mb-2"><LucideIcon name={hour < 12 ? "coffee" : "moon"} size={32} className="mx-auto text-brew-orange" /></p>
        <h2 className="text-xl font-bold text-brew-orange mb-4">
          {greeting}
        </h2>

        {/* Streak */}
        {streak > 0 && (
          <p className="text-[13px] text-brew-cream mb-4">
            {t("streak", { count: streak })}
          </p>
        )}

        {/* Summary */}
        <div className="space-y-2 mb-6 text-[12px] text-brew-gray">
          {todoCount > 0 && (
            <p>{t("tasksPending", { count: todoCount })}</p>
          )}
          {yesterdayPomodoros > 0 && (
            <p>{t("yesterdayPomodoros", { count: yesterdayPomodoros })}</p>
          )}
          {upcoming.length > 0 && (
            <p className="text-brew-orange">
              {t("deadlinesNear", { count: upcoming.length })}
            </p>
          )}
          {todoCount === 0 && yesterdayPomodoros === 0 && (
            <p>{t("newDay")}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleStart}
            className="bg-brew-orange text-[#0D0B09] font-bold text-[13px] uppercase tracking-[2px] px-6 py-3 rounded-lg hover:brightness-110 transition-all cursor-pointer"
          >
            {t("startDay")}
          </button>
          <button
            onClick={handlePlan}
            className="text-[12px] text-brew-gray hover:text-brew-orange transition-colors cursor-pointer py-2"
          >
            {t("planWithAi")}
          </button>
        </div>
      </div>
    </div>
  );
}
