import { describe, it, expect } from "vitest";
import type { Task } from "@/types/task";
import type { PomodoroSession } from "@/types/timer";
import { buildCalibrationData } from "../calibration";
import { parseJsonResponse } from "../providers";

// ── Helpers ──────────────────────────────────────────

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

function makeSession(
  overrides: Partial<PomodoroSession> = {}
): PomodoroSession {
  return {
    id: crypto.randomUUID(),
    startTime: new Date().toISOString(),
    duration: 25 * 60,
    completedAt: new Date().toISOString(),
    type: "focus",
    ...overrides,
  };
}

// ── buildCalibrationData ─────────────────────────────

describe("buildCalibrationData", () => {
  it("returns cold start for empty data", () => {
    const result = buildCalibrationData([], []);
    expect(result.sampleSize).toBe(0);
    expect(result.averageRatio).toBe(1.0);
    expect(result.accuracyPercent).toBe(0);
    expect(result.promptContext).toContain("Pas d'historique");
  });

  it("returns cold start when no tasks match", () => {
    const tasks = [makeTask({ status: "todo", estimatedPomodoros: 3 })];
    const sessions = [makeSession()];
    const result = buildCalibrationData(tasks, sessions);
    expect(result.sampleSize).toBe(0);
  });

  it("calculates ratio correctly for matched tasks", () => {
    const taskId = "task-1";
    const tasks = [
      makeTask({
        id: taskId,
        status: "done",
        estimatedPomodoros: 2,
      }),
    ];
    const sessions = [
      makeSession({ linkedTaskId: taskId }),
      makeSession({ linkedTaskId: taskId }),
      makeSession({ linkedTaskId: taskId }),
    ];
    const result = buildCalibrationData(tasks, sessions);
    expect(result.sampleSize).toBe(1);
    // actual=3, estimated=2, ratio=1.5
    expect(result.averageRatio).toBe(1.5);
  });

  it("includes examples in prompt context", () => {
    const taskId = "task-1";
    const tasks = [
      makeTask({
        id: taskId,
        title: "Design UI",
        status: "done",
        estimatedPomodoros: 3,
      }),
    ];
    const sessions = [
      makeSession({ linkedTaskId: taskId }),
      makeSession({ linkedTaskId: taskId }),
      makeSession({ linkedTaskId: taskId }),
    ];
    const result = buildCalibrationData(tasks, sessions);
    expect(result.promptContext).toContain("Design UI");
    expect(result.promptContext).toContain("estime 3");
    expect(result.promptContext).toContain("reel 3");
  });

  it("detects under-estimation", () => {
    const tasks = [
      makeTask({ id: "t1", status: "done", estimatedPomodoros: 1 }),
    ];
    const sessions = [
      makeSession({ linkedTaskId: "t1" }),
      makeSession({ linkedTaskId: "t1" }),
      makeSession({ linkedTaskId: "t1" }),
    ];
    const result = buildCalibrationData(tasks, sessions);
    // ratio = 3/1 = 3.0 → average > 1.15
    expect(result.promptContext).toContain("trop basses");
  });

  it("detects over-estimation", () => {
    const tasks = [
      makeTask({ id: "t1", status: "done", estimatedPomodoros: 5 }),
    ];
    const sessions = [
      makeSession({ linkedTaskId: "t1" }),
    ];
    const result = buildCalibrationData(tasks, sessions);
    // ratio = 1/5 = 0.2 → average < 0.85
    expect(result.promptContext).toContain("trop hautes");
  });

  it("limits to 5 most recent examples", () => {
    const tasks = Array.from({ length: 8 }, (_, i) =>
      makeTask({
        id: `t${i}`,
        title: `Task ${i}`,
        status: "done",
        estimatedPomodoros: 2,
      })
    );
    const sessions = tasks.flatMap((t) => [
      makeSession({ linkedTaskId: t.id }),
      makeSession({ linkedTaskId: t.id }),
    ]);
    const result = buildCalibrationData(tasks, sessions);
    expect(result.sampleSize).toBe(8);
    // Only 5 examples in the prompt
    const exampleLines = result.promptContext
      .split("\n")
      .filter((l) => l.startsWith("- "));
    expect(exampleLines.length).toBe(5);
  });
});

// ── parseJsonResponse ───────────────────────────────

describe("parseJsonResponse", () => {
  it("parses raw JSON", () => {
    const result = parseJsonResponse('{"name": "test"}');
    expect(result).toEqual({ name: "test" });
  });

  it("parses markdown-wrapped JSON", () => {
    const text = 'Some text\n```json\n{"name": "test"}\n```\nMore text';
    const result = parseJsonResponse(text);
    expect(result).toEqual({ name: "test" });
  });

  it("parses markdown block without json tag", () => {
    const text = '```\n{"name": "test"}\n```';
    const result = parseJsonResponse(text);
    expect(result).toEqual({ name: "test" });
  });

  it("throws on invalid JSON", () => {
    expect(() => parseJsonResponse("not json at all")).toThrow(
      "Impossible de parser"
    );
  });

  it("handles nested objects", () => {
    const json = '{"tasks": [{"title": "A", "priority": "haute"}]}';
    const result = parseJsonResponse<{ tasks: { title: string }[] }>(json);
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0].title).toBe("A");
  });
});
