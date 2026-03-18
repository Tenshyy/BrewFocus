import type { TimerConfig } from "@/types/timer";
import type { TaskCategory } from "@/types/task";

export const TIMER_PRESETS: Record<
  string,
  TimerConfig & { label: string }
> = {
  short: { focusDuration: 15 * 60, breakDuration: 3 * 60, label: "15/3" },
  default: { focusDuration: 25 * 60, breakDuration: 5 * 60, label: "25/5" },
  long: { focusDuration: 50 * 60, breakDuration: 10 * 60, label: "50/10" },
};

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  admin: "#E07A3A",
  perso: "#6BA368",
  travail: "#5B8EC9",
  "idée": "#C4A24E",
};

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  admin: "ADMIN",
  perso: "PERSO",
  travail: "TRAVAIL",
  "idée": "IDÉE",
};

export const PRIORITY_COLORS: Record<string, string> = {
  haute: "#e05a33",
  moyenne: "#d4a24e",
  basse: "#5a8a6a",
};

export const PROJECT_COLORS = [
  "#E07A3A", // orange
  "#6BA368", // vert
  "#5B8EC9", // bleu
  "#C4A24E", // or
  "#B55B8E", // rose
  "#5BBEC9", // cyan
  "#8B6BC9", // violet
  "#C97A5B", // terre
];

export const STORAGE_KEYS = {
  tasks: "brewfocus-tasks",
  settings: "brewfocus-settings",
  braindump: "brewfocus-braindump",
  sessions: "brewfocus-sessions",
  ai: "brewfocus-ai",
  projects: "brewfocus-projects",
  ritual: "brewfocus-ritual",
  theme: "brewfocus-theme",
  dashboard: "brewfocus-dashboard",
  features: "brewfocus-features",
  gamification: "brewfocus-gamification",
} as const;

export const APP_VERSION = "0.1.0";
