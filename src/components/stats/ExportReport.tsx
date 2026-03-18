"use client";

import { useState, useMemo } from "react";
import { useSessionStore } from "@/stores/sessionStore";
import { useTaskStore } from "@/stores/taskStore";
import { useProjectStore } from "@/stores/projectStore";
import { useToastStore } from "@/stores/toastStore";
import { useHydration } from "@/hooks/useHydration";
import { useTranslations } from "next-intl";
import {
  computeReport,
  generateMarkdownReport,
  todayKey,
} from "@/lib/stats";
import type { ReportPeriod, ReportLabels } from "@/lib/stats";

export default function ExportReport() {
  const [period, setPeriod] = useState<ReportPeriod>("week");
  const sessions = useSessionStore((s) => s.sessions);
  const tasks = useTaskStore((s) => s.tasks);
  const projects = useProjectStore((s) => s.projects);
  const addToast = useToastStore((s) => s.addToast);
  const hydrated = useHydration();
  const t = useTranslations("stats");

  const labels: ReportLabels = useMemo(() => ({
    week: t("week"),
    month: t("month"),
    reportTitle: t("reportTitle"),
    from: t("reportFrom"),
    to: t("reportTo"),
    summary: t("reportSummary"),
    metric: t("reportMetric"),
    value: t("reportValue"),
    pomodorosCompleted: t("reportPomodorosCompleted"),
    focusHours: t("reportFocusHours"),
    tasksCompleted: t("reportTasksCompleted"),
    activeDays: t("reportActiveDays"),
    bestDay: t("reportBestDay"),
    byProject: t("reportByProject"),
    byCategory: t("reportByCategory"),
    tasksUnit: t("reportTasksUnit"),
    generatedBy: t("reportGeneratedBy"),
  }), [t]);

  const markdown = useMemo(() => {
    if (!hydrated) return "";
    const data = computeReport(sessions, tasks, projects, period);
    return generateMarkdownReport(data, labels);
  }, [sessions, tasks, projects, period, hydrated, labels]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown);
      addToast(t("copied"), "\u{1F4CB}");
    } catch {
      addToast(t("copyError"), "\u274C");
    }
  }

  function handleDownload() {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brewfocus-rapport-${period}-${todayKey()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(t("downloaded"), "\u{1F4E5}");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray">
          {t("exportReport")}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setPeriod("week")}
            className={`text-[9px] uppercase tracking-[1px] px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
              period === "week"
                ? "text-brew-orange bg-brew-bg"
                : "text-brew-gray hover:text-brew-cream"
            }`}
          >
            {t("week")}
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`text-[9px] uppercase tracking-[1px] px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
              period === "month"
                ? "text-brew-orange bg-brew-bg"
                : "text-brew-gray hover:text-brew-cream"
            }`}
          >
            {t("month")}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-brew-bg rounded-md p-3 max-h-[200px] overflow-y-auto mb-3 border border-brew-border">
        <pre className="text-[10px] text-brew-cream whitespace-pre-wrap font-mono leading-relaxed">
          {markdown || t("noData")}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="bg-brew-orange text-[#0D0B09] font-bold text-[10px] uppercase tracking-[1px] px-4 py-1.5 rounded-md hover:brightness-110 transition-all cursor-pointer"
        >
          {t("copy")}
        </button>
        <button
          onClick={handleDownload}
          className="bg-brew-bg border border-brew-border text-brew-cream text-[10px] uppercase tracking-[1px] px-4 py-1.5 rounded-md hover:border-brew-gray transition-all cursor-pointer"
        >
          {t("downloadMd")}
        </button>
      </div>
    </div>
  );
}
