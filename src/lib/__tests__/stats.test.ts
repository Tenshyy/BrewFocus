import { describe, it, expect } from "vitest";
import type { PomodoroSession } from "@/types/timer";
import type { Task, Project } from "@/types/task";
import {
  computeStreak,
  computeWeeklyChart,
  computeTotalFocus,
  computePersonalBests,
  computeTaskStats,
  computeHeatmap,
  computeTimeTracking,
  computeEstimationAccuracy,
  toDateKey,
} from "../stats";

// ── Helpers ──────────────────────────────────────────

function makeSession(
  overrides: Partial<PomodoroSession> & { daysAgo?: number } = {}
): PomodoroSession {
  const { daysAgo = 0, ...rest } = overrides;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    id: crypto.randomUUID(),
    startTime: date.toISOString(),
    duration: 25 * 60,
    completedAt: date.toISOString(),
    type: "focus",
    ...rest,
  };
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    title: "Test task",
    category: "travail",
    priority: "moyenne",
    status: "todo",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: crypto.randomUUID(),
    name: "Test Project",
    color: "#E07A3A",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ── computeStreak ────────────────────────────────────

describe("computeStreak", () => {
  it("returns 0 for empty sessions", () => {
    expect(computeStreak([])).toBe(0);
  });

  it("returns 1 for a session today", () => {
    const sessions = [makeSession({ daysAgo: 0 })];
    expect(computeStreak(sessions)).toBe(1);
  });

  it("returns 1 for a session yesterday (today not yet done)", () => {
    const sessions = [makeSession({ daysAgo: 1 })];
    expect(computeStreak(sessions)).toBe(1);
  });

  it("counts consecutive days", () => {
    const sessions = [
      makeSession({ daysAgo: 0 }),
      makeSession({ daysAgo: 1 }),
      makeSession({ daysAgo: 2 }),
    ];
    expect(computeStreak(sessions)).toBe(3);
  });

  it("stops at gap", () => {
    const sessions = [
      makeSession({ daysAgo: 0 }),
      makeSession({ daysAgo: 1 }),
      // gap on day 2
      makeSession({ daysAgo: 3 }),
    ];
    expect(computeStreak(sessions)).toBe(2);
  });

  it("ignores break sessions", () => {
    const sessions = [makeSession({ daysAgo: 0, type: "break" })];
    expect(computeStreak(sessions)).toBe(0);
  });

  it("ignores sessions without completedAt", () => {
    const sessions = [makeSession({ daysAgo: 0, completedAt: undefined })];
    expect(computeStreak(sessions)).toBe(0);
  });
});

// ── computeWeeklyChart ──────────────────────────────

describe("computeWeeklyChart", () => {
  it("returns 7 days for empty sessions", () => {
    const result = computeWeeklyChart([]);
    expect(result).toHaveLength(7);
    result.forEach((d) => expect(d.count).toBe(0));
  });

  it("marks today correctly", () => {
    const result = computeWeeklyChart([]);
    const todayEntry = result.find((d) => d.isToday);
    expect(todayEntry).toBeDefined();
    expect(todayEntry!.dateKey).toBe(toDateKey(new Date().toISOString()));
  });

  it("counts sessions on correct days", () => {
    const sessions = [
      makeSession({ daysAgo: 0 }),
      makeSession({ daysAgo: 0 }),
      makeSession({ daysAgo: 1 }),
    ];
    const result = computeWeeklyChart(sessions);
    const today = result.find((d) => d.isToday);
    expect(today!.count).toBe(2);

    const yesterday = result[result.length - 2];
    expect(yesterday.count).toBe(1);
  });

  it("ignores break sessions", () => {
    const sessions = [makeSession({ daysAgo: 0, type: "break" })];
    const result = computeWeeklyChart(sessions);
    const today = result.find((d) => d.isToday);
    expect(today!.count).toBe(0);
  });
});

// ── computeTotalFocus ───────────────────────────────

describe("computeTotalFocus", () => {
  it("returns zeros for empty sessions", () => {
    const { totalSessions, totalHours } = computeTotalFocus([]);
    expect(totalSessions).toBe(0);
    expect(totalHours).toBe(0);
  });

  it("sums focus sessions only", () => {
    const sessions = [
      makeSession({ duration: 25 * 60 }),
      makeSession({ duration: 25 * 60 }),
      makeSession({ type: "break", duration: 5 * 60 }),
    ];
    const { totalSessions, totalHours } = computeTotalFocus(sessions);
    expect(totalSessions).toBe(2);
    // 2 * 25 min = 50 min ≈ 0.8h
    expect(totalHours).toBe(0.8);
  });

  it("ignores sessions without completedAt", () => {
    const sessions = [
      makeSession({ duration: 25 * 60 }),
      makeSession({ duration: 25 * 60, completedAt: undefined }),
    ];
    const { totalSessions } = computeTotalFocus(sessions);
    expect(totalSessions).toBe(1);
  });
});

// ── computePersonalBests ─────────────────────────────

