import { describe, expect, it } from "vitest";
import { planLocally } from "../lib/planner";
import type { Memory } from "../lib/types";

const morningMemory: Memory = {
  id: "morning-preference",
  content:
    "The user prefers morning meetings when timing is flexible.",
  source: "Backboard memory",
};

describe("local structured planner", () => {
  it("selects the earliest slot without memory", () => {
    const plan = planLocally(
      "Schedule the project review for the earliest available time.",
      [],
    );

    expect(plan.tool).toBe(
      "create_calendar_event",
    );

    expect(plan.arguments.date).toBe(
      "2026-08-14",
    );

    expect(plan.arguments.time).toBe(
      "15:00",
    );
  });

  it("uses a retrieved morning preference", () => {
    const plan = planLocally(
      "Schedule the project review for the earliest available time.",
      [morningMemory],
    );

    expect(plan.arguments.date).toBe(
      "2026-08-15",
    );

    expect(plan.arguments.time).toBe(
      "09:00",
    );
  });

  it("withholds memory from the amnesiac control", () => {
    const rememberingPlan = planLocally(
      "Schedule the project review.",
      [morningMemory],
    );

    const amnesiacPlan = planLocally(
      "Schedule the project review.",
      [],
    );

    expect(rememberingPlan.arguments.time).not.toBe(
      amnesiacPlan.arguments.time,
    );
  });

  it("returns no action for unsupported instructions", () => {
    const plan = planLocally(
      "Explain the history of Toronto.",
      [],
    );

    expect(plan.tool).toBe("none");
    expect(plan.arguments).toEqual({});
  });
});