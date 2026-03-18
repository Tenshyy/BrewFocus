export type SessionType = "focus" | "break";
export type TimerStatus = "idle" | "running" | "paused";

export interface TimerConfig {
  focusDuration: number; // seconds
  breakDuration: number; // seconds
}

export interface PomodoroSession {
  id: string;
  startTime: string;
  duration: number;
  completedAt?: string;
  type: SessionType;
  /** ID de la tache liee a cette session */
  linkedTaskId?: string;
}
