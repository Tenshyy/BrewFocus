import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { FeatureId } from "@/types/features";
import { DEFAULT_FEATURES } from "@/lib/featureRegistry";
import { STORAGE_KEYS } from "@/lib/constants";

interface FeatureState {
  features: Record<FeatureId, boolean>;
  toggle: (id: FeatureId) => void;
  setEnabled: (id: FeatureId, enabled: boolean) => void;
  resetDefaults: () => void;
}

export const useFeatureStore = create<FeatureState>()(
  persist(
    (set) => ({
      features: { ...DEFAULT_FEATURES },
      toggle: (id) =>
        set((state) => ({
          features: { ...state.features, [id]: !state.features[id] },
        })),
      setEnabled: (id, enabled) =>
        set((state) => ({
          features: { ...state.features, [id]: enabled },
        })),
      resetDefaults: () => set({ features: { ...DEFAULT_FEATURES } }),
    }),
    {
      name: STORAGE_KEYS.features,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
