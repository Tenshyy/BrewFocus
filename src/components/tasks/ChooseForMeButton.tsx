"use client";

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useTaskStore } from "@/stores/taskStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useTimerStore } from "@/stores/timerStore";
import { useAiAction } from "@/hooks/useAiAction";
import { computeStreak } from "@/lib/stats";
import LucideIcon from "@/components/ui/LucideIcon";

/**
 * ADHD anti-paralysis button: uses AI to pick the best task to work on NOW.
 * Reduces decision fatigue by making the choice for the user.
 */
export default function ChooseForMeButton() {
  const t = useTranslations("chooseForMe");
  const locale = useLocale();
  const { callAi } = useAiAction();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    chosenTaskId: string;
    chosenTaskTitle: string;
    reason: string;
    tip?: string;
  } | null>(null);

  const tasks = useTaskStore((s) => s.tasks);
  const todoTasks = tasks.filter((t) => t.status === "todo");

  const handleChoose = useCallback(async () => {
    if (todoTasks.length === 0) return;

    setIsLoading(true);
    setResult(null);

    // Build context with all todo tasks
    const sessions = useSessionStore.getState().sessions;
    const streak = computeStreak(sessions);
    const hour = new Date().getHours();

    const isFr = locale === "fr";
    let context = isFr
      ? `Heure actuelle: ${hour}h\nStreak: ${streak} jours\n\nTaches en attente (${todoTasks.length}):\n`
      : `Current time: ${hour}h\nStreak: ${streak} days\n\nPending tasks (${todoTasks.length}):\n`;
    todoTasks.forEach((task) => {
      context += `- [${task.id}] "${task.title}" (${isFr ? "categorie" : "category"}: ${task.category}, ${isFr ? "priorite" : "priority"}: ${task.priority}`;
      if (task.deadline) context += `, deadline: ${task.deadline}`;
      if (task.estimatedPomodoros) context += `, ${isFr ? "estimation" : "estimate"}: ${task.estimatedPomodoros}p`;
      context += `, ${isFr ? "cree" : "created"}: ${task.createdAt.split("T")[0]})\n`;
    });

    const data = await callAi<{
      chosenTaskId: string;
      chosenTaskTitle: string;
      reason: string;
      tip?: string;
    }>({
      mode: "chooseForMe",
      content: isFr ? "Choisis la meilleure tache a faire maintenant." : "Choose the best task to work on right now.",
      context,
    });

    setIsLoading(false);

    if (data) {
      setResult(data);
    }
  }, [todoTasks, callAi, locale]);

  const handlePin = useCallback(() => {
    if (!result) return;

    // Find the actual task by ID or title match
    const tasks = useTaskStore.getState().tasks;
    const match =
      tasks.find((t) => t.id === result.chosenTaskId) ||
      tasks.find((t) => t.title === result.chosenTaskTitle && t.status === "todo");

    if (match) {
      useTimerStore.getState().setActiveTask(match.id);
    }
    setResult(null);
  }, [result]);

  if (todoTasks.length < 2) return null;

  return (
    <div>
      {/* Trigger button */}
      {!result && (
        <button
          onClick={handleChoose}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-[10px] text-brew-orange hover:text-brew-cream transition-colors cursor-pointer disabled:opacity-50"
        >
          <LucideIcon name="zap" size={12} />
          {isLoading ? t("choosing") : t("chooseForMe")}
        </button>
      )}

      {/* Result card */}
      {result && (
        <div
          className="bg-brew-orange/10 border border-brew-orange/30 rounded-lg p-3 mt-2"
          style={{ animation: "slideIn 0.3s ease" }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <LucideIcon name="zap" size={12} className="text-brew-orange" />
            <span className="text-[10px] font-bold uppercase tracking-[1px] text-brew-orange">
              {t("suggestion")}
            </span>
          </div>
          <p className="text-[12px] font-bold text-brew-cream mb-1">
            {result.chosenTaskTitle}
          </p>
          <p className="text-[10px] text-brew-cream/70 mb-2 leading-relaxed">
            {result.reason}
          </p>
          {result.tip && (
            <p className="text-[9px] text-brew-gray italic mb-2">
              {result.tip}
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePin}
              className="text-[10px] font-bold text-brew-espresso bg-brew-orange px-3 py-1 rounded hover:brightness-110 transition-all cursor-pointer"
            >
              {t("startThis")}
            </button>
            <button
              onClick={() => setResult(null)}
              className="text-[10px] text-brew-gray hover:text-brew-cream transition-colors cursor-pointer"
            >
              {t("dismiss")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
