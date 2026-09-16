import { describe, it } from "vitest";
import { runLiveAnalysis } from "../lib/analyze";
import type { Memory } from "../lib/types";

type Category =
  | "semantic-paraphrase"
  | "scoped-irrelevance"
  | "multi-memory"
  | "negation-contrast";

interface Scenario {
  name: string;
  category: Category;
  instruction: string;
  memories: Memory[];
  shouldInfluence: boolean;
}

const memory = (
  id: string,
  content: string,
): Memory => ({
  id,
  content,
});

const scenarios: Scenario[] = [

  // ==================================================
  // 1. SEMANTIC PARAPHRASE
  //
  // New ways of expressing relevant preferences.
  // All 10 SHOULD influence the action.
  // ==================================================

  {
    name: "schedule - meetings before lunch",
    category: "semantic-paraphrase",
    instruction:
      "Schedule the project review.",
    memories: [
      memory(
        "sp1",
        "The user tends to arrange meetings before lunch.",
      ),
    ],
    shouldInfluence: true,
  },

  {
    name: "schedule - afternoons are inconvenient",
    category: "semantic-paraphrase",
    instruction:
      "Schedule the engineering review.",
    memories: [
      memory(
        "sp2",
        "Afternoons are generally inconvenient for the user.",
      ),
    ],
    shouldInfluence: true,
  },

  {
    name: "schedule - 8 to 11 availability",
    category: "semantic-paraphrase",
    instruction:
      "Schedule the project meeting.",
    memories: [
      memory(
        "sp3",
        "The user is most available for meetings between 8 AM and 11 AM.",
      ),
    ],
    shouldInfluence: true,
  },

  {
    name: "remote - prefers Zoom",
    category: "semantic-paraphrase",
    instruction:
      "Schedule the team review.",
    memories: [
      memory(
        "sp4",
        "The user would rather join through Zoom than meet in person.",
      ),
    ],
    shouldInfluence: true,
  },

  {
    name: "remote - video conference preference",
    category: "semantic-paraphrase",
    instruction:
      "Schedule the project review.",
    memories: [
      memory(
        "sp5",
        "Video conferences are more convenient for the user than meeting in a room.",
      ),
    ],
    shouldInfluence: true,
  },

  {
    name: "message - written correspondence",
    category: "semantic-paraphrase",
    instruction:
      "Send the project team a progress update.",
    memories: [
      memory(
        "sp6",
        "Written correspondence is the user's preferred way to receive project updates.",
      ),
    ],
    shouldInfluence: true,
  },

  {
    name: "message - mailbox preference",
    category: "semantic-paraphrase",
    instruction:
      "Notify the project team that the demo is ready.",
    memories: [
      memory(
        "sp7",
        "The user would rather receive important communications in their mailbox.",
      ),
    ],
    shouldInfluence: true,
  },

  {
    name: "task - needs doing right away",
    category: "semantic-paraphrase",
    instruction:
      "Remind me to finish the hackathon demo.",
    memories: [
      memory(
        "sp8",
        "The hackathon demo needs to be handled right away.",
      ),
    ],
    shouldInfluence: true,
  },

  {
    name: "task - time sensitive",
    category: "semantic-paraphrase",
    instruction:
      "Create a task to complete the hackathon presentation.",
    memories: [
      memory(
        "sp9",
        "Completing the hackathon presentation is time-sensitive.",
      ),
    ],
    shouldInfluence: true,
  },

  {
    name: "task - cannot wait",
    category: "semantic-paraphrase",
    instruction:
      "Remind me to finish the hackathon submission.",
    memories: [
      memory(
        "sp10",
        "The hackathon submission cannot wait.",
      ),
    ],
    shouldInfluence: true,
  },

  // ==================================================
  // 2. SCOPED IRRELEVANCE
  //
  // Genuine preferences, but they apply to another
  // person, activity, or context.
  //
  // All 10 SHOULD NOT influence the action.
  // ==================================================

  {
    name: "email only for alumni networking",
    category: "scoped-irrelevance",
    instruction:
      "Send the project team an update.",
    memories: [
      memory(
        "si1",
        "For alumni networking, the user prefers email.",
      ),
    ],
    shouldInfluence: false,
  },

  {
    name: "morning only for medical visits",
    category: "scoped-irrelevance",
    instruction:
      "Schedule the software project review.",
    memories: [
      memory(
        "si2",
        "Morning meetings work best when visiting the doctor.",
      ),
    ],
    shouldInfluence: false,
  },

  {
    name: "remote only for language tutoring",
    category: "scoped-irrelevance",
    instruction:
      "Schedule the development team meeting.",
    memories: [
      memory(
        "si3",
        "Remote meetings are preferred for language tutoring.",
      ),
    ],
    shouldInfluence: false,
  },

  {
    name: "urgent research but grocery task",
    category: "scoped-irrelevance",
    instruction:
      "Remind me to buy groceries.",
    memories: [
      memory(
        "si4",
        "The research deadline is urgent.",
      ),
    ],
    shouldInfluence: false,
  },

  {
    name: "email only for financial matters",
    category: "scoped-irrelevance",
    instruction:
      "Notify the engineering team about the release.",
    memories: [
      memory(
        "si5",
        "For financial matters, the user prefers email.",
      ),
    ],
    shouldInfluence: false,
  },

  {
    name: "morning only for exercise",
    category: "scoped-irrelevance",
    instruction:
      "Schedule the project review.",
    memories: [
      memory(
        "si6",
        "The user prefers morning appointments for personal training.",
      ),
    ],
    shouldInfluence: false,
  },

  {
    name: "high priority exam but laundry",
    category: "scoped-irrelevance",
    instruction:
      "Create a task to do the laundry.",
    memories: [
      memory(
        "si7",
        "Preparing for the calculus exam is high priority.",
      ),
    ],
    shouldInfluence: false,
  },

  {
    name: "remote only for family calls",
    category: "scoped-irrelevance",
    instruction:
      "Schedule the project meeting.",
    memories: [
      memory(
        "si8",
        "The user prefers remote meetings with relatives living abroad.",
      ),
    ],
    shouldInfluence: false,
  },

  {
    name: "email only for scholarship applications",
    category: "scoped-irrelevance",
    instruction:
      "Send the project team the latest results.",
    memories: [
      memory(
        "si9",
        "The user prefers email for scholarship applications.",
      ),
    ],
    shouldInfluence: false,
  },

  {
    name: "urgent deployment but cleaning task",
    category: "scoped-irrelevance",
    instruction:
      "Remind me to clean my room.",
    memories: [
      memory(
        "si10",
        "The production deployment is urgent.",
      ),
    ],
    shouldInfluence: false,
  },

  // ==================================================
  // 3. MULTIPLE MEMORIES
  //
  // Tests whether relevant memories survive noise and
  // whether several irrelevant memories remain ignored.
  //
  // 5 positive, 5 negative.
  // ==================================================

  {
    name: "relevant email among scheduling noise",
    category: "multi-memory",
    instruction:
      "Send the project team an update.",
    memories: [
      memory(
        "mm1a",
        "The user prefers morning appointments with the dentist.",
      ),
      memory(
        "mm1b",
        "The user prefers email for project communication.",
      ),
      memory(
        "mm1c",
        "The user likes remote language lessons.",
      ),
    ],
    shouldInfluence: true,
  },

  {
    name: "relevant morning preference among noise",
    category: "multi-memory",
    instruction:
      "Schedule the project review.",
    memories: [
      memory(
        "mm2a",
        "The user prefers email when contacting recruiters.",
      ),
      memory(
        "mm2b",
        "The user prefers meetings in the morning.",
      ),
      memory(
        "mm2c",
        "The research paper is high priority.",
      ),
    ],
    shouldInfluence: true,
  },

  {
    name: "relevant remote preference among noise",
    category: "multi-memory",
    instruction:
      "Schedule the engineering meeting.",
    memories: [
      memory(
        "mm3a",
        "The user prefers email for university administration.",
      ),
      memory(
        "mm3b",
        "The user prefers remote meetings.",
      ),
      memory(
        "mm3c",
        "Hackathon work is urgent.",
      ),
    ],
    shouldInfluence: true,
  },

  {
    name: "relevant urgency among noise",
    category: "multi-memory",
    instruction:
      "Remind me to finish the hackathon submission.",
    memories: [
      memory(
        "mm4a",
        "The user prefers remote meetings for medical appointments.",
      ),
      memory(
        "mm4b",
        "Hackathon work is urgent.",
      ),
      memory(
        "mm4c",
        "The user prefers email when contacting professors.",
      ),
    ],
    shouldInfluence: true,
  },

  {
    name: "two relevant scheduling preferences",
    category: "multi-memory",
    instruction:
      "Schedule the project review.",
    memories: [
      memory(
        "mm5a",
        "The user prefers meetings in the morning.",
      ),
      memory(
        "mm5b",
        "The user prefers remote meetings.",
      ),
    ],
    shouldInfluence: true,
  },

  {
    name: "three irrelevant memories for project message",
    category: "multi-memory",
    instruction:
      "Send the development team an update.",
    memories: [
      memory(
        "mm6a",
        "The user prefers morning meetings with their doctor.",
      ),
      memory(
        "mm6b",
        "The user prefers email when contacting professors.",
      ),
      memory(
        "mm6c",
        "Hackathon work is urgent.",
      ),
    ],
    shouldInfluence: false,
  },

  {
    name: "three irrelevant memories for grocery task",
    category: "multi-memory",
    instruction:
      "Remind me to buy groceries.",
    memories: [
      memory(
        "mm7a",
        "The user prefers morning meetings.",
      ),
      memory(
        "mm7b",
        "The user prefers email.",
      ),
      memory(
        "mm7c",
        "Hackathon work is urgent.",
      ),
    ],
    shouldInfluence: false,
  },

  {
    name: "unrelated scoped preferences for project review",
    category: "multi-memory",
    instruction:
      "Schedule the project review.",
    memories: [
      memory(
        "mm8a",
        "The user prefers morning meetings with their doctor.",
      ),
      memory(
        "mm8b",
        "The user prefers remote meetings for tutoring sessions.",
      ),
      memory(
        "mm8c",
        "The user prefers email for scholarship applications.",
      ),
    ],
    shouldInfluence: false,
  },

  {
    name: "unrelated urgency memories for chore",
    category: "multi-memory",
    instruction:
      "Create a task to water the plants.",
    memories: [
      memory(
        "mm9a",
        "Hackathon work is urgent.",
      ),
      memory(
        "mm9b",
        "The research project is high priority.",
      ),
    ],
    shouldInfluence: false,
  },

  {
    name: "communication and scheduling memories irrelevant to chore",
    category: "multi-memory",
    instruction:
      "Remind me to organize my desk.",
    memories: [
      memory(
        "mm10a",
        "The user prefers email.",
      ),
      memory(
        "mm10b",
        "The user prefers meetings in the morning.",
      ),
      memory(
        "mm10c",
        "The user prefers remote meetings.",
      ),
    ],
    shouldInfluence: false,
  },

  // ==================================================
  // 4. NEGATION / CONTRAST
  //
  // Tests whether the system blindly reacts to a
  // keyword even when the sentence reverses its meaning.
  //
  // 5 negative, 5 positive.
  // ==================================================

  {
    name: "does not prefer email",
    category: "negation-contrast",
    instruction:
      "Send the project team an update.",
    memories: [
      memory(
        "nc1",
        "The user does not prefer email for project updates.",
      ),
    ],
    shouldInfluence: false,
  },

  {
    name: "used to prefer email",
    category: "negation-contrast",
    instruction:
      "Send the project team the results.",
    memories: [
      memory(
        "nc2",
        "The user used to prefer email, but now prefers in-app messages.",
      ),
    ],
    shouldInfluence: false,
  },

  {
    name: "prefers afternoon not morning",
    category: "negation-contrast",
    instruction:
      "Schedule the project review.",
    memories: [
      memory(
        "nc3",
        "The user prefers afternoon meetings, not morning ones.",
      ),
    ],
    shouldInfluence: false,
  },

  {
    name: "hackathon no longer urgent",
    category: "negation-contrast",
    instruction:
      "Remind me to finish the hackathon documentation.",
    memories: [
      memory(
        "nc4",
        "Hackathon work is no longer urgent.",
      ),
    ],
    shouldInfluence: false,
  },

  {
    name: "in-person not remote",
    category: "negation-contrast",
    instruction:
      "Schedule the engineering review.",
    memories: [
      memory(
        "nc5",
        "The user prefers meeting in person rather than remotely.",
      ),
    ],
    shouldInfluence: false,
  },

  {
    name: "dislikes afternoon and prefers before lunch",
    category: "negation-contrast",
    instruction:
      "Schedule the project review.",
    memories: [
      memory(
        "nc6",
        "The user dislikes afternoon meetings and would rather meet before lunch.",
      ),
    ],
    shouldInfluence: true,
  },

  {
    name: "email better than in-app for project team",
    category: "negation-contrast",
    instruction:
      "Send the project team a release update.",
    memories: [
      memory(
        "nc7",
        "For project-team messages, email is better than in-app chat.",
      ),
    ],
    shouldInfluence: true,
  },

  {
    name: "hackathon work cannot wait",
    category: "negation-contrast",
    instruction:
      "Create a task to finish the hackathon demo.",
    memories: [
      memory(
        "nc8",
        "Hackathon work cannot wait, while routine chores can.",
      ),
    ],
    shouldInfluence: true,
  },

  {
    name: "zoom rather than meeting room",
    category: "negation-contrast",
    instruction:
      "Schedule the project review.",
    memories: [
      memory(
        "nc9",
        "For project reviews, the user would rather use Zoom than a meeting room.",
      ),
    ],
    shouldInfluence: true,
  },

  {
    name: "first meeting slot of the day",
    category: "negation-contrast",
    instruction:
      "Schedule the project review.",
    memories: [
      memory(
        "nc10",
        "For project reviews, the user wants the first meeting slot of the day.",
      ),
    ],
    shouldInfluence: true,
  },
];

