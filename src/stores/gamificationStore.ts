import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/constants";

interface GamificationState {
  dailyGoal: number;
  showCelebrations: boolean;
  lastCelebratedDate: string | null;
  setDailyGoal: (n: number) => void;
  setShowCelebrations: (b: boolean) => void;
  setLastCelebratedDate: (date: string) => void;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set) => ({
      dailyGoal: 4,
      showCelebrations: true,
      lastCelebratedDate: null,
      setDailyGoal: (n) => set({ dailyGoal: n }),
      setShowCelebrations: (b) => set({ showCelebrations: b }),
      setLastCelebratedDate: (date) => set({ lastCelebratedDate: date }),
    }),
    {
      name: STORAGE_KEYS.gamification,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
