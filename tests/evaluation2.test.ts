import { describe, it } from "vitest";
import { runLiveAnalysis } from "../lib/analyze";
import type { Memory } from "../lib/types";

type Category =
  | "paraphrase"
  | "context-mismatch";

type Subcategory =
  | "morning"
  | "email"
  | "urgency"
  | "remote";

interface Scenario {
  name: string;
  category: Category;
  subcategory: Subcategory;
  instruction: string;
  memories: Memory[];
  shouldInfluence: boolean;
}

const scenarios: Scenario[] = [

  // ==================================================
  // PARAPHRASE TESTS
  // Relevant memories expressed in unfamiliar wording.
  // These SHOULD influence the action.
  // 20 total
  // ==================================================

  // ---------------- MORNING: 5 ----------------

  {
    name: "morning paraphrase - before noon",
    category: "paraphrase",
    subcategory: "morning",
    instruction:
      "Schedule the project review for the earliest available time.",
    memories: [
      {
        id: "p-morning-1",
        content:
          "The user likes meetings before noon whenever possible.",
      },
    ],
    shouldInfluence: true,
  },

  {
    name: "morning paraphrase - early day",
    category: "paraphrase",
    subcategory: "morning",
    instruction:
      "Schedule the team review.",
    memories: [
      {
        id: "p-morning-2",
        content:
          "The user generally likes appointments earlier in the day.",
      },
    ],
    shouldInfluence: true,
  },

  {
    name: "morning paraphrase - first half of day",
    category: "paraphrase",
    subcategory: "morning",
    instruction:
      "Schedule the project meeting.",
    memories: [
      {
        id: "p-morning-3",
        content:
          "The first half of the day works best for meetings.",
      },
    ],
    shouldInfluence: true,
  },

  {
    name: "morning paraphrase - avoids afternoons",
    category: "paraphrase",
    subcategory: "morning",
    instruction:
      "Schedule the project review.",
    memories: [
      {
        id: "p-morning-4",
        content:
          "The user tries to avoid afternoon meetings.",
      },
    ],
    shouldInfluence: true,
  },

  {
    name: "morning paraphrase - early meetings",
    category: "paraphrase",
    subcategory: "morning",
    instruction:
      "Schedule a review with the project team.",
    memories: [
      {
        id: "p-morning-5",
        content:
          "Early meetings usually work better for the user.",
      },
    ],
    shouldInfluence: true,
  },

  // ---------------- EMAIL: 5 ----------------

  {
    name: "email paraphrase - preferred channel",
    category: "paraphrase",
    subcategory: "email",
    instruction:
      "Send the project team an update.",
    memories: [
      {
        id: "p-email-1",
        content:
          "Email is the user's preferred communication channel.",
      },
    ],
    shouldInfluence: true,
  },

  {
    name: "email paraphrase - likes messages by email",
    category: "paraphrase",
    subcategory: "email",
    instruction:
      "Message the project team about the release.",
    memories: [
      {
        id: "p-email-2",
        content:
          "The user likes receiving important messages by email.",
      },
    ],
    shouldInfluence: true,
  },

  {
    name: "email paraphrase - electronic mail",
    category: "paraphrase",
    subcategory: "email",
    instruction:
      "Notify the team that the build is ready.",
    memories: [
      {
        id: "p-email-3",
        content:
          "Electronic mail is usually the best way to contact the user.",
      },
    ],
    shouldInfluence: true,
  },

  {
    name: "email paraphrase - avoids in-app messages",
    category: "paraphrase",
    subcategory: "email",
    instruction:
      "Send the project team the latest results.",
    memories: [
      {
        id: "p-email-4",
        content:
          "The user generally avoids in-app messages when possible.",
      },
    ],
    shouldInfluence: true,
  },

  {
    name: "email paraphrase - inbox communication",
    category: "paraphrase",
    subcategory: "email",
    instruction:
      "Tell the project team about the schedule change.",
    memories: [
      {
        id: "p-email-5",
        content:
          "The user would rather receive communications through their inbox.",
      },
    ],
    shouldInfluence: true,
  },

  // ---------------- URGENCY: 5 ----------------

  {
    name: "urgency paraphrase - hackathon urgent",
    category: "paraphrase",
    subcategory: "urgency",
    instruction:
      "Remind me to finish the hackathon submission.",
    memories: [
      {
        id: "p-urgency-1",
        content:
          "The hackathon submission needs to be completed urgently.",
      },
    ],
    shouldInfluence: true,
  },

  {
    name: "urgency paraphrase - top priority",
    category: "paraphrase",
    subcategory: "urgency",
    instruction:
      "Create a task to finish the hackathon project.",
    memories: [
      {
        id: "p-urgency-2",
        content:
          "Finishing the hackathon project is currently the user's top priority.",
      },
    ],
    shouldInfluence: true,
  },

  {
    name: "urgency paraphrase - deadline approaching",
    category: "paraphrase",
    subcategory: "urgency",
    instruction:
      "Remind me to complete the hackathon presentation.",
    memories: [
      {
        id: "p-urgency-3",
        content:
          "The hackathon deadline is approaching quickly.",
      },
    ],
    shouldInfluence: true,
  },

  {
    name: "urgency paraphrase - needs immediate attention",
    category: "paraphrase",
    subcategory: "urgency",
    instruction:
      "Create a task to fix the hackathon demo.",
    memories: [
      {
        id: "p-urgency-4",
        content:
          "The hackathon demo needs immediate attention.",
      },
    ],
    shouldInfluence: true,
  },

  {
    name: "urgency paraphrase - most important work",
    category: "paraphrase",
    subcategory: "urgency",
    instruction:
      "Remind me to finish the hackathon code.",
    memories: [
      {
        id: "p-urgency-5",
        content:
          "Hackathon work is the most important work right now.",
      },
    ],
    shouldInfluence: true,
  },

  // ---------------- REMOTE: 5 ----------------

  {
    name: "remote paraphrase - virtual meetings",
    category: "paraphrase",
    subcategory: "remote",
    instruction:
      "Schedule the project review.",
    memories: [
      {
        id: "p-remote-1",
        content:
          "The user generally prefers virtual meetings.",
      },
    ],
    shouldInfluence: true,
  },

  {
    name: "remote paraphrase - video call",
    category: "paraphrase",
    subcategory: "remote",
    instruction:
      "Schedule the team meeting.",
    memories: [
      {
        id: "p-remote-2",
        content:
          "The user would rather meet over video call than in person.",
      },
    ],
    shouldInfluence: true,
  },

  {
    name: "remote paraphrase - online meetings",
    category: "paraphrase",
    subcategory: "remote",
    instruction:
      "Schedule the project review.",
    memories: [
      {
        id: "p-remote-3",
        content:
          "Online meetings are usually more convenient for the user.",
      },
    ],
    shouldInfluence: true,
  },

  {
    name: "remote paraphrase - avoid meeting rooms",
    category: "paraphrase",
    subcategory: "remote",
    instruction:
      "Schedule a meeting with the project team.",
    memories: [
      {
        id: "p-remote-4",
        content:
          "The user generally avoids physical meeting rooms.",
      },
    ],
    shouldInfluence: true,
  },

  {
    name: "remote paraphrase - meet from home",
    category: "paraphrase",
    subcategory: "remote",
    instruction:
      "Schedule the team review.",
    memories: [
      {
        id: "p-remote-5",
        content:
          "The user usually likes to join meetings from home.",
      },
    ],
    shouldInfluence: true,
  },

  // ==================================================
  // CONTEXT-MISMATCH TESTS
  // Memories contain relevant-looking concepts,
  // but apply to the wrong situation.
  // These SHOULD NOT influence the action.
  // 20 total
  // ==================================================

  // ---------------- MORNING: 5 ----------------

  {
    name: "morning mismatch - family meetings",
    category: "context-mismatch",
    subcategory: "morning",
    instruction:
      "Schedule the project review.",
    memories: [
      {
        id: "c-morning-1",
        content:
          "The user prefers morning meetings with family members.",
      },
    ],
    shouldInfluence: false,
  },

  {
    name: "morning mismatch - doctor appointments",
    category: "context-mismatch",
    subcategory: "morning",
    instruction:
      "Schedule the team review.",
    memories: [
      {
        id: "c-morning-2",
        content:
          "The user prefers morning meetings for medical appointments.",
      },
    ],
    shouldInfluence: false,
  },

  {
    name: "morning mismatch - weekend club",
    category: "context-mismatch",
    subcategory: "morning",
    instruction:
      "Schedule the project review.",
    memories: [
      {
        id: "c-morning-3",
        content:
          "The user prefers morning meetings for their weekend club.",
      },
    ],
    shouldInfluence: false,
  },

  {
    name: "morning mismatch - tutoring",
    category: "context-mismatch",
    subcategory: "morning",
    instruction:
      "Schedule the project meeting.",
    memories: [
      {
        id: "c-morning-4",
        content:
          "The user prefers morning meetings with tutoring students.",
      },
    ],
    shouldInfluence: false,
  },

  {
    name: "morning mismatch - personal trainer",
    category: "context-mismatch",
    subcategory: "morning",
    instruction:
      "Schedule a review with the software team.",
    memories: [
      {
        id: "c-morning-5",
        content:
          "The user prefers morning meetings with their personal trainer.",
      },
    ],
    shouldInfluence: false,
  },

  // ---------------- EMAIL: 5 ----------------

  {
    name: "email mismatch - professors",
    category: "context-mismatch",
    subcategory: "email",
    instruction:
      "Send the project team an update.",
    memories: [
      {
        id: "c-email-1",
        content:
          "The user prefers email when communicating with professors.",
      },
    ],
    shouldInfluence: false,
  },

  {
    name: "email mismatch - customer support",
    category: "context-mismatch",
    subcategory: "email",
    instruction:
      "Notify the project team about the release.",
    memories: [
      {
        id: "c-email-2",
        content:
          "The user prefers email when contacting customer support.",
      },
    ],
    shouldInfluence: false,
  },

  {
    name: "email mismatch - school administration",
    category: "context-mismatch",
    subcategory: "email",
    instruction:
      "Send the development team the results.",
    memories: [
      {
        id: "c-email-3",
        content:
          "The user prefers email for messages to school administration.",
      },
    ],
    shouldInfluence: false,
  },

  {
    name: "email mismatch - formal applications",
    category: "context-mismatch",
    subcategory: "email",
    instruction:
      "Tell the project team the demo is ready.",
    memories: [
      {
        id: "c-email-4",
        content:
          "The user prefers email when submitting formal applications.",
      },
    ],
    shouldInfluence: false,
  },

  {
    name: "email mismatch - recruiters",
    category: "context-mismatch",
    subcategory: "email",
    instruction:
      "Message the project team about tomorrow's meeting.",
    memories: [
      {
        id: "c-email-5",
        content:
          "The user prefers email when speaking with recruiters.",
      },
    ],
    shouldInfluence: false,
  },

  // ---------------- URGENCY: 5 ----------------

  {
    name: "urgency mismatch - groceries",
    category: "context-mismatch",
    subcategory: "urgency",
    instruction:
      "Remind me to buy groceries.",
    memories: [
      {
        id: "c-urgency-1",
        content:
          "Hackathon work is urgent.",
      },
    ],
    shouldInfluence: false,
  },

  {
    name: "urgency mismatch - laundry",
    category: "context-mismatch",
    subcategory: "urgency",
    instruction:
      "Remind me to do my laundry.",
    memories: [
      {
        id: "c-urgency-2",
        content:
          "Hackathon work is urgent.",
      },
    ],
    shouldInfluence: false,
  },

  {
    name: "urgency mismatch - clean room",
    category: "context-mismatch",
    subcategory: "urgency",
    instruction:
      "Create a task to clean my room.",
    memories: [
      {
        id: "c-urgency-3",
        content:
          "My research project is high priority.",
      },
    ],
    shouldInfluence: false,
  },

  {
    name: "urgency mismatch - buy textbook",
    category: "context-mismatch",
    subcategory: "urgency",
    instruction:
      "Remind me to buy a textbook.",
    memories: [
      {
        id: "c-urgency-4",
        content:
          "The software release is high priority.",
      },
    ],
    shouldInfluence: false,
  },

  {
    name: "urgency mismatch - water plants",
    category: "context-mismatch",
    subcategory: "urgency",
    instruction:
      "Create a task to water the plants.",
    memories: [
      {
        id: "c-urgency-5",
        content:
          "Hackathon work is urgent.",
      },
    ],
    shouldInfluence: false,
  },

  // ---------------- REMOTE: 5 ----------------

  {
    name: "remote mismatch - medical appointments",
    category: "context-mismatch",
    subcategory: "remote",
    instruction:
      "Schedule the project review.",
    memories: [
      {
        id: "c-remote-1",
        content:
          "The user prefers remote meetings for medical appointments.",
      },
    ],
    shouldInfluence: false,
  },

  {
    name: "remote mismatch - family",
    category: "context-mismatch",
    subcategory: "remote",
    instruction:
      "Schedule the software team meeting.",
    memories: [
      {
        id: "c-remote-2",
        content:
          "The user prefers remote meetings with family members.",
      },
    ],
    shouldInfluence: false,
  },

  {
    name: "remote mismatch - tutoring",
    category: "context-mismatch",
    subcategory: "remote",
    instruction:
      "Schedule the project review.",
    memories: [
      {
        id: "c-remote-3",
        content:
          "The user prefers remote meetings for tutoring sessions.",
      },
    ],
    shouldInfluence: false,
  },

  {
    name: "remote mismatch - doctor",
    category: "context-mismatch",
    subcategory: "remote",
    instruction:
      "Schedule the development review.",
    memories: [
      {
        id: "c-remote-4",
        content:
          "The user prefers remote meetings when talking to their doctor.",
      },
    ],
    shouldInfluence: false,
  },

  {
    name: "remote mismatch - language lessons",
    category: "context-mismatch",
    subcategory: "remote",
    instruction:
      "Schedule the project meeting.",
    memories: [
      {
        id: "c-remote-5",
        content:
          "The user prefers remote meetings for language lessons.",
      },
    ],
    shouldInfluence: false,
  },
];

