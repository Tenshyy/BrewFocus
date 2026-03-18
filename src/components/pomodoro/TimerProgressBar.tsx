"use client";

import { useTimerStore } from "@/stores/timerStore";

/**
 * Visual progress bar for ADHD time blindness support.
 * Shows elapsed time as a filling bar with color transition.
 * Helps users perceive time passing even without looking at numbers.
 */
export default function TimerProgressBar() {
  const secondsRemaining = useTimerStore((s) => s.secondsRemaining);
  const totalSeconds = useTimerStore((s) => s.totalSeconds);
  const sessionType = useTimerStore((s) => s.sessionType);
  const status = useTimerStore((s) => s.status);

  if (totalSeconds === 0) return null;

  const progress = 1 - secondsRemaining / totalSeconds;
  const isRunning = status === "running";
  const isFocus = sessionType === "focus";

  // Color shifts as progress increases: green → orange → red for focus
  const barColor = isFocus
    ? progress < 0.6
      ? "bg-brew-orange"
      : progress < 0.85
      ? "bg-yellow-500"
      : "bg-red-400"
    : "bg-cat-perso";

  return (
    <div className="w-full max-w-[200px] mx-auto mt-3">
      <div className="h-1.5 bg-brew-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${barColor}`}
          style={{
            width: `${Math.min(progress * 100, 100)}%`,
            ...(isRunning && progress > 0.85 && isFocus
              ? { animation: "pulse 1s ease infinite" }
              : {}),
          }}
        />
      </div>
      {/* Elapsed / Total minutes helper */}
      <div className="flex justify-between mt-1 text-[9px] text-brew-gray">
        <span>{Math.floor((totalSeconds - secondsRemaining) / 60)}m</span>
        <span>{Math.floor(totalSeconds / 60)}m</span>
      </div>
    </div>
  );
}
