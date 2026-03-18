import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/constants";

function todayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface RitualState {
  lastVisit: string | null;
  dismissedDate: string | null;
  onboardingCompleted: boolean;
  updateLastVisit: () => void;
  dismissRitual: () => void;
  completeOnboarding: () => void;
  shouldShowRitual: () => boolean;
}

export const useRitualStore = create<RitualState>()(
  persist(
    (set, get) => ({
      lastVisit: null,
      dismissedDate: null,
      onboardingCompleted: false,

      updateLastVisit: () =>
        set({ lastVisit: todayDateStr() }),

      dismissRitual: () =>
        set({
          lastVisit: todayDateStr(),
          dismissedDate: todayDateStr(),
        }),

      completeOnboarding: () =>
        set({ onboardingCompleted: true }),

      shouldShowRitual: () => {
        const { lastVisit, dismissedDate } = get();
        const today = todayDateStr();
        // Already dismissed today
        if (dismissedDate === today) return false;
        // First visit ever or new day
        return lastVisit === null || lastVisit !== today;
      },
    }),
    {
      name: STORAGE_KEYS.ritual,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
