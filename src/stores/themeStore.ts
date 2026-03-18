import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CafeTheme } from "@/types/theme";
import { STORAGE_KEYS } from "@/lib/constants";

interface ThemeState {
  selectedTheme: CafeTheme;
  setTheme: (theme: CafeTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      selectedTheme: "parisien",
      setTheme: (theme) => set({ selectedTheme: theme }),
    }),
    {
      name: STORAGE_KEYS.theme,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
