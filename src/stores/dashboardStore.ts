import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/constants";

export interface WidgetConfig {
  id: string;
  enabled: boolean;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "stat-numbers", enabled: true },
  { id: "estimation-accuracy", enabled: true },
  { id: "weekly-chart", enabled: true },
  { id: "category-breakdown", enabled: true },
  { id: "personal-bests", enabled: true },
  { id: "heatmap-calendar", enabled: true },
  { id: "time-tracking", enabled: true },
  { id: "export-report", enabled: true },
];

interface DashboardState {
  widgets: WidgetConfig[];
  editMode: boolean;
  setWidgetOrder: (widgets: WidgetConfig[]) => void;
  toggleWidget: (id: string) => void;
  setEditMode: (editing: boolean) => void;
  resetToDefault: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      widgets: DEFAULT_WIDGETS,
      editMode: false,

      setWidgetOrder: (widgets) => set({ widgets }),

      toggleWidget: (id) =>
        set((s) => ({
          widgets: s.widgets.map((w) =>
            w.id === id ? { ...w, enabled: !w.enabled } : w
          ),
        })),

      setEditMode: (editing) => set({ editMode: editing }),

      resetToDefault: () => set({ widgets: DEFAULT_WIDGETS }),
    }),
    {
      name: STORAGE_KEYS.dashboard,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        widgets: state.widgets,
      }),
    }
  )
);
