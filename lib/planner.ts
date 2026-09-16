import type {
  Memory,
  PlannedAction,
} from "./types";

import {
  classifyInstruction,
  getApplicableConstraints,
} from "./memory-policy";

export function planLocally(
  instruction: string,
  memories: Memory[],
): PlannedAction {
  const domain =
    classifyInstruction(instruction);

  const constraints =
    getApplicableConstraints(
      instruction,
      memories,
    );

  // =================================
  // SCHEDULING
  // =================================

  if (domain === "schedule") {
    const prefersMorning =
      constraints.some(
        (constraint) =>
          constraint.domain === "schedule" &&
          constraint.attribute === "time" &&
          constraint.value === "morning",
      );

    const prefersRemote =
      constraints.some(
        (constraint) =>
          constraint.domain === "schedule" &&
          constraint.attribute === "location" &&
          constraint.value === "remote",
      );

    return {
      tool: "create_calendar_event",

      arguments: {
        title: "Project review",

        date: prefersMorning
          ? "2026-08-15"
          : "2026-08-14",

        time: prefersMorning
          ? "09:00"
          : "15:00",

        duration_minutes: 30,

        location: prefersRemote
          ? "Google Meet"
          : "Meeting room",
      },

      rationale:
        constraints.length > 0
          ? "Relevant remembered preferences were applied to the scheduling decision."
          : "No applicable remembered preference was found, so the default schedule was selected.",
    };
  }

  // =================================
  // MESSAGING
  // =================================

  if (domain === "message") {
    const prefersEmail =
      constraints.some(
        (constraint) =>
          constraint.domain === "message" &&
          constraint.attribute === "channel" &&
          constraint.value === "email",
      );

    return {
      tool: "send_message",

      arguments: {
        recipient: "Project team",

        channel: prefersEmail
          ? "email"
          : "in-app",

        message: instruction,
      },

      rationale: prefersEmail
        ? "A relevant communication preference changed the delivery channel to email."
        : "No applicable communication preference was found, so the default in-app channel was selected.",
    };
  }

  // =================================
  // TASKS
  // =================================

  if (domain === "task") {
    const highPriority =
      constraints.some(
        (constraint) =>
          constraint.domain === "task" &&
          constraint.attribute === "priority" &&
          constraint.value === "high",
      );

    return {
      tool: "create_task",

      arguments: {
        title: instruction,

        priority: highPriority
          ? "high"
          : "normal",

        completed: false,
      },

      rationale: highPriority
        ? "A relevant urgency memory raised the task priority."
        : "No applicable urgency memory was found, so the task received normal priority.",
    };
  }

  return {
    tool: "none",
    arguments: {},
    rationale:
      "The instruction did not contain enough information to propose a supported action.",
  };
}