describe("computePersonalBests", () => {
  it("returns empty for no data", () => {
    expect(computePersonalBests([], [])).toHaveLength(0);
  });

  it("finds best day", () => {
    const sessions = [
      makeSession({ daysAgo: 0 }),
      makeSession({ daysAgo: 0 }),
      makeSession({ daysAgo: 0 }),
      makeSession({ daysAgo: 1 }),
    ];
    const bests = computePersonalBests(sessions, []);
    const bestDay = bests.find((b) => b.label === "Meilleur jour");
    expect(bestDay).toBeDefined();
    expect(bestDay!.value).toBe("3");
  });

  it("finds longest streak", () => {
    const sessions = [
      makeSession({ daysAgo: 0 }),
      makeSession({ daysAgo: 1 }),
      makeSession({ daysAgo: 2 }),
    ];
    const bests = computePersonalBests(sessions, []);
    const streak = bests.find((b) => b.label === "Plus long streak");
    expect(streak).toBeDefined();
    expect(streak!.value).toBe("3");
  });

  it("finds most tasks in a day", () => {
    const today = new Date().toISOString();
    const tasks = [
      makeTask({ status: "done", completedAt: today }),
      makeTask({ status: "done", completedAt: today }),
    ];
    const bests = computePersonalBests([], tasks);
    const taskBest = bests.find((b) => b.label === "Taches en 1 jour");
    expect(taskBest).toBeDefined();
    expect(taskBest!.value).toBe("2");
  });
});

// ── computeTaskStats ────────────────────────────────

describe("computeTaskStats", () => {
  it("returns zeros for empty", () => {
    const result = computeTaskStats([]);
    expect(result.total).toBe(0);
    expect(result.done).toBe(0);
    expect(result.rate).toBe(0);
    expect(result.categories).toHaveLength(0);
  });

  it("calculates completion rate", () => {
    const tasks = [
      makeTask({ status: "done" }),
      makeTask({ status: "done" }),
      makeTask({ status: "todo" }),
    ];
    const { total, done, rate } = computeTaskStats(tasks);
    expect(total).toBe(3);
    expect(done).toBe(2);
    expect(rate).toBe(67);
  });

  it("counts categories", () => {
    const tasks = [
      makeTask({ category: "travail" }),
      makeTask({ category: "travail" }),
      makeTask({ category: "perso" }),
    ];
    const { categories } = computeTaskStats(tasks);
    expect(categories).toHaveLength(2);
    expect(categories[0].category).toBe("travail");
    expect(categories[0].count).toBe(2);
    expect(categories[1].category).toBe("perso");
    expect(categories[1].count).toBe(1);
  });

  it("sorts categories by count descending", () => {
    const tasks = [
      makeTask({ category: "perso" }),
      makeTask({ category: "travail" }),
      makeTask({ category: "travail" }),
      makeTask({ category: "travail" }),
    ];
    const { categories } = computeTaskStats(tasks);
    expect(categories[0].count).toBeGreaterThanOrEqual(categories[1].count);
  });
});

// ── computeHeatmap ──────────────────────────────────

describe("computeHeatmap", () => {
  it("returns data for empty sessions", () => {
    const result = computeHeatmap([]);
    expect(result.weeks.length).toBeGreaterThan(0);
    expect(result.totalDays).toBe(0);
    expect(result.maxCount).toBe(0);
  });

  it("marks future days with count -1", () => {
    const result = computeHeatmap([]);
    const today = toDateKey(new Date().toISOString());
    const allDays = result.weeks.flatMap((w) => w.days);
    const futureDays = allDays.filter((d) => d.dateKey > today);
    futureDays.forEach((d) => expect(d.count).toBe(-1));
  });

  it("counts sessions correctly", () => {
    const sessions = [
      makeSession({ daysAgo: 0 }),
      makeSession({ daysAgo: 0 }),
      makeSession({ daysAgo: 0 }),
    ];
    const result = computeHeatmap(sessions);
    expect(result.totalDays).toBe(1);
    expect(result.maxCount).toBe(3);
  });

  it("assigns intensity levels", () => {
    const sessions = [
      makeSession({ daysAgo: 0 }),
    ];
    const result = computeHeatmap(sessions);
    const today = toDateKey(new Date().toISOString());
    const allDays = result.weeks.flatMap((w) => w.days);
    const todayDay = allDays.find((d) => d.dateKey === today);
    expect(todayDay!.intensity).toBeGreaterThan(0);
  });

  it("generates month labels", () => {
    const result = computeHeatmap([]);
    expect(result.monthLabels.length).toBeGreaterThan(0);
  });
});

// ── computeTimeTracking ─────────────────────────────

