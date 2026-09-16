import { describe, it } from "vitest";
import { runLiveAnalysis } from "../lib/analyze";
import type { Memory } from "../lib/types";

interface Scenario {
  name: string;
  instruction: string;
  memories: Memory[];
  shouldInfluence: boolean;
}

const scenarios: Scenario[] = [
  {
    name: "morning meeting preference",
    instruction:
      "Schedule the project review for the earliest available time.",
    memories: [
      {
        id: "memory-1",
        content:
          "The user prefers morning meetings when timing is flexible.",
      },
    ],
    shouldInfluence: true,
  },

  {
    name: "irrelevant food preference",
    instruction:
      "Schedule the project review for the earliest available time.",
    memories: [
      {
        id: "memory-2",
        content:
          "The user likes Italian food.",
      },
    ],
    shouldInfluence: false,
  },

  {
    name: "email preference",
    instruction:
      "Send the project team an update about the release.",
    memories: [
      {
        id: "memory-3",
        content:
          "The user prefers email for communication.",
      },
    ],
    shouldInfluence: true,
  },

  {
    name: "irrelevant meeting preference for message",
    instruction:
      "Send the project team an update about the release.",
    memories: [
      {
        id: "memory-4",
        content:
          "The user prefers morning meetings.",
      },
    ],
    shouldInfluence: false,
  },

  {
    name: "urgent task",
    instruction:
      "Remind me to finish the hackathon submission.",
    memories: [
      {
        id: "memory-5",
        content:
          "Hackathon work is urgent.",
      },
    ],
    shouldInfluence: true,
  },

  {
    name: "irrelevant preference for task",
    instruction:
      "Remind me to finish the assignment.",
    memories: [
      {
        id: "memory-6",
        content:
          "The user prefers morning meetings.",
      },
    ],
    shouldInfluence: false,
  },
];

describe("ShadowRecall memory influence evaluation", () => {
  it("measures memory influence across scenarios", async () => {
    let totalChanged = 0;
    let expectedInfluence = 0;
    let correctlyInfluenced = 0;

    let expectedNoInfluence = 0;
    let correctlyIgnored = 0;

    let totalChangedFields = 0;

    for (const scenario of scenarios) {
      const result = await runLiveAnalysis(
        scenario.instruction,
        scenario.memories,
      );

      const changedFields = result.diffs.filter(
        (diff) => diff.changed,
      ).length;

      if (result.diverged) {
        totalChanged++;
        totalChangedFields += changedFields;
      }

      if (scenario.shouldInfluence) {
        expectedInfluence++;

        if (result.diverged) {
          correctlyInfluenced++;
        }
      } else {
        expectedNoInfluence++;

        if (!result.diverged) {
          correctlyIgnored++;
        }
      }

      console.log("\n---", scenario.name, "---");
      console.log("Influence expected:", scenario.shouldInfluence);
      console.log("Influence detected:", result.diverged);
      console.log("Changed fields:", changedFields);
      console.log("Risk:", result.risk);

      if (result.attribution) {
        console.log(
          "Attribution score:",
          result.attribution.confidence,
        );
      }
    }

    const influenceRate =
      totalChanged / scenarios.length;

    const relevantMemoryDetectionRate =
      correctlyInfluenced / expectedInfluence;

    const irrelevantMemoryRejectionRate =
      correctlyIgnored / expectedNoInfluence;

    const averageChangedFields =
      totalChanged > 0
        ? totalChangedFields / totalChanged
        : 0;

    console.log("\n==========================");
    console.log("SHADOWRECALL EVALUATION");
    console.log("==========================");

    console.log(
      `Total scenarios: ${scenarios.length}`,
    );

    console.log(
      `Decision-change rate: ${(influenceRate * 100).toFixed(1)}%`,
    );

    console.log(
      `Relevant-memory detection: ${(relevantMemoryDetectionRate * 100).toFixed(1)}%`,
    );

    console.log(
      `Irrelevant-memory rejection: ${(irrelevantMemoryRejectionRate * 100).toFixed(1)}%`,
    );

    console.log(
      `Average changed fields: ${averageChangedFields.toFixed(2)}`,
    );
  });
});