describe("ShadowRecall robustness evaluation", () => {
  it("evaluates paraphrase understanding and contextual relevance across 40 scenarios", async () => {
    let correct = 0;

    let paraphraseTotal = 0;
    let paraphraseCorrect = 0;

    let contextTotal = 0;
    let contextCorrect = 0;

    let falsePositives = 0;
    let falseNegatives = 0;

    const subcategoryStats: Record<
      Subcategory,
      { correct: number; total: number }
    > = {
      morning: { correct: 0, total: 0 },
      email: { correct: 0, total: 0 },
      urgency: { correct: 0, total: 0 },
      remote: { correct: 0, total: 0 },
    };

    for (const scenario of scenarios) {
      const result = await runLiveAnalysis(
        scenario.instruction,
        scenario.memories,
      );

      const detectedInfluence = result.diverged;

      const isCorrect =
        detectedInfluence === scenario.shouldInfluence;

      if (isCorrect) {
        correct++;
      }

      subcategoryStats[scenario.subcategory].total++;

      if (isCorrect) {
        subcategoryStats[scenario.subcategory].correct++;
      }

      if (scenario.category === "paraphrase") {
        paraphraseTotal++;

        if (isCorrect) {
          paraphraseCorrect++;
        }
      }

      if (scenario.category === "context-mismatch") {
        contextTotal++;

        if (isCorrect) {
          contextCorrect++;
        }
      }

      if (
        detectedInfluence &&
        !scenario.shouldInfluence
      ) {
        falsePositives++;
      }

      if (
        !detectedInfluence &&
        scenario.shouldInfluence
      ) {
        falseNegatives++;
      }

      const changedFields = result.diffs
        .filter((diff) => diff.changed)
        .map((diff) => diff.path);

      console.log("\n---", scenario.name, "---");
      console.log("Category:", scenario.category);
      console.log(
        "Subcategory:",
        scenario.subcategory,
      );
      console.log(
        "Influence expected:",
        scenario.shouldInfluence,
      );
      console.log(
        "Influence detected:",
        detectedInfluence,
      );
      console.log("Correct:", isCorrect);
      console.log("Changed fields:", changedFields);
      console.log("Risk:", result.risk);
    }

    const overallAccuracy =
      correct / scenarios.length;

    const paraphraseDetectionRate =
      paraphraseCorrect / paraphraseTotal;

    const contextRejectionRate =
      contextCorrect / contextTotal;

    console.log("\n================================");
    console.log("SHADOWRECALL ROBUSTNESS RESULTS");
    console.log("================================");

    console.log(
      `Total scenarios: ${scenarios.length}`,
    );

    console.log(
      `Correct scenarios: ${correct}/${scenarios.length}`,
    );

    console.log(
      `Overall correctness: ${(overallAccuracy * 100).toFixed(1)}%`,
    );

    console.log(
      `Paraphrase handling: ${(paraphraseDetectionRate * 100).toFixed(1)}%`,
    );

    console.log(
      `Context-mismatch rejection: ${(contextRejectionRate * 100).toFixed(1)}%`,
    );

    console.log(
      `False positives: ${falsePositives}`,
    );

    console.log(
      `False negatives: ${falseNegatives}`,
    );

    console.log("\n--- SUBCATEGORY RESULTS ---");

    for (
      const [subcategory, stats]
      of Object.entries(subcategoryStats)
    ) {
      const rate =
        stats.correct / stats.total;

      console.log(
        `${subcategory}: ${stats.correct}/${stats.total} ` +
        `(${(rate * 100).toFixed(1)}%)`,
      );
    }
  });
});
