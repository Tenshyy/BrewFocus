"use client";

import { useTimerStore } from "@/stores/timerStore";

export default function SteamParticles() {
  const status = useTimerStore((s) => s.status);
  const secondsRemaining = useTimerStore((s) => s.secondsRemaining);
  const totalSeconds = useTimerStore((s) => s.totalSeconds);
  const sessionType = useTimerStore((s) => s.sessionType);

  const fillPercent = totalSeconds > 0 ? secondsRemaining / totalSeconds : 1;
  const visible = status === "running" && fillPercent > 0.3 && sessionType === "focus";

  if (!visible) return null;

  return (
    <div className="flex justify-center gap-3 h-9 mb-1">
      {[0, 0.8, 1.6].map((delay, i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-brew-cream"
          style={{
            animation: `steamRise 2.5s ease-out infinite`,
            animationDelay: `${delay}s`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
