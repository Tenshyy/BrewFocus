import type { Task } from "@/types/task";
import type { PomodoroSession } from "@/types/timer";

export interface CalibrationData {
  /** Textual context to inject into LLM prompts */
  promptContext: string;
  /** Average ratio: actual / estimated (1.0 = perfect) */
  averageRatio: number;
  /** Number of tasks with both estimate and actuals */
  sampleSize: number;
  /** Accuracy percentage (0-100) */
  accuracyPercent: number;
}

interface CalibrationSample {
  title: string;
  estimated: number;
  actual: number;
  ratio: number;
}

const labels = {
  fr: {
    coldStart:
      "Pas d'historique d'estimation. Utilise des estimations standard : tache simple/rapide = 1 pomodoro, tache moyenne = 2-3, tache complexe = 4-5, tres complexe = 6-8.",
    historyHeader: "Historique d'estimations de cet utilisateur :",
    underEstimate: "sous-estime",
    overEstimate: "sur-estime",
    correct: "correct",
    sample: (t: string, est: number, act: number, dir: string) =>
      `- "${t}" : estime ${est}, reel ${act} pomodoros (${dir})`,
    tooLow: (r: string) =>
      `\nEn moyenne, les estimations sont trop basses (ratio ${r}x). Augmente legerement tes estimations.`,
    tooHigh: (r: string) =>
      `\nEn moyenne, les estimations sont trop hautes (ratio ${r}x). Reduis legerement tes estimations.`,
    accurate: (r: string) =>
      `\nLes estimations sont globalement precises (ratio ${r}x). Continue ainsi.`,
  },
  en: {
    coldStart:
      "No estimation history. Use standard estimates: simple/quick task = 1 pomodoro, medium task = 2-3, complex task = 4-5, very complex = 6-8.",
    historyHeader: "This user's estimation history:",
    underEstimate: "under-estimated",
    overEstimate: "over-estimated",
    correct: "accurate",
    sample: (t: string, est: number, act: number, dir: string) =>
      `- "${t}": estimated ${est}, actual ${act} pomodoros (${dir})`,
    tooLow: (r: string) =>
      `\nOn average, estimates are too low (ratio ${r}x). Slightly increase your estimates.`,
    tooHigh: (r: string) =>
      `\nOn average, estimates are too high (ratio ${r}x). Slightly reduce your estimates.`,
    accurate: (r: string) =>
      `\nEstimates are generally accurate (ratio ${r}x). Keep it up.`,
  },
} as const;

/**
 * Build calibration data from historical tasks and sessions.
 * Compares estimated vs actual pomodoros for completed tasks
 * to generate a context that improves future LLM estimations.
 */
export function buildCalibrationData(
  tasks: Task[],
  sessions: PomodoroSession[],
  locale: string = "fr"
): CalibrationData {
  const l = labels[locale as keyof typeof labels] || labels.en;

  // Build map: taskId → actual pomodoro count
  const actualMap = new Map<string, number>();
  for (const s of sessions) {
    if (s.type === "focus" && s.completedAt && s.linkedTaskId) {
      actualMap.set(s.linkedTaskId, (actualMap.get(s.linkedTaskId) || 0) + 1);
    }
  }

  // Find tasks with both estimate and actuals
  const samples: CalibrationSample[] = [];
  for (const task of tasks) {
    if (
      task.status === "done" &&
      task.estimatedPomodoros &&
      task.estimatedPomodoros > 0 &&
      actualMap.has(task.id)
    ) {
      const actual = actualMap.get(task.id)!;
      samples.push({
        title: task.title,
        estimated: task.estimatedPomodoros,
        actual,
        ratio: actual / task.estimatedPomodoros,
      });
    }
  }

  // Cold start: no calibration data available
  if (samples.length === 0) {
    return {
      promptContext: l.coldStart,
      averageRatio: 1.0,
      sampleSize: 0,
      accuracyPercent: 0,
    };
  }

  // Compute average ratio and accuracy
  const avgRatio =
    samples.reduce((sum, s) => sum + s.ratio, 0) / samples.length;
  const avgError =
    samples.reduce((sum, s) => sum + Math.abs(s.ratio - 1.0), 0) /
    samples.length;
  const accuracyPercent = Math.round(
    Math.max(0, Math.min(100, (1 - avgError) * 100))
  );

  // Build prompt context with examples (most recent 5)
  const recentSamples = samples.slice(-5);
  let ctx = l.historyHeader + "\n";
  for (const s of recentSamples) {
    const direction =
      s.ratio > 1.15
        ? l.underEstimate
        : s.ratio < 0.85
          ? l.overEstimate
          : l.correct;
    ctx += l.sample(s.title, s.estimated, s.actual, direction) + "\n";
  }

  const ratioStr = avgRatio.toFixed(2);
  if (avgRatio > 1.15) {
    ctx += l.tooLow(ratioStr);
  } else if (avgRatio < 0.85) {
    ctx += l.tooHigh(ratioStr);
  } else {
    ctx += l.accurate(ratioStr);
  }

  return {
    promptContext: ctx,
    averageRatio: Math.round(avgRatio * 100) / 100,
    sampleSize: samples.length,
    accuracyPercent,
  };
}
