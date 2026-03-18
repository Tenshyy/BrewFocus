import type { FeatureDefinition, FeatureId } from "@/types/features";

export const FEATURE_REGISTRY: FeatureDefinition[] = [
  // Core
  { id: "timer", labelKey: "features.timerLabel", descKey: "features.timerDesc", icon: "clock", group: "core" },
  { id: "brainDump", labelKey: "features.brainDumpLabel", descKey: "features.brainDumpDesc", icon: "brain", group: "core" },
  { id: "ai", labelKey: "features.aiLabel", descKey: "features.aiDesc", icon: "sparkles", group: "core" },
  { id: "stats", labelKey: "features.statsLabel", descKey: "features.statsDesc", icon: "bar-chart", group: "core" },

  // Experience
  { id: "ambiance", labelKey: "features.ambianceLabel", descKey: "features.ambianceDesc", icon: "music", group: "experience" },
  { id: "morningRitual", labelKey: "features.morningRitualLabel", descKey: "features.morningRitualDesc", icon: "sun", group: "experience" },
  { id: "commandPalette", labelKey: "features.commandPaletteLabel", descKey: "features.commandPaletteDesc", icon: "keyboard", group: "experience" },
  { id: "barista", labelKey: "features.baristaLabel", descKey: "features.baristaDesc", icon: "chef-hat", group: "experience" },

  // Organization
  { id: "projects", labelKey: "features.projectsLabel", descKey: "features.projectsDesc", icon: "folder-open", group: "organization" },
  { id: "eisenhower", labelKey: "features.eisenhowerLabel", descKey: "features.eisenhowerDesc", icon: "grid", group: "organization" },

  // Input
  { id: "voiceInput", labelKey: "features.voiceInputLabel", descKey: "features.voiceInputDesc", icon: "mic", group: "input" },

  // Motivation
  { id: "gamification", labelKey: "features.gamificationLabel", descKey: "features.gamificationDesc", icon: "trophy", group: "motivation" },
  { id: "focusView", labelKey: "features.focusViewLabel", descKey: "features.focusViewDesc", icon: "target", group: "motivation" },
];

export const DEFAULT_FEATURES: Record<FeatureId, boolean> = {
  timer: true,
  brainDump: true,
  ai: true,
  stats: true,
  ambiance: true,
  morningRitual: true,
  commandPalette: true,
  barista: true,
  projects: true,
  eisenhower: true,
  voiceInput: true,
  gamification: false,
  focusView: false,
};

export const FEATURE_GROUPS = ["core", "experience", "organization", "input", "motivation"] as const;
