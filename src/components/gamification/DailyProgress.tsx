"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSessionStore } from "@/stores/sessionStore";
import { useGamificationStore } from "@/stores/gamificationStore";
import { computeStreak } from "@/lib/stats";
import { useHydration } from "@/hooks/useHydration";
import CelebrationOverlay from "./CelebrationOverlay";
import LucideIcon from "@/components/ui/LucideIcon";

export default function DailyProgress() {
  const t = useTranslations("gamification");
  const hydrated = useHydration();
  const getTodayCount = useSessionStore((s) => s.getTodayCount);
  const sessions = useSessionStore((s) => s.sessions);
  const { dailyGoal, showCelebrations, lastCelebratedDate, setLastCelebratedDate } =
    useGamificationStore();

  const [showCelebration, setShowCelebration] = useState(false);

  const todayCount = hydrated ? getTodayCount() : 0;
  const streak = hydrated ? computeStreak(sessions) : 0;
  const progress = Math.min(1, todayCount / Math.max(1, dailyGoal));
  const goalReached = todayCount >= dailyGoal;

  // Trigger celebration when goal is reached for the first time today
  if (hydrated && goalReached && showCelebrations) {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    if (lastCelebratedDate !== todayStr) {
      setLastCelebratedDate(todayStr);
      setShowCelebration(true);
    }
  }

  if (!hydrated) return null;

  return (
    <>
      <div className="max-w-[860px] mx-auto px-4 mb-4">
        <div className="bg-brew-panel/60 border border-brew-border rounded-lg px-4 py-2.5 flex items-center gap-4">
          {/* Progress bar */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-[1px] text-brew-cream/80">
                {t("pomodorosToday", { count: todayCount, goal: dailyGoal })}
              </span>
              {goalReached && (
                <span className="text-[10px] font-bold text-brew-orange animate-pulse flex items-center gap-1">
                  <LucideIcon name="sparkles" size={10} /> {t("goalReached")}
                </span>
              )}
            </div>
            <div className="h-2 bg-brew-bg rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  goalReached ? "bg-brew-orange shadow-[0_0_8px_rgba(224,122,58,0.5)]" : "bg-brew-orange/70"
                }`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          {/* Streak badge */}
          {streak > 0 && (
            <div className="flex items-center gap-1 text-brew-orange flex-shrink-0">
              <LucideIcon name="flame" size={16} />
              <span className="text-xs font-bold">{streak}</span>
              <span className="text-[10px] text-brew-gray">{t("streak", { count: streak })}</span>
            </div>
          )}
        </div>
      </div>

      {showCelebration && (
        <CelebrationOverlay onDone={() => setShowCelebration(false)} />
      )}
    </>
  );
}
