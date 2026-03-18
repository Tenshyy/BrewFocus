import type { PomodoroSession } from "@/types/timer";
import type { Task, TaskCategory, Project } from "@/types/task";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "./constants";

// ── Helpers ──────────────────────────────────────────────
export function toDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayKey(): string {
  return toDateKey(new Date().toISOString());
}

function getDayNames(locale: string = "fr"): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  // getDay() returns 0=Sunday, 1=Monday, ...
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, 7 + i); // 2024-01-07 is a Sunday
    return formatter.format(d).replace(".", "").slice(0, 2);
  });
}

const DAY_NAMES = getDayNames();

// ── Streak ───────────────────────────────────────────────
export function computeStreak(sessions: PomodoroSession[]): number {
  const focusDays = new Set<string>();
  for (const s of sessions) {
    if (s.type === "focus" && s.completedAt) {
      focusDays.add(toDateKey(s.completedAt));
    }
  }

  let streak = 0;
  const now = new Date();
  // Start from today and go backwards
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = toDateKey(d.toISOString());
    if (focusDays.has(key)) {
      streak++;
    } else if (i === 0) {
      // Today hasn't had a session yet, still check yesterday
      continue;
    } else {
      break;
    }
  }
  return streak;
}

// ── Weekly Chart ─────────────────────────────────────────
export interface DayData {
  dayName: string;
  dateKey: string;
  count: number;
  isToday: boolean;
}

export function computeWeeklyChart(sessions: PomodoroSession[]): DayData[] {
  const today = todayKey();
  const counts = new Map<string, number>();

  for (const s of sessions) {
    if (s.type === "focus" && s.completedAt) {
      const key = toDateKey(s.completedAt);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  const result: DayData[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = toDateKey(d.toISOString());
    result.push({
      dayName: DAY_NAMES[d.getDay()],
      dateKey: key,
      count: counts.get(key) || 0,
      isToday: key === today,
    });
  }
  return result;
}

// ── Total Focus ──────────────────────────────────────────
export function computeTotalFocus(sessions: PomodoroSession[]): {
  totalSessions: number;
  totalHours: number;
} {
  const focusSessions = sessions.filter(
    (s) => s.type === "focus" && s.completedAt
  );
  const totalSeconds = focusSessions.reduce((sum, s) => sum + s.duration, 0);
  return {
    totalSessions: focusSessions.length,
    totalHours: Math.round((totalSeconds / 3600) * 10) / 10,
  };
}

// ── Personal Bests ───────────────────────────────────────
export interface PersonalBest {
  label: string;
  value: string;
  detail: string;
}

export function computePersonalBests(
  sessions: PomodoroSession[],
  tasks: Task[]
): PersonalBest[] {
  const bests: PersonalBest[] = [];

  // Best pomodoro day
  const dayCountsMap = new Map<string, number>();
  for (const s of sessions) {
    if (s.type === "focus" && s.completedAt) {
      const key = toDateKey(s.completedAt);
      dayCountsMap.set(key, (dayCountsMap.get(key) || 0) + 1);
    }
  }
  let bestDay = "";
  let bestDayCount = 0;
  for (const [key, count] of dayCountsMap) {
    if (count > bestDayCount) {
      bestDayCount = count;
      bestDay = key;
    }
  }
  if (bestDayCount > 0) {
    const d = new Date(bestDay + "T12:00:00");
    const formatted = `${d.getDate()}/${d.getMonth() + 1}`;
    bests.push({
      label: "Meilleur jour",
      value: `${bestDayCount}`,
      detail: `pomodoros — ${formatted}`,
    });
  }

  // Longest streak
  const focusDays = new Set<string>();
  for (const s of sessions) {
    if (s.type === "focus" && s.completedAt) {
      focusDays.add(toDateKey(s.completedAt));
    }
  }
  const sortedDays = Array.from(focusDays).sort();
  let maxStreak = 0;
  let currentStreak = 0;
  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0) {
      currentStreak = 1;
    } else {
      const prev = new Date(sortedDays[i - 1] + "T12:00:00");
      const curr = new Date(sortedDays[i] + "T12:00:00");
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      currentStreak = diff === 1 ? currentStreak + 1 : 1;
    }
    maxStreak = Math.max(maxStreak, currentStreak);
  }
  if (maxStreak > 0) {
    bests.push({
      label: "Plus long streak",
      value: `${maxStreak}`,
      detail: maxStreak === 1 ? "jour" : "jours",
    });
  }

  // Most tasks in a day
  const taskDayCounts = new Map<string, number>();
  for (const t of tasks) {
    if (t.status === "done" && t.completedAt) {
      const key = toDateKey(t.completedAt);
      taskDayCounts.set(key, (taskDayCounts.get(key) || 0) + 1);
    }
  }
  let bestTaskDay = "";
  let bestTaskCount = 0;
  for (const [key, count] of taskDayCounts) {
    if (count > bestTaskCount) {
      bestTaskCount = count;
      bestTaskDay = key;
    }
  }
  if (bestTaskCount > 0) {
    const d = new Date(bestTaskDay + "T12:00:00");
    const formatted = `${d.getDate()}/${d.getMonth() + 1}`;
    bests.push({
      label: "Taches en 1 jour",
      value: `${bestTaskCount}`,
      detail: `taches — ${formatted}`,
    });
  }

  return bests;
}

