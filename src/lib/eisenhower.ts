import type { Task } from "@/types/task";

export type Quadrant = "do" | "schedule" | "delegate" | "eliminate";

/**
 * Classify a task into an Eisenhower quadrant.
 *
 * - urgent = explicitly flagged OR deadline < 48h
 * - important = priority "haute" or "moyenne"
 *
 * Q1 Do = urgent + important
 * Q2 Schedule = !urgent + important
 * Q3 Delegate = urgent + !important
 * Q4 Eliminate = !urgent + !important
 */
export function classifyTask(task: Task): Quadrant {
  const isUrgent = task.isUrgent ?? isDeadlineClose(task.deadline);
  const isImportant = task.priority === "haute" || task.priority === "moyenne";

  if (isUrgent && isImportant) return "do";
  if (!isUrgent && isImportant) return "schedule";
  if (isUrgent && !isImportant) return "delegate";
  return "eliminate";
}

function isDeadlineClose(deadline?: string): boolean {
  if (!deadline) return false;
  const diff = new Date(deadline).getTime() - Date.now();
  return diff > 0 && diff < 48 * 60 * 60 * 1000;
}

/**
 * Returns partial Task updates to apply when a task is
 * dropped into a different quadrant via drag & drop.
 */
export function reclassifyFromQuadrant(
  quadrant: Quadrant
): Partial<Task> {
  switch (quadrant) {
    case "do":
      return { priority: "haute", isUrgent: true };
    case "schedule":
      return { priority: "haute", isUrgent: false };
    case "delegate":
      return { priority: "basse", isUrgent: true };
    case "eliminate":
      return { priority: "basse", isUrgent: false };
  }
}
