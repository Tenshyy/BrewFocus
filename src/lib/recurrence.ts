import type { TaskRecurrence } from "@/types/task";

/**
 * Calcule la prochaine date d'occurrence a partir d'une date de reference.
 * Retourne une date ISO string.
 */
export function computeNextOccurrence(
  recurrence: TaskRecurrence,
  fromDate: Date = new Date()
): string {
  const next = new Date(fromDate);

  switch (recurrence.type) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;

    case "weekly": {
      const days = recurrence.daysOfWeek ?? [];
      if (days.length === 0) {
        // Fallback: same day next week
        next.setDate(next.getDate() + 7);
      } else {
        const currentDay = next.getDay();
        // Find next matching day
        const sorted = [...days].sort((a, b) => a - b);
        const nextDay = sorted.find((d) => d > currentDay);
        if (nextDay !== undefined) {
          next.setDate(next.getDate() + (nextDay - currentDay));
        } else {
          // Wrap to next week
          const daysUntil = ((sorted[0] - currentDay) + 7) % 7 || 7;
          next.setDate(next.getDate() + daysUntil);
        }
      }
      break;
    }

    case "custom": {
      const interval = recurrence.interval ?? 1;
      next.setDate(next.getDate() + interval);
      break;
    }
  }

  return next.toISOString();
}

/**
 * Retourne un label court pour la recurrence.
 */
export function getRecurrenceLabel(recurrence: TaskRecurrence): string {
  switch (recurrence.type) {
    case "daily":
      return "Quotidien";
    case "weekly": {
      const dayNames = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];
      const days = recurrence.daysOfWeek ?? [];
      if (days.length === 0) return "Hebdo";
      return days.map((d) => dayNames[d]).join(", ");
    }
    case "custom": {
      const n = recurrence.interval ?? 1;
      return n === 1 ? "Chaque jour" : `Tous les ${n}j`;
    }
  }
}
