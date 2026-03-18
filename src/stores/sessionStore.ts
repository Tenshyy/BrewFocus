import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PomodoroSession } from "@/types/timer";
import { STORAGE_KEYS } from "@/lib/constants";

interface SessionState {
  sessions: PomodoroSession[];
  addSession: (session: Omit<PomodoroSession, "id">) => void;
  getTodayCount: () => number;
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      addSession: (session) =>
        set((state) => ({
          sessions: [
            ...state.sessions,
            { ...session, id: crypto.randomUUID() },
          ],
        })),
      getTodayCount: () =>
        get().sessions.filter(
          (s) => s.type === "focus" && s.completedAt && isToday(s.completedAt)
        ).length,
    }),
    {
      name: STORAGE_KEYS.sessions,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
