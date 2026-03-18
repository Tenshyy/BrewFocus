"use client";

import { useSessionStore } from "@/stores/sessionStore";
import { useHydration } from "@/hooks/useHydration";

export default function MiniCups() {
  const getTodayCount = useSessionStore((s) => s.getTodayCount);
  const hydrated = useHydration();

  const count = hydrated ? getTodayCount() : 0;

  if (count === 0) {
    return (
      <p className="text-center text-brew-gray text-[11px] mt-4">
        Aucun pomodoro complete
      </p>
    );
  }

  const displayed = Math.min(count, 8);
  const overflow = count > 8 ? count - 8 : 0;

  return (
    <div className="flex justify-center items-center gap-1 mt-4">
      {Array.from({ length: displayed }).map((_, i) => (
        <svg
          key={i}
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          className="opacity-80"
        >
          {/* Mini cup body */}
          <rect x="4" y="4" width="8" height="8" rx="1" fill="#6B4423" stroke="#F0EBE5" strokeWidth="1" />
          {/* Handle */}
          <path d="M12 6h2v4h-2" stroke="#F0EBE5" strokeWidth="1" fill="none" />
          {/* Saucer */}
          <rect x="2" y="13" width="12" height="2" rx="1" fill="#B8A48E" />
        </svg>
      ))}
      {overflow > 0 && (
        <span className="text-brew-gray text-[10px] ml-1">+{overflow}</span>
      )}
    </div>
  );
}
