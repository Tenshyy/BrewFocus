import type { TimerConfig } from "./timer";
import type { AmbianceTrack } from "./ambiance";

export type LlmProvider = "anthropic" | "openai" | "groq" | "ollama" | "demo";

export interface LlmConfig {
  provider: LlmProvider;
  apiKey: string;
  model?: string;
  ollamaUrl?: string;
}

export interface Settings {
  timerConfig: TimerConfig;
  llmConfig: LlmConfig;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  cafeOpacity: number;
  ambianceTrack: AmbianceTrack;
  ambianceVolume: number;
  ambianceAutoplay: boolean;
}
