import { describe, it, expect } from "vitest";
import { computeNextOccurrence, getRecurrenceLabel } from "../recurrence";
import type { TaskRecurrence } from "@/types/task";

describe("computeNextOccurrence", () => {
  it("daily: returns next day", () => {
    const from = new Date("2025-06-10T10:00:00Z");
    const next = computeNextOccurrence({ type: "daily" }, from);
    expect(new Date(next).getDate()).toBe(11);
  });

  it("weekly with daysOfWeek: finds next matching day", () => {
    // Wednesday June 11
    const from = new Date("2025-06-11T10:00:00Z");
    // Days: Mon(1), Fri(5)
    const rec: TaskRecurrence = { type: "weekly", daysOfWeek: [1, 5] };
    const next = computeNextOccurrence(rec, from);
    // Should pick Friday (day 5, 2 days ahead)
    expect(new Date(next).getDay()).toBe(5);
  });

  it("weekly with daysOfWeek: wraps to next week", () => {
    // Saturday June 14
    const from = new Date("2025-06-14T10:00:00Z");
    const rec: TaskRecurrence = { type: "weekly", daysOfWeek: [1, 3] };
    const next = computeNextOccurrence(rec, from);
    // Should wrap to Monday (day 1)
    expect(new Date(next).getDay()).toBe(1);
  });

  it("weekly with no daysOfWeek: adds 7 days", () => {
    const from = new Date("2025-06-10T10:00:00Z");
    const next = computeNextOccurrence({ type: "weekly" }, from);
    expect(new Date(next).getDate()).toBe(17);
  });

  it("custom: uses interval", () => {
    const from = new Date("2025-06-10T10:00:00Z");
    const next = computeNextOccurrence({ type: "custom", interval: 3 }, from);
    expect(new Date(next).getDate()).toBe(13);
  });

  it("custom: defaults to 1 day if no interval", () => {
    const from = new Date("2025-06-10T10:00:00Z");
    const next = computeNextOccurrence({ type: "custom" }, from);
    expect(new Date(next).getDate()).toBe(11);
  });
});

describe("getRecurrenceLabel", () => {
  it("daily", () => {
    expect(getRecurrenceLabel({ type: "daily" })).toBe("Quotidien");
  });

  it("weekly with days", () => {
    expect(getRecurrenceLabel({ type: "weekly", daysOfWeek: [1, 3, 5] })).toBe(
      "Lu, Me, Ve"
    );
  });

  it("weekly no days", () => {
    expect(getRecurrenceLabel({ type: "weekly" })).toBe("Hebdo");
  });

  it("custom 1 day", () => {
    expect(getRecurrenceLabel({ type: "custom", interval: 1 })).toBe(
      "Chaque jour"
    );
  });

  it("custom N days", () => {
    expect(getRecurrenceLabel({ type: "custom", interval: 3 })).toBe(
      "Tous les 3j"
    );
  });
});