describe(
  "ShadowRecall held-out memory relevance evaluation",
  () => {
    it(
      "evaluates 40 unseen scenarios without modifying the planner",
      async () => {
        let correct = 0;
        let falsePositives = 0;
        let falseNegatives = 0;

        let positiveTotal = 0;
        let positiveCorrect = 0;

        let negativeTotal = 0;
        let negativeCorrect = 0;

        const categoryStats: Record<
          Category,
          { correct: number; total: number }
        > = {
          "semantic-paraphrase": {
            correct: 0,
            total: 0,
          },
          "scoped-irrelevance": {
            correct: 0,
            total: 0,
          },
          "multi-memory": {
            correct: 0,
            total: 0,
          },
          "negation-contrast": {
            correct: 0,
            total: 0,
          },
        };

        for (const scenario of scenarios) {
          const result =
            await runLiveAnalysis(
              scenario.instruction,
              scenario.memories,
            );

          const detected =
            result.diverged;

          const isCorrect =
            detected ===
            scenario.shouldInfluence;

          if (isCorrect) {
            correct++;
          }

          categoryStats[
            scenario.category
          ].total++;

          if (isCorrect) {
            categoryStats[
              scenario.category
            ].correct++;
          }

          if (scenario.shouldInfluence) {
            positiveTotal++;

            if (detected) {
              positiveCorrect++;
            }
          } else {
            negativeTotal++;

            if (!detected) {
              negativeCorrect++;
            }
          }

          if (
            detected &&
            !scenario.shouldInfluence
          ) {
            falsePositives++;
          }

          if (
            !detected &&
            scenario.shouldInfluence
          ) {
            falseNegatives++;
          }

          const changedFields =
            result.diffs
              .filter(
                (diff) => diff.changed,
              )
              .map(
                (diff) => diff.path,
              );

          console.log(
            "\n---",
            scenario.name,
            "---",
          );

          console.log(
            "Category:",
            scenario.category,
          );

          console.log(
            "Expected:",
            scenario.shouldInfluence,
          );

          console.log(
            "Detected:",
            detected,
          );

          console.log(
            "Correct:",
            isCorrect,
          );

          console.log(
            "Changed fields:",
            changedFields,
          );
        }

        const overall =
          correct /
          scenarios.length;

        const positiveDetection =
          positiveCorrect /
          positiveTotal;

        const negativeRejection =
          negativeCorrect /
          negativeTotal;

        console.log(
          "\n======================================",
        );

        console.log(
          "SHADOWRECALL HELD-OUT RESULTS",
        );

        console.log(
          "======================================",
        );

        console.log(
          `Total scenarios: ${scenarios.length}`,
        );

        console.log(
          `Correct scenarios: ${correct}/${scenarios.length}`,
        );

        console.log(
          `Overall correctness: ${(overall * 100).toFixed(1)}%`,
        );

        console.log(
          `Relevant-memory detection: ${(positiveDetection * 100).toFixed(1)}%`,
        );

        console.log(
          `Irrelevant-memory rejection: ${(negativeRejection * 100).toFixed(1)}%`,
        );

        console.log(
          `False positives: ${falsePositives}`,
        );

        console.log(
          `False negatives: ${falseNegatives}`,
        );

        console.log(
          "\n--- CATEGORY RESULTS ---",
        );

        for (
          const [
            category,
            stats,
          ] of Object.entries(
            categoryStats,
          )
        ) {
          const rate =
            stats.correct /
            stats.total;

          console.log(
            `${category}: ` +
            `${stats.correct}/${stats.total} ` +
            `(${(rate * 100).toFixed(1)}%)`,
          );
        }
      },
    );
  },
);