// ── Task Stats ───────────────────────────────────────────
export interface CategoryStat {
  category: TaskCategory;
  label: string;
  color: string;
  count: number;
  percent: number;
}

export function computeTaskStats(tasks: Task[]): {
  total: number;
  done: number;
  rate: number;
  categories: CategoryStat[];
} {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const rate = total > 0 ? Math.round((done / total) * 100) : 0;

  const catCounts = new Map<TaskCategory, number>();
  for (const t of tasks) {
    catCounts.set(t.category, (catCounts.get(t.category) || 0) + 1);
  }

  const categories: CategoryStat[] = (
    Object.keys(CATEGORY_COLORS) as TaskCategory[]
  )
    .map((cat) => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      color: CATEGORY_COLORS[cat],
      count: catCounts.get(cat) || 0,
      percent: total > 0 ? Math.round(((catCounts.get(cat) || 0) / total) * 100) : 0,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  return { total, done, rate, categories };
}

// ── Yesterday Pomodoros ─────────────────────────────────
export function computeYesterdayPomodoros(
  sessions: PomodoroSession[]
): number {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = toDateKey(yesterday.toISOString());
  return sessions.filter(
    (s) => s.type === "focus" && s.completedAt && toDateKey(s.completedAt) === yKey
  ).length;
}

// ── Upcoming Deadlines ──────────────────────────────────
export function getUpcomingDeadlines(
  tasks: Task[],
  hoursAhead: number
): Task[] {
  const now = Date.now();
  const threshold = hoursAhead * 60 * 60 * 1000;
  return tasks.filter((t) => {
    if (t.status !== "todo" || !t.deadline) return false;
    const remaining = new Date(t.deadline).getTime() - now;
    return remaining > 0 && remaining < threshold;
  });
}

// ── Heatmap Calendar ────────────────────────────────────
export interface HeatmapDay {
  dateKey: string;
  count: number;
  intensity: 0 | 1 | 2 | 3 | 4;
  isToday: boolean;
}

export interface HeatmapWeek {
  days: HeatmapDay[];
}

export interface HeatmapData {
  weeks: HeatmapWeek[];
  totalDays: number;
  maxCount: number;
  monthLabels: { label: string; weekIndex: number }[];
}

const MONTH_LABELS_FR = [
  "Jan", "Fev", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Aou", "Sep", "Oct", "Nov", "Dec",
];

export function computeHeatmap(
  sessions: PomodoroSession[],
  weeksBack: number = 13
): HeatmapData {
  // Build count map
  const counts = new Map<string, number>();
  for (const s of sessions) {
    if (s.type === "focus" && s.completedAt) {
      const key = toDateKey(s.completedAt);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  // Find the Monday of weeksBack weeks ago
  const now = new Date();
  const today = todayKey();
  const start = new Date(now);
  start.setDate(start.getDate() - (weeksBack * 7) + 1);
  // Align to Monday (1 = Monday)
  const startDay = start.getDay();
  const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
  start.setDate(start.getDate() + mondayOffset);

  const weeks: HeatmapWeek[] = [];
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let maxCount = 0;
  let totalDays = 0;
  let lastMonth = -1;

  const cursor = new Date(start);
  let weekIndex = 0;

  while (toDateKey(cursor.toISOString()) <= today || cursor.getDay() !== 1) {
    const days: HeatmapDay[] = [];
    for (let d = 0; d < 7; d++) {
      const key = toDateKey(cursor.toISOString());
      const isFuture = key > today;
      const count = isFuture ? -1 : (counts.get(key) || 0);

      if (count > maxCount) maxCount = count;
      if (count > 0) totalDays++;

      // Track month labels
      if (d === 0) {
        const m = cursor.getMonth();
        if (m !== lastMonth) {
          monthLabels.push({ label: MONTH_LABELS_FR[m], weekIndex });
          lastMonth = m;
        }
      }

      days.push({ dateKey: key, count, intensity: 0, isToday: key === today });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push({ days });
    weekIndex++;

    // Stop if we've gone past today and completed the week
    if (toDateKey(cursor.toISOString()) > today && cursor.getDay() === 1) break;
  }

  // Compute intensity quartiles
  for (const week of weeks) {
    for (const day of week.days) {
      if (day.count <= 0) {
        day.intensity = 0;
      } else if (maxCount <= 4) {
        day.intensity = Math.min(day.count, 4) as 1 | 2 | 3 | 4;
      } else {
        const q = day.count / maxCount;
        day.intensity = q <= 0.25 ? 1 : q <= 0.5 ? 2 : q <= 0.75 ? 3 : 4;
      }
    }
  }

  return { weeks, totalDays, maxCount, monthLabels };
}

// ── Time Tracking ───────────────────────────────────────
export interface TaskTimeStat {
  taskId: string;
  taskTitle: string;
  projectId: string | undefined;
  pomodoroCount: number;
  totalMinutes: number;
  estimatedPomodoros: number | undefined;
}

export interface ProjectTimeStat {
  projectId: string;
  projectName: string;
  projectColor: string;
  pomodoroCount: number;
  totalMinutes: number;
  taskCount: number;
}

export function computeTimeTracking(
  sessions: PomodoroSession[],
  tasks: Task[],
  projects: Project[]
): {
  byTask: TaskTimeStat[];
  byProject: ProjectTimeStat[];
  unlinkedCount: number;
  unlinkedMinutes: number;
} {
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  // Aggregate by task
  const taskAgg = new Map<string, { count: number; seconds: number }>();
  let unlinkedCount = 0;
  let unlinkedSeconds = 0;

  for (const s of sessions) {
    if (s.type !== "focus" || !s.completedAt) continue;
    if (s.linkedTaskId && taskMap.has(s.linkedTaskId)) {
      const prev = taskAgg.get(s.linkedTaskId) || { count: 0, seconds: 0 };
      taskAgg.set(s.linkedTaskId, {
        count: prev.count + 1,
        seconds: prev.seconds + s.duration,
      });
    } else {
      unlinkedCount++;
      unlinkedSeconds += s.duration;
    }
  }

  const byTask: TaskTimeStat[] = [];
  for (const [taskId, agg] of taskAgg) {
    const task = taskMap.get(taskId);
    if (!task) continue;
    byTask.push({
      taskId,
      taskTitle: task.title,
      projectId: task.projectId,
      pomodoroCount: agg.count,
      totalMinutes: Math.round(agg.seconds / 60),
      estimatedPomodoros: task.estimatedPomodoros,
    });
  }
  byTask.sort((a, b) => b.pomodoroCount - a.pomodoroCount);

  // Aggregate by project
  const projAgg = new Map<string, { count: number; seconds: number; taskIds: Set<string> }>();
  for (const ts of byTask) {
    const pid = ts.projectId || "__none__";
    const prev = projAgg.get(pid) || { count: 0, seconds: 0, taskIds: new Set() };
    projAgg.set(pid, {
      count: prev.count + ts.pomodoroCount,
      seconds: prev.seconds + ts.totalMinutes * 60,
      taskIds: prev.taskIds.add(ts.taskId),
    });
  }

  const byProject: ProjectTimeStat[] = [];
  for (const [pid, agg] of projAgg) {
    if (pid === "__none__") continue;
    const project = projectMap.get(pid);
    if (!project) continue;
    byProject.push({
      projectId: pid,
      projectName: project.name,
      projectColor: project.color,
      pomodoroCount: agg.count,
      totalMinutes: Math.round(agg.seconds / 60),
      taskCount: agg.taskIds.size,
    });
  }
  byProject.sort((a, b) => b.pomodoroCount - a.pomodoroCount);

  return {
    byTask,
    byProject,
    unlinkedCount,
    unlinkedMinutes: Math.round(unlinkedSeconds / 60),
  };
}

// ── Export Report ────────────────────────────────────────
export type ReportPeriod = "week" | "month";

export interface ReportData {
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  totalPomodoros: number;
  totalFocusHours: number;
  totalTasksCompleted: number;
  activeDays: number;
  projectBreakdown: {
    projectName: string;
    pomodoroCount: number;
    focusMinutes: number;
    tasksCompleted: number;
    taskList: string[];
  }[];
  categoryBreakdown: { label: string; count: number }[];
  bestDay: { dateKey: string; count: number } | null;
}

export function computeReport(
  sessions: PomodoroSession[],
  tasks: Task[],
  projects: Project[],
  period: ReportPeriod
): ReportData {
  const now = new Date();
  const daysBack = period === "week" ? 6 : 29;
  const start = new Date(now);
  start.setDate(start.getDate() - daysBack);
  const startKey = toDateKey(start.toISOString());
  const endKey = toDateKey(now.toISOString());

  // Filter sessions in range
  const rangedSessions = sessions.filter(
    (s) => s.type === "focus" && s.completedAt && toDateKey(s.completedAt) >= startKey && toDateKey(s.completedAt) <= endKey
  );

  // Filter tasks completed in range
  const rangedTasks = tasks.filter(
    (t) => t.status === "done" && t.completedAt && toDateKey(t.completedAt) >= startKey && toDateKey(t.completedAt) <= endKey
  );

  const totalPomodoros = rangedSessions.length;
  const totalSeconds = rangedSessions.reduce((s, r) => s + r.duration, 0);
  const totalFocusHours = Math.round((totalSeconds / 3600) * 10) / 10;

  // Active days
  const activeDaysSet = new Set<string>();
  for (const s of rangedSessions) {
    if (s.completedAt) activeDaysSet.add(toDateKey(s.completedAt));
  }

  // Best day
  const dayCounts = new Map<string, number>();
  for (const s of rangedSessions) {
    if (s.completedAt) {
      const key = toDateKey(s.completedAt);
      dayCounts.set(key, (dayCounts.get(key) || 0) + 1);
    }
  }
  let bestDay: { dateKey: string; count: number } | null = null;
  for (const [key, count] of dayCounts) {
    if (!bestDay || count > bestDay.count) bestDay = { dateKey: key, count };
  }

  // Project breakdown
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const projBreak = new Map<string, { count: number; minutes: number; tasks: string[] }>();
  for (const t of rangedTasks) {
    const pid = t.projectId || "__none__";
    const prev = projBreak.get(pid) || { count: 0, minutes: 0, tasks: [] };
    prev.tasks.push(t.title);
    projBreak.set(pid, prev);
  }
  // Add session counts per project via linkedTaskId
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  for (const s of rangedSessions) {
    if (s.linkedTaskId) {
      const task = taskMap.get(s.linkedTaskId);
      const pid = task?.projectId || "__none__";
      const prev = projBreak.get(pid) || { count: 0, minutes: 0, tasks: [] };
      prev.count++;
      prev.minutes += Math.round(s.duration / 60);
      projBreak.set(pid, prev);
    }
  }

  const projectBreakdown = Array.from(projBreak.entries())
    .filter(([pid]) => pid !== "__none__" && projectMap.has(pid))
    .map(([pid, data]) => ({
      projectName: projectMap.get(pid)!.name,
      pomodoroCount: data.count,
      focusMinutes: data.minutes,
      tasksCompleted: data.tasks.length,
      taskList: data.tasks,
    }))
    .sort((a, b) => b.pomodoroCount - a.pomodoroCount);

  // Category breakdown
  const catCounts = new Map<string, number>();
  for (const t of rangedTasks) {
    catCounts.set(t.category, (catCounts.get(t.category) || 0) + 1);
  }
  const categoryBreakdown = Array.from(catCounts.entries())
    .map(([cat, count]) => ({
      label: CATEGORY_LABELS[cat as TaskCategory] || cat,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    period,
    startDate: startKey,
    endDate: endKey,
    totalPomodoros,
    totalFocusHours,
    totalTasksCompleted: rangedTasks.length,
    activeDays: activeDaysSet.size,
    projectBreakdown,
    categoryBreakdown,
    bestDay,
  };
}

export interface ReportLabels {
  week: string;
  month: string;
  reportTitle: string;
  from: string;
  to: string;
  summary: string;
  metric: string;
  value: string;
  pomodorosCompleted: string;
  focusHours: string;
  tasksCompleted: string;
  activeDays: string;
  bestDay: string;
  byProject: string;
  byCategory: string;
  tasksUnit: string;
  generatedBy: string;
}

export function generateMarkdownReport(data: ReportData, labels: ReportLabels): string {
  const title = data.period === "week" ? labels.week : labels.month;
  let md = `# BrewFocus — ${labels.reportTitle} ${title}\n`;
  md += `> ${labels.from} ${data.startDate} ${labels.to} ${data.endDate}\n\n`;
  md += `---\n\n`;
  md += `## ${labels.summary}\n`;
  md += `| ${labels.metric} | ${labels.value} |\n`;
  md += `|----------|--------|\n`;
  md += `| ${labels.pomodorosCompleted} | ${data.totalPomodoros} |\n`;
  md += `| ${labels.focusHours} | ${data.totalFocusHours}h |\n`;
  md += `| ${labels.tasksCompleted} | ${data.totalTasksCompleted} |\n`;
  md += `| ${labels.activeDays} | ${data.activeDays} |\n`;
  if (data.bestDay) {
    md += `| ${labels.bestDay} | ${data.bestDay.dateKey} (${data.bestDay.count} pomodoros) |\n`;
  }
  md += `\n`;

  if (data.projectBreakdown.length > 0) {
    md += `---\n\n## ${labels.byProject}\n\n`;
    for (const p of data.projectBreakdown) {
      md += `### ${p.projectName}\n`;
      md += `- ${p.pomodoroCount} pomodoros (${p.focusMinutes} min)\n`;
      md += `- ${p.tasksCompleted} ${labels.tasksUnit}\n`;
      for (const tk of p.taskList) {
        md += `  - ${tk}\n`;
      }
      md += `\n`;
    }
  }

  if (data.categoryBreakdown.length > 0) {
    md += `---\n\n## ${labels.byCategory}\n\n`;
    for (const c of data.categoryBreakdown) {
      md += `- **${c.label}**: ${c.count} ${labels.tasksUnit}\n`;
    }
    md += `\n`;
  }

  md += `---\n\n> ${labels.generatedBy} ${todayKey()}\n`;
  return md;
}

// ── Estimation Accuracy ─────────────────────────────────
export interface EstimationAccuracy {
  /** Accuracy percentage (0-100) */
  accuracyPercent: number;
  /** Number of calibrated tasks */
  sampleSize: number;
  /** Trend: improving, declining, or stable */
  trend: "improving" | "declining" | "stable";
  /** TDAH-friendly message */
  message: string;
}

export function computeEstimationAccuracy(
  tasks: Task[],
  sessions: PomodoroSession[]
): EstimationAccuracy | null {
  // Build actual pomodoro counts per task
  const actualMap = new Map<string, number>();
  for (const s of sessions) {
    if (s.type === "focus" && s.completedAt && s.linkedTaskId) {
      actualMap.set(s.linkedTaskId, (actualMap.get(s.linkedTaskId) || 0) + 1);
    }
  }

  // Find completed tasks with both estimate and actuals
  const samples: { ratio: number; completedAt: string }[] = [];
  for (const task of tasks) {
    if (
      task.status === "done" &&
      task.estimatedPomodoros &&
      task.estimatedPomodoros > 0 &&
      task.completedAt &&
      actualMap.has(task.id)
    ) {
      const actual = actualMap.get(task.id)!;
      samples.push({
        ratio: actual / task.estimatedPomodoros,
        completedAt: task.completedAt,
      });
    }
  }

  // Need at least 3 samples for meaningful accuracy
  if (samples.length < 3) return null;

  // Sort by completion date for trend analysis
  samples.sort((a, b) => a.completedAt.localeCompare(b.completedAt));

  // Compute overall accuracy
  const avgError =
    samples.reduce((sum, s) => sum + Math.abs(s.ratio - 1.0), 0) /
    samples.length;
  const accuracyPercent = Math.round(
    Math.max(0, Math.min(100, (1 - avgError) * 100))
  );

  // Compute trend: compare first half vs second half accuracy
  const mid = Math.floor(samples.length / 2);
  const firstHalfError =
    samples.slice(0, mid).reduce((sum, s) => sum + Math.abs(s.ratio - 1.0), 0) / mid;
  const secondHalfError =
    samples.slice(mid).reduce((sum, s) => sum + Math.abs(s.ratio - 1.0), 0) /
    (samples.length - mid);

  let trend: "improving" | "declining" | "stable" = "stable";
  if (secondHalfError < firstHalfError - 0.1) trend = "improving";
  else if (secondHalfError > firstHalfError + 0.1) trend = "declining";

  // Build TDAH-friendly message
  let message: string;
  if (accuracyPercent >= 80) {
    message = `Tes estimations sont precises a ${accuracyPercent}% !`;
  } else if (accuracyPercent >= 60) {
    message = `Tes estimations sont precises a ${accuracyPercent}%. L'IA s'ameliore !`;
  } else {
    message = `Precision : ${accuracyPercent}%. L'IA apprend de tes habitudes.`;
  }

  if (trend === "improving") {
    message += " En progression !";
  }

  return {
    accuracyPercent,
    sampleSize: samples.length,
    trend,
    message,
  };
}
