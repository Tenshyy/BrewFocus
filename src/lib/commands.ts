import type { Searchable } from "./fuzzySearch";
import type { FeatureId } from "@/types/features";
import { TIMER_PRESETS } from "./constants";

export interface Command extends Searchable {
  id: string;
  icon: string;
  category: "timer" | "tasks" | "ai" | "navigation" | "settings";
  requiredFeature?: FeatureId;
  action: () => void;
}

export interface CommandCallbacks {
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setPreset: (focus: number, brk: number) => void;
  addTask: () => void;
  setListView: () => void;
  setMatrixView: () => void;
  openAiMode: (mode: string) => void;
  transformBraindump: () => void;
  toggleStats: () => void;
  scrollToTop: () => void;
  scrollToStats: () => void;
  openSettings: () => void;
  toggleSound: () => void;
  switchLanguage: () => void;
}

export function buildCommands(callbacks: CommandCallbacks): Command[] {
  return [
    // -- Timer --
    {
      id: "timer-start-pause",
      label: "Start / Pause timer",
      icon: "clock",
      category: "timer",
      requiredFeature: "timer",
      keywords: ["start", "pause", "play", "demarrer", "lancer"],
      action: callbacks.startTimer,
    },
    {
      id: "timer-reset",
      label: "Reset timer",
      icon: "refresh-cw",
      category: "timer",
      requiredFeature: "timer",
      keywords: ["reset", "reinitialiser", "zero"],
      action: callbacks.resetTimer,
    },
    {
      id: "timer-preset-15",
      label: "Preset 15/3",
      icon: "zap",
      category: "timer",
      requiredFeature: "timer",
      keywords: ["short", "15", "quick", "court", "rapide"],
      action: () => callbacks.setPreset(TIMER_PRESETS.short.focusDuration, TIMER_PRESETS.short.breakDuration),
    },
    {
      id: "timer-preset-25",
      label: "Preset 25/5",
      icon: "coffee",
      category: "timer",
      requiredFeature: "timer",
      keywords: ["default", "25", "standard", "pomodoro"],
      action: () => callbacks.setPreset(TIMER_PRESETS.default.focusDuration, TIMER_PRESETS.default.breakDuration),
    },
    {
      id: "timer-preset-50",
      label: "Preset 50/10",
      icon: "flame",
      category: "timer",
      requiredFeature: "timer",
      keywords: ["long", "50", "deep", "profond"],
      action: () => callbacks.setPreset(TIMER_PRESETS.long.focusDuration, TIMER_PRESETS.long.breakDuration),
    },

    // -- Tasks --
    {
      id: "task-new",
      label: "New task",
      icon: "plus",
      category: "tasks",
      keywords: ["add", "create", "nouvelle", "ajouter", "tache"],
      action: callbacks.addTask,
    },
    {
      id: "task-list-view",
      label: "List view",
      icon: "list",
      category: "tasks",
      keywords: ["list", "liste"],
      action: callbacks.setListView,
    },
    {
      id: "task-matrix-view",
      label: "Matrix view (Eisenhower)",
      icon: "grid",
      category: "tasks",
      requiredFeature: "eisenhower",
      keywords: ["matrix", "matrice", "eisenhower", "quadrant"],
      action: callbacks.setMatrixView,
    },

    // -- AI --
    {
      id: "ai-rubber-duck",
      label: "Rubber Duck",
      icon: "bird",
      category: "ai",
      requiredFeature: "ai",
      keywords: ["chat", "discuss", "rubber", "duck", "discuter"],
      action: () => callbacks.openAiMode("chat"),
    },
    {
      id: "ai-planner",
      label: "Plan my day",
      icon: "clipboard-list",
      category: "ai",
      requiredFeature: "ai",
      keywords: ["plan", "planner", "jour", "day", "organiser"],
      action: () => callbacks.openAiMode("planner"),
    },
    {
      id: "ai-decompose",
      label: "Decompose task",
      icon: "puzzle",
      category: "ai",
      requiredFeature: "ai",
      keywords: ["decompose", "break", "split", "decouper"],
      action: () => callbacks.openAiMode("decompose"),
    },
    {
      id: "ai-coach",
      label: "Coach",
      icon: "target",
      category: "ai",
      requiredFeature: "ai",
      keywords: ["coach", "advice", "conseil", "tips"],
      action: () => callbacks.openAiMode("coach"),
    },
    {
      id: "ai-weekly-review",
      label: "Weekly Review",
      icon: "calendar",
      category: "ai",
      requiredFeature: "ai",
      keywords: ["weekly", "review", "revue", "hebdo", "semaine"],
      action: () => callbacks.openAiMode("weeklyReview"),
    },
    {
      id: "ai-braindump",
      label: "Transform braindump",
      icon: "brain",
      category: "ai",
      requiredFeature: "brainDump",
      keywords: ["braindump", "transform", "brain", "dump"],
      action: callbacks.transformBraindump,
    },

    // -- Navigation --
    {
      id: "nav-toggle-stats",
      label: "Toggle stats",
      icon: "bar-chart",
      category: "navigation",
      requiredFeature: "stats",
      keywords: ["stats", "statistics", "comptoir", "dashboard"],
      action: callbacks.toggleStats,
    },
    {
      id: "nav-scroll-top",
      label: "Scroll to top",
      icon: "arrow-up",
      category: "navigation",
      keywords: ["top", "haut", "scroll"],
      action: callbacks.scrollToTop,
    },
    {
      id: "nav-scroll-stats",
      label: "Scroll to stats",
      icon: "trending-up",
      category: "navigation",
      requiredFeature: "stats",
      keywords: ["stats", "scroll", "bas", "bottom"],
      action: callbacks.scrollToStats,
    },

    // -- Settings --
    {
      id: "settings-open",
      label: "Open settings",
      icon: "settings",
      category: "settings",
      keywords: ["settings", "parametres", "config", "options"],
      action: callbacks.openSettings,
    },
    {
      id: "settings-toggle-sound",
      label: "Toggle sound",
      icon: "volume",
      category: "settings",
      keywords: ["sound", "son", "mute", "audio"],
      action: callbacks.toggleSound,
    },
    {
      id: "settings-language",
      label: "Switch language",
      icon: "globe",
      category: "settings",
      keywords: ["language", "langue", "fr", "en", "french", "english"],
      action: callbacks.switchLanguage,
    },
  ];
}
