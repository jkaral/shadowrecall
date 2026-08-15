import { describe, expect, it } from "vitest";
import { createDemoAnalysis } from "../lib/demo";

describe("deterministic demo", () => {
  it("produces an attributed action divergence", () => {
    const result = createDemoAnalysis("Schedule the review at the earliest time");
    expect(result.diverged).toBe(true);
    expect(result.attribution?.memory.id).toBe("mem-morning");
    expect(result.diffs.filter((diff) => diff.changed)).toHaveLength(2);
    expect(result.mode).toBe("demo");
  });

  it("can demonstrate the safe no-divergence path", () => {
    const result = createDemoAnalysis("Schedule without preference");
    expect(result.diverged).toBe(false);
    expect(result.risk).toBe("none");
  });
});