describe("computeTimeTracking", () => {
  it("returns empty for no data", () => {
    const result = computeTimeTracking([], [], []);
    expect(result.byTask).toHaveLength(0);
    expect(result.byProject).toHaveLength(0);
    expect(result.unlinkedCount).toBe(0);
    expect(result.unlinkedMinutes).toBe(0);
  });

  it("tracks linked sessions", () => {
    const task = makeTask({ id: "task-1" });
    const sessions = [
      makeSession({ linkedTaskId: "task-1", duration: 25 * 60 }),
      makeSession({ linkedTaskId: "task-1", duration: 25 * 60 }),
    ];
    const result = computeTimeTracking(sessions, [task], []);
    expect(result.byTask).toHaveLength(1);
    expect(result.byTask[0].pomodoroCount).toBe(2);
    expect(result.byTask[0].totalMinutes).toBe(50);
  });

  it("counts unlinked sessions", () => {
    const sessions = [
      makeSession({ duration: 25 * 60 }),
      makeSession({ duration: 25 * 60 }),
    ];
    const result = computeTimeTracking(sessions, [], []);
    expect(result.unlinkedCount).toBe(2);
    expect(result.unlinkedMinutes).toBe(50);
  });

  it("aggregates by project", () => {
    const proj = makeProject({ id: "proj-1" });
    const task = makeTask({ id: "task-1", projectId: "proj-1" });
    const sessions = [
      makeSession({ linkedTaskId: "task-1", duration: 25 * 60 }),
    ];
    const result = computeTimeTracking(sessions, [task], [proj]);
    expect(result.byProject).toHaveLength(1);
    expect(result.byProject[0].projectName).toBe("Test Project");
    expect(result.byProject[0].pomodoroCount).toBe(1);
  });
});

// ── computeEstimationAccuracy ───────────────────────

describe("computeEstimationAccuracy", () => {
  it("returns null for less than 3 samples", () => {
    const tasks = [
      makeTask({ id: "t1", status: "done", completedAt: new Date().toISOString(), estimatedPomodoros: 3 }),
      makeTask({ id: "t2", status: "done", completedAt: new Date().toISOString(), estimatedPomodoros: 2 }),
    ];
    const sessions = [
      makeSession({ linkedTaskId: "t1" }),
      makeSession({ linkedTaskId: "t1" }),
      makeSession({ linkedTaskId: "t1" }),
      makeSession({ linkedTaskId: "t2" }),
      makeSession({ linkedTaskId: "t2" }),
    ];
    expect(computeEstimationAccuracy(tasks, sessions)).toBeNull();
  });

  it("returns accuracy for 3+ samples", () => {
    const tasks = [
      makeTask({ id: "t1", status: "done", completedAt: "2026-01-01T10:00:00Z", estimatedPomodoros: 3 }),
      makeTask({ id: "t2", status: "done", completedAt: "2026-01-02T10:00:00Z", estimatedPomodoros: 2 }),
      makeTask({ id: "t3", status: "done", completedAt: "2026-01-03T10:00:00Z", estimatedPomodoros: 4 }),
    ];
    const sessions = [
      makeSession({ linkedTaskId: "t1" }),
      makeSession({ linkedTaskId: "t1" }),
      makeSession({ linkedTaskId: "t1" }),
      makeSession({ linkedTaskId: "t2" }),
      makeSession({ linkedTaskId: "t2" }),
      makeSession({ linkedTaskId: "t3" }),
      makeSession({ linkedTaskId: "t3" }),
      makeSession({ linkedTaskId: "t3" }),
      makeSession({ linkedTaskId: "t3" }),
    ];
    const result = computeEstimationAccuracy(tasks, sessions);
    expect(result).not.toBeNull();
    expect(result!.sampleSize).toBe(3);
    expect(result!.accuracyPercent).toBeGreaterThanOrEqual(0);
    expect(result!.accuracyPercent).toBeLessThanOrEqual(100);
    expect(["improving", "declining", "stable"]).toContain(result!.trend);
  });

  it("returns 100% accuracy for perfect estimates", () => {
    const tasks = [
      makeTask({ id: "t1", status: "done", completedAt: "2026-01-01T10:00:00Z", estimatedPomodoros: 2 }),
      makeTask({ id: "t2", status: "done", completedAt: "2026-01-02T10:00:00Z", estimatedPomodoros: 3 }),
      makeTask({ id: "t3", status: "done", completedAt: "2026-01-03T10:00:00Z", estimatedPomodoros: 1 }),
    ];
    const sessions = [
      makeSession({ linkedTaskId: "t1" }),
      makeSession({ linkedTaskId: "t1" }),
      makeSession({ linkedTaskId: "t2" }),
      makeSession({ linkedTaskId: "t2" }),
      makeSession({ linkedTaskId: "t2" }),
      makeSession({ linkedTaskId: "t3" }),
    ];
    const result = computeEstimationAccuracy(tasks, sessions);
    expect(result!.accuracyPercent).toBe(100);
  });

  it("ignores tasks without estimates", () => {
    const tasks = [
      makeTask({ id: "t1", status: "done", completedAt: "2026-01-01T10:00:00Z" }),
      makeTask({ id: "t2", status: "done", completedAt: "2026-01-02T10:00:00Z" }),
      makeTask({ id: "t3", status: "done", completedAt: "2026-01-03T10:00:00Z" }),
    ];
    const sessions = [
      makeSession({ linkedTaskId: "t1" }),
      makeSession({ linkedTaskId: "t2" }),
      makeSession({ linkedTaskId: "t3" }),
    ];
    expect(computeEstimationAccuracy(tasks, sessions)).toBeNull();
  });
});
