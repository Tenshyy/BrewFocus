"use client";

import { useTimerStore } from "@/stores/timerStore";
import { useHydration } from "@/hooks/useHydration";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TimerDisplay() {
  const secondsRemaining = useTimerStore((s) => s.secondsRemaining);
  const totalSeconds = useTimerStore((s) => s.totalSeconds);
  const sessionType = useTimerStore((s) => s.sessionType);
  const hydrated = useHydration();

  const fillPercent = totalSeconds > 0 ? secondsRemaining / totalSeconds : 1;
  const isAlert = fillPercent < 0.2 && sessionType === "focus";

  return (
    <div className="text-center mt-4">
      <div
        className={`text-[11px] font-bold uppercase tracking-[3px] mb-2 ${
          sessionType === "focus"
            ? "text-brew-orange"
            : "text-cat-perso"
        }`}
        style={
          sessionType === "focus" && fillPercent < 1
            ? { animation: "pulse 2s ease infinite" }
            : undefined
        }
      >
        {sessionType === "focus" ? "▪ FOCUS ▪" : "▪ PAUSE ▪"}
      </div>
      <div
        className={`text-[44px] font-bold leading-none transition-all duration-1000 ease-in-out ${
          isAlert
            ? "text-brew-orange"
            : "text-brew-cream"
        }`}
        style={{
          fontVariantNumeric: "tabular-nums",
          ...(isAlert
            ? { textShadow: "0 0 20px rgba(224,122,58,0.4)" }
            : {}),
        }}
        role="timer"
        aria-live="polite"
      >
        {hydrated ? formatTime(secondsRemaining) : "25:00"}
      </div>
    </div>
  );
}
