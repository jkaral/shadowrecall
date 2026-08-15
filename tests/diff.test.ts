import { describe, expect, it } from "vitest";
import { assessRisk, diffActions } from "../lib/diff";
import type { PlannedAction } from "../lib/types";

const base: PlannedAction = {
  tool: "create_calendar_event",
  arguments: { date: "2026-08-14", time: "15:00", title: "Review" },
  rationale: "Earliest slot",
};

describe("action difference engine", () => {
  it("finds no changes between identical actions", () => {
    const diffs = diffActions(base, structuredClone(base));
    expect(diffs.every((diff) => !diff.changed)).toBe(true);
    expect(assessRisk(diffs)).toBe("none");
  });

  it("flags a changed date as high risk", () => {
    const remembered = { ...base, arguments: { ...base.arguments, date: "2026-08-15" } };
    const diffs = diffActions(remembered, base);
    expect(diffs.find((diff) => diff.path === "date")?.changed).toBe(true);
    expect(assessRisk(diffs)).toBe("high");
  });

  it("detects a changed tool", () => {
    const remembered: PlannedAction = { tool: "create_task", arguments: { title: "Review" }, rationale: "Task" };
    const diffs = diffActions(remembered, base);
    expect(diffs.find((diff) => diff.path === "tool")?.changed).toBe(true);
    expect(assessRisk(diffs)).toBe("high");
  });
});
