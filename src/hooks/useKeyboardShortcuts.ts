import { useEffect } from "react";
import { useTimerStore } from "@/stores/timerStore";
import { useSettingsStore } from "@/stores/settingsStore";

export function useKeyboardShortcuts() {
  const status = useTimerStore((s) => s.status);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const reset = useTimerStore((s) => s.reset);
  const focusDuration = useSettingsStore((s) => s.timerConfig.focusDuration);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.code === "Space") {
        e.preventDefault();
        if (status === "running") {
          pause();
        } else {
          start();
        }
      }

      if (e.key === "r" || e.key === "R") {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          reset(focusDuration);
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [status, start, pause, reset, focusDuration]);
}
