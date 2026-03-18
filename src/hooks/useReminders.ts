import { useEffect, useRef } from "react";
import { useTaskStore } from "@/stores/taskStore";
import { useTimerStore } from "@/stores/timerStore";
import { useToastStore } from "@/stores/toastStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { sendNotification } from "@/lib/notify";
import { useTranslations } from "next-intl";

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const DEADLINE_THRESHOLD = 2 * 60 * 60 * 1000; // 2 hours
const STALE_THRESHOLD = 48 * 60 * 60 * 1000; // 48 hours
const IDLE_THRESHOLD = 45 * 60 * 1000; // 45 minutes
const BREAK_NUDGE_DELAY = 2 * 60 * 1000; // 2 minutes after focus ends
const COMEBACK_THRESHOLD = 30 * 60 * 1000; // 30 minutes in background

export function useReminders() {
  const shownRef = useRef<Set<string>>(new Set());
  const lastActivityRef = useRef(Date.now());
  const focusEndTimeRef = useRef<number | null>(null);
  const hiddenSinceRef = useRef<number | null>(null);
  const t = useTranslations("reminders");

  // Track activity + detect focus→idle transitions for break nudge
  useEffect(() => {
    let prevSessionType = useTimerStore.getState().sessionType;
    let prevStatus = useTimerStore.getState().status;

    const unsub = useTimerStore.subscribe((state) => {
      if (state.status === "running") {
        lastActivityRef.current = Date.now();
      }

      // Focus session just ended (was focus+running/paused, now idle)
      if (
        prevSessionType === "focus" &&
        prevStatus !== "idle" &&
        state.status === "idle" &&
        state.secondsRemaining === 0
      ) {
        focusEndTimeRef.current = Date.now();
        shownRef.current.delete("break-nudge"); // allow new nudge
      }

      // Break started — cancel break nudge
      if (state.sessionType === "break" && state.status === "running") {
        focusEndTimeRef.current = null;
      }

      prevSessionType = state.sessionType;
      prevStatus = state.status;
    });
    return unsub;
  }, []);

  // Come back reminder: detect tab visibility changes
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) {
        hiddenSinceRef.current = Date.now();
      } else {
        // Tab became visible again
        if (hiddenSinceRef.current) {
          const elapsed = Date.now() - hiddenSinceRef.current;
          const hour = new Date().getHours();
          const isWorkHours = hour >= 8 && hour < 19;

          if (
            elapsed > COMEBACK_THRESHOLD &&
            isWorkHours &&
            !shownRef.current.has("comeback-nudge")
          ) {
            const addToast = useToastStore.getState().addToast;
            const notificationsEnabled = useSettingsStore.getState().notificationsEnabled;
            addToast(t("comeBackNudge"), "\u{1F44B}");
            if (notificationsEnabled) {
              sendNotification("BrewFocus", t("comeBackNudge"), "comeback-nudge");
            }
            shownRef.current.add("comeback-nudge");
          }
          hiddenSinceRef.current = null;
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [t]);

  useEffect(() => {
    function check() {
      const tasks = useTaskStore.getState().tasks;
      const timerStatus = useTimerStore.getState().status;
      const addToast = useToastStore.getState().addToast;
      const notificationsEnabled = useSettingsStore.getState().notificationsEnabled;
      const now = Date.now();

      const todoTasks = tasks.filter((t) => t.status === "todo");

      // 1. Deadline proche
      for (const task of todoTasks) {
        if (!task.deadline) continue;
        const key = `deadline-${task.id}`;
        if (shownRef.current.has(key)) continue;

        const deadlineMs = new Date(task.deadline).getTime();
        const remaining = deadlineMs - now;
        if (remaining > 0 && remaining < DEADLINE_THRESHOLD) {
          addToast(t("deadlineSoon", { task: task.title }), "\u{1F4CC}");
          if (notificationsEnabled) {
            sendNotification("BrewFocus", t("deadlineSoon", { task: task.title }), `deadline-${task.id}`);
          }
          shownRef.current.add(key);
        }
      }

      // 2. Tache stagnante
      for (const task of todoTasks) {
        const key = `stale-${task.id}`;
        if (shownRef.current.has(key)) continue;

        const age = now - new Date(task.createdAt).getTime();
        if (age > STALE_THRESHOLD) {
          const days = Math.floor(age / (24 * 60 * 60 * 1000));
          addToast(
            t("staleTask", { task: task.title, days }),
            "\u{1F4A4}"
          );
          shownRef.current.add(key);
        }
      }

      // 3. Recurrence overdue: completed recurring tasks with no matching todo clone
      const doneTasks = tasks.filter((t) => t.status === "done" && t.recurrence);
      for (const doneTask of doneTasks) {
        const key = `recurrence-${doneTask.id}`;
        if (shownRef.current.has(key)) continue;

        // Check if there's already a matching todo clone
        const hasClone = todoTasks.some(
          (t) => t.title === doneTask.title && t.recurrence
        );
        if (!hasClone) {
          // Auto-generate missed occurrence
          const maxOrder = tasks.reduce((max, t) => Math.max(max, t.order ?? 0), 0);
          useTaskStore.getState().addTask({
            title: doneTask.title,
            category: doneTask.category,
            priority: doneTask.priority,
            estimatedPomodoros: doneTask.estimatedPomodoros,
            source: doneTask.source,
            projectId: doneTask.projectId,
          });
          // Set recurrence on the newly added task
          const newTasks = useTaskStore.getState().tasks;
          const newest = newTasks[newTasks.length - 1];
          if (newest) {
            useTaskStore.getState().setRecurrence(newest.id, doneTask.recurrence);
            useTaskStore.getState().updateTask(newest.id, { order: maxOrder + 1 });
          }
          shownRef.current.add(key);
        } else {
          shownRef.current.add(key);
        }
      }

      // 4. Pause longue (idle nudge)
      if (
        timerStatus === "idle" &&
        todoTasks.length > 0 &&
        now - lastActivityRef.current > IDLE_THRESHOLD &&
        !shownRef.current.has("idle-reminder")
      ) {
        addToast(t("idleNudge"), "\u2615");
        shownRef.current.add("idle-reminder");
      }

      // 5. Break nudge: focus ended but no break started after 2 min
      if (
        focusEndTimeRef.current &&
        timerStatus === "idle" &&
        now - focusEndTimeRef.current > BREAK_NUDGE_DELAY &&
        !shownRef.current.has("break-nudge")
      ) {
        addToast(t("breakNudge"), "\u{1F9D8}");
        if (notificationsEnabled) {
          sendNotification("BrewFocus", t("breakNudge"), "break-nudge");
        }
        shownRef.current.add("break-nudge");
        focusEndTimeRef.current = null;
      }
    }

    // Initial check after 30s delay (don't spam on page load)
    const initialTimer = setTimeout(check, 30000);
    const interval = setInterval(check, CHECK_INTERVAL);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [t]);
}
