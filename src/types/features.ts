export type FeatureId =
  | "timer"
  | "brainDump"
  | "ai"
  | "stats"
  | "ambiance"
  | "morningRitual"
  | "commandPalette"
  | "barista"
  | "projects"
  | "eisenhower"
  | "voiceInput"
  | "gamification"
  | "focusView";

export type FeatureGroup =
  | "core"
  | "experience"
  | "organization"
  | "input"
  | "motivation";

export interface FeatureDefinition {
  id: FeatureId;
  labelKey: string;
  descKey: string;
  icon: string;
  group: FeatureGroup;
}
