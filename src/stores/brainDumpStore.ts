import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { BrainDump, ParkingItem } from "@/types/task";
import { STORAGE_KEYS } from "@/lib/constants";

interface BrainDumpState {
  currentText: string;
  history: BrainDump[];
  parkingItems: ParkingItem[];
  isLoading: boolean;
  error: string | null;
  setText: (text: string) => void;
  saveToHistory: (dump: BrainDump) => void;
  addParkingItems: (items: ParkingItem[]) => void;
  clearCurrent: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBrainDumpStore = create<BrainDumpState>()(
  persist(
    (set) => ({
      currentText: "",
      history: [],
      parkingItems: [],
      isLoading: false,
      error: null,

      setText: (text) => set({ currentText: text }),

      saveToHistory: (dump) =>
        set((state) => ({
          history: [dump, ...state.history].slice(0, 50), // keep last 50
        })),

      addParkingItems: (items) =>
        set((state) => ({
          parkingItems: [...state.parkingItems, ...items],
        })),

      clearCurrent: () => set({ currentText: "" }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),
    }),
    {
      name: STORAGE_KEYS.braindump,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentText: state.currentText,
        history: state.history,
        parkingItems: state.parkingItems,
      }),
    }
  )
);
