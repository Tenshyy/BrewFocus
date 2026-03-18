import { useEffect, useRef } from "react";
import { useTimerStore } from "@/stores/timerStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { sendNotification } from "@/lib/notify";
import { useTranslations } from "next-intl";

export function useTimer() {
  const status = useTimerStore((s) => s.status);
  const secondsRemaining = useTimerStore((s) => s.secondsRemaining);
  const sessionType = useTimerStore((s) => s.sessionType);
  const totalSeconds = useTimerStore((s) => s.totalSeconds);
  const tick = useTimerStore((s) => s.tick);
  const switchToBreak = useTimerStore((s) => s.switchToBreak);
  const switchToFocus = useTimerStore((s) => s.switchToFocus);
  const addSession = useSessionStore((s) => s.addSession);
  const timerConfig = useSettingsStore((s) => s.timerConfig);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const t = useTranslations("notifications");

  const prevSecondsRef = useRef(secondsRemaining);

  // Interval tick
  useEffect(() => {
    if (status !== "running") return;
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [status, tick]);

  // Session completion
  useEffect(() => {
    if (prevSecondsRef.current > 0 && secondsRemaining === 0 && status === "idle") {
      // Play sound
      if (soundEnabled) {
        try {
          const audio = new Audio("/sounds/timer-end.mp3");
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch {
          // ignore audio errors
        }
      }

      // System notification
      if (notificationsEnabled) {
        sendNotification(
          "BrewFocus",
          sessionType === "focus"
            ? t("focusComplete")
            : t("breakComplete"),
          "brewfocus-timer"
        );
      }

      if (sessionType === "focus") {
        // Log completed focus session with linked task if pinned
        const activeTaskId = useTimerStore.getState().activeTaskId;
        addSession({
          startTime: new Date(
            Date.now() - totalSeconds * 1000
          ).toISOString(),
          duration: totalSeconds,
          completedAt: new Date().toISOString(),
          type: "focus",
          ...(activeTaskId ? { linkedTaskId: activeTaskId } : {}),
        });
        // Auto-switch to break
        switchToBreak(timerConfig.breakDuration);
      } else {
        // Break done, back to focus
        switchToFocus(timerConfig.focusDuration);
      }
    }
    prevSecondsRef.current = secondsRemaining;
  }, [
    secondsRemaining,
    status,
    sessionType,
    totalSeconds,
    soundEnabled,
    notificationsEnabled,
    addSession,
    switchToBreak,
    switchToFocus,
    timerConfig,
    t,
  ]);
}
