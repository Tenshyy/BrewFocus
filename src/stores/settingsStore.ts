import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TimerConfig } from "@/types/timer";
import type { LlmConfig, LlmProvider } from "@/types/settings";
import type { AmbianceTrack } from "@/types/ambiance";
import { STORAGE_KEYS, TIMER_PRESETS } from "@/lib/constants";

interface SettingsState {
  timerConfig: TimerConfig;
  llmConfig: LlmConfig;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  cafeOpacity: number;
  ambianceTrack: AmbianceTrack;
  ambianceVolume: number;
  ambianceAutoplay: boolean;
  setTimerConfig: (config: TimerConfig) => void;
  setLlmConfig: (config: Partial<LlmConfig>) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setCafeOpacity: (opacity: number) => void;
  setAmbianceTrack: (track: AmbianceTrack) => void;
  setAmbianceVolume: (volume: number) => void;
  setAmbianceAutoplay: (autoplay: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      timerConfig: {
        focusDuration: TIMER_PRESETS.default.focusDuration,
        breakDuration: TIMER_PRESETS.default.breakDuration,
      },
      llmConfig: {
        provider: "demo" as LlmProvider,
        apiKey: "",
      },
      soundEnabled: true,
      notificationsEnabled: false,
      cafeOpacity: 40,
      ambianceTrack: "none" as AmbianceTrack,
      ambianceVolume: 30,
      ambianceAutoplay: true,
      setTimerConfig: (config) => set({ timerConfig: config }),
      setLlmConfig: (config) =>
        set((state) => ({
          llmConfig: { ...state.llmConfig, ...config },
        })),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setCafeOpacity: (opacity) => set({ cafeOpacity: opacity }),
      setAmbianceTrack: (track) => set({ ambianceTrack: track }),
      setAmbianceVolume: (volume) => set({ ambianceVolume: volume }),
      setAmbianceAutoplay: (autoplay) => set({ ambianceAutoplay: autoplay }),
    }),
    {
      name: STORAGE_KEYS.settings,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
