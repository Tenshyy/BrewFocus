"use client";

import { useState, useEffect, useCallback } from "react";
import { useTimerStore } from "@/stores/timerStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import LucideIcon from "@/components/ui/LucideIcon";

const BREAK_SUGGESTIONS_KEYS = [
  "breakStretch",
  "breakWater",
  "breakBreathe",
  "breakWalk",
  "breakEyes",
] as const;

const BREAK_ICONS = ["activity", "droplet", "wind", "footprints", "eye"] as const;

/**
 * Brief transition overlay after completing a focus pomodoro.
 * Celebrates the accomplishment and suggests a break activity.
 * Key ADHD feature: provides dopamine reward + smooth transition guidance.
 */
export default function PostPomodoroTransition() {
  const [visible, setVisible] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const t = useTranslations("transition");

  const dismiss = useCallback(() => setVisible(false), []);

  // Listen for focus session completion
  useEffect(() => {
    let prevSessionType = useTimerStore.getState().sessionType;
    let prevStatus = useTimerStore.getState().status;

    const unsub = useTimerStore.subscribe((state) => {
      // Detect: was focus + running/paused, now switched to break
      if (
        prevSessionType === "focus" &&
        state.sessionType === "break" &&
        prevStatus !== "idle"
      ) {
        const count = useSessionStore.getState().getTodayCount();
        setPomodoroCount(count);
        setSuggestionIndex(Math.floor(Math.random() * BREAK_SUGGESTIONS_KEYS.length));
        setVisible(true);
      }
      prevSessionType = state.sessionType;
      prevStatus = state.status;
    });

    return unsub;
  }, []);

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(dismiss, 6000);
    return () => clearTimeout(timer);
  }, [visible, dismiss]);

  const suggestionKey = BREAK_SUGGESTIONS_KEYS[suggestionIndex];
  const iconName = BREAK_ICONS[suggestionIndex];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center cursor-pointer"
          style={{ backgroundColor: "rgba(13, 11, 9, 0.85)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={dismiss}
        >
          <motion.div
            className="bg-brew-panel border border-brew-orange/30 rounded-xl p-6 max-w-[320px] w-[85vw] text-center"
            style={{ boxShadow: "0 0 40px rgba(224, 122, 58, 0.15)" }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", damping: 20, stiffness: 200, delay: 0.05 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Celebration */}
            <motion.div
              className="mb-3"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, type: "spring", damping: 12 }}
            >
              <LucideIcon name="sparkles" size={28} className="mx-auto text-brew-orange" />
            </motion.div>
            <h3 className="text-[14px] font-bold text-brew-orange mb-1">
              {t("completed")}
            </h3>
            <p className="text-[11px] text-brew-cream/80 mb-4">
              {t("todayCount", { count: pomodoroCount })}
            </p>

            {/* Break suggestion */}
            <motion.div
              className="bg-brew-bg/50 border border-brew-border rounded-lg px-3 py-2.5 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <div className="flex items-center gap-2 justify-center mb-1">
                <LucideIcon name={iconName} size={14} className="text-cat-perso" />
                <span className="text-[10px] font-bold uppercase tracking-[1px] text-cat-perso">
                  {t("breakIdea")}
                </span>
              </div>
              <p className="text-[11px] text-brew-cream/70">{t(suggestionKey)}</p>
            </motion.div>

            {/* Dismiss */}
            <button
              onClick={dismiss}
              className="text-[10px] text-brew-gray hover:text-brew-cream transition-colors cursor-pointer"
            >
              {t("dismiss")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
