import type { Memory, PlannedAction } from "./types";

function containsAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function relevantMemoryText(memories: Memory[]) {
  return memories
    .map((memory) => memory.content.toLowerCase())
    .join(" ");
}

export function planLocally(
  instruction: string,
  memories: Memory[],
): PlannedAction {
  const normalizedInstruction = instruction.toLowerCase();
  const memoryText = relevantMemoryText(memories);

  const isSchedulingRequest = containsAny(
    normalizedInstruction,
    [
      "schedule",
      "meeting",
      "calendar",
      "appointment",
      "review",
    ],
  );

  const isMessageRequest = containsAny(
    normalizedInstruction,
    [
      "message",
      "email",
      "notify",
      "tell",
      "send",
    ],
  );

  const isTaskRequest = containsAny(
    normalizedInstruction,
    [
      "task",
      "remind",
      "todo",
      "to-do",
    ],
  );

  if (isSchedulingRequest) {
    const prefersMorning =
      memoryText.includes("prefers morning meetings") ||
      memoryText.includes("prefers meetings in the morning");

    const prefersGoogleMeet =
      memoryText.includes("google meet") ||
      memoryText.includes("remote meeting");

    if (prefersMorning) {
      return {
        tool: "create_calendar_event",
        arguments: {
          title: "Project review",
          date: "2026-08-15",
          time: "09:00",
          duration_minutes: 30,
          location: prefersGoogleMeet
            ? "Google Meet"
            : "Meeting room",
        },
        rationale:
          "The remembered morning preference changed the plan to the next available morning slot.",
      };
    }

    return {
      tool: "create_calendar_event",
      arguments: {
        title: "Project review",
        date: "2026-08-14",
        time: "15:00",
        duration_minutes: 30,
        location: prefersGoogleMeet
          ? "Google Meet"
          : "Meeting room",
      },
      rationale:
        "Without an applicable remembered preference, the planner selected the earliest available slot.",
    };
  }

  if (isMessageRequest) {
    const prefersEmail = memoryText.includes("prefers email");

    return {
      tool: "send_message",
      arguments: {
        recipient: "Project team",
        channel: prefersEmail ? "email" : "in-app",
        message: instruction,
      },
      rationale: prefersEmail
        ? "The remembered communication preference changed the delivery channel to email."
        : "No communication preference applied, so the default in-app channel was selected.",
    };
  }

  if (isTaskRequest) {
    const highPriority =
      memoryText.includes("hackathon work is urgent") ||
      memoryText.includes("high priority");

    return {
      tool: "create_task",
      arguments: {
        title: instruction,
        priority: highPriority ? "high" : "normal",
        completed: false,
      },
      rationale: highPriority
        ? "A remembered urgency constraint raised the task priority."
        : "No urgency memory applied, so the task received normal priority.",
    };
  }

  return {
    tool: "none",
    arguments: {},
    rationale:
      "The instruction did not contain enough information to propose a supported action.",
  };
}