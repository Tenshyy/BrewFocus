import { create } from "zustand";
import type { TimerStatus, SessionType } from "@/types/timer";

interface TimerState {
  status: TimerStatus;
  secondsRemaining: number;
  totalSeconds: number;
  sessionType: SessionType;
  /** ID de la tache actuellement epinglee au timer */
  activeTaskId: string | null;
  start: () => void;
  pause: () => void;
  reset: (focusDuration?: number) => void;
  tick: () => void;
  switchToBreak: (breakDuration: number) => void;
  switchToFocus: (focusDuration: number) => void;
  setActiveTask: (id: string | null) => void;
}

export const useTimerStore = create<TimerState>()((set) => ({
  status: "idle",
  secondsRemaining: 25 * 60,
  totalSeconds: 25 * 60,
  sessionType: "focus",
  activeTaskId: null,

  start: () => set({ status: "running" }),

  pause: () => set({ status: "paused" }),

  reset: (focusDuration) =>
    set((state) => {
      const total = focusDuration ?? state.totalSeconds;
      return {
        status: "idle",
        secondsRemaining: total,
        totalSeconds: total,
        sessionType: "focus",
      };
    }),

  tick: () =>
    set((state) => {
      if (state.status !== "running") return state;
      const next = state.secondsRemaining - 1;
      if (next <= 0) {
        return { ...state, secondsRemaining: 0, status: "idle" };
      }
      return { ...state, secondsRemaining: next };
    }),

  switchToBreak: (breakDuration) =>
    set({
      status: "running",
      secondsRemaining: breakDuration,
      totalSeconds: breakDuration,
      sessionType: "break",
    }),

  switchToFocus: (focusDuration) =>
    set({
      status: "idle",
      secondsRemaining: focusDuration,
      totalSeconds: focusDuration,
      sessionType: "focus",
    }),

  setActiveTask: (id) => set({ activeTaskId: id }),
}));
