import type { AnalysisResult, Memory, PlannedAction } from "./types";
import { assessRisk, diffActions } from "./diff";

export const DEMO_MEMORIES: Memory[] = [
  { id: "mem-morning", content: "The user prefers morning meetings when timing is flexible.", source: "Project preferences", createdAt: "2026-08-10", score: 0.96 },
  { id: "mem-urgent", content: "Hackathon work is urgent until the August 15 submission deadline.", source: "Hackathon planning", createdAt: "2026-08-12", score: 0.89 },
  { id: "mem-remote", content: "Project review meetings should use Google Meet.", source: "Team setup", createdAt: "2026-08-11", score: 0.82 },
];

const remembered: PlannedAction = {
  tool: "create_calendar_event",
  arguments: { title: "Project review", date: "2026-08-15", time: "09:00", duration_minutes: 30, location: "Google Meet" },
  rationale: "The morning preference shifted the event to the next available morning slot.",
};

const amnesiac: PlannedAction = {
  tool: "create_calendar_event",
  arguments: { title: "Project review", date: "2026-08-14", time: "15:00", duration_minutes: 30, location: "Google Meet" },
  rationale: "Without personal memory, the earliest available slot was selected.",
};

export function createDemoAnalysis(instruction: string): AnalysisResult {
  const normalized = instruction.toLowerCase();
  const noDivergence = normalized.includes("without preference") || normalized.includes("ignore memory");
  const control = noDivergence ? remembered : amnesiac;
  const diffs = diffActions(remembered, control);
  return {
    id: crypto.randomUUID(), instruction, remembered, amnesiac: control,
    diverged: diffs.some((diff) => diff.changed), risk: assessRisk(diffs), diffs,
    attribution: noDivergence ? null : {
      memory: DEMO_MEMORIES[0], confidence: 0.94,
      explanation: "Removing this memory makes the remembering agent choose the same earliest slot as its amnesiac twin.",
    },
    memoriesConsidered: DEMO_MEMORIES, mode: "demo", durationMs: 1240,
  };
}
