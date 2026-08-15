import { searchMemories } from "./backboard";
import { assessRisk, diffActions } from "./diff";
import { planLocally } from "./planner";
import type {
  AnalysisResult,
  Attribution,
  Memory,
} from "./types";

export async function runLiveAnalysis(
  instruction: string,
  suppliedMemories?: Memory[],
): Promise<AnalysisResult> {
  const started = Date.now();

  const memories =
    suppliedMemories && suppliedMemories.length > 0
      ? suppliedMemories
      : await searchMemories(instruction);

  const remembered = planLocally(
    instruction,
    memories,
  );

  const amnesiac = planLocally(
    instruction,
    [],
  );

  const diffs = diffActions(
    remembered,
    amnesiac,
  );

  const changedDiffs = diffs.filter(
    (diff) => diff.changed,
  );

  const diverged = changedDiffs.length > 0;

  let attribution: Attribution | null = null;

  if (diverged && memories.length > 0) {
    const baselineChangedFields =
      changedDiffs.length;

    const candidates = memories.map(
      (memory) => {
        const remainingMemories =
          memories.filter(
            (candidate) =>
              candidate.id !== memory.id,
          );

        const counterfactualPlan =
          planLocally(
            instruction,
            remainingMemories,
          );

        const remainingDifferences =
          diffActions(
            counterfactualPlan,
            amnesiac,
          ).filter(
            (diff) => diff.changed,
          ).length;

        const improvement = Math.max(
          0,
          baselineChangedFields -
            remainingDifferences,
        );

        return {
          memory,
          improvement,
        };
      },
    );

    const strongestCandidate =
      candidates.sort(
        (first, second) =>
          second.improvement -
          first.improvement,
      )[0];

    if (
      strongestCandidate &&
      strongestCandidate.improvement > 0
    ) {
      attribution = {
        memory: strongestCandidate.memory,
        confidence: Math.min(
          1,
          strongestCandidate.improvement /
            baselineChangedFields,
        ),
        explanation:
          `Removing this memory eliminated ` +
          `${strongestCandidate.improvement} of ` +
          `${baselineChangedFields} changed action fields.`,
      };
    }
  }

  return {
    id: crypto.randomUUID(),
    instruction,
    remembered,
    amnesiac,
    diverged,
    risk: assessRisk(diffs),
    diffs,
    attribution,
    memoriesConsidered: memories,
    mode: "live",
    durationMs: Date.now() - started,
  };
}