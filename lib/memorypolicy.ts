import type { Memory } from "./types";

export type ActionDomain =
  | "schedule"
  | "message"
  | "task"
  | "none";

export type MemoryConstraint =
  | {
      domain: "schedule";
      attribute: "time";
      value: "morning";
      scope: string[];
      memory: Memory;
    }
  | {
      domain: "schedule";
      attribute: "location";
      value: "remote";
      scope: string[];
      memory: Memory;
    }
  | {
      domain: "message";
      attribute: "channel";
      value: "email";
      scope: string[];
      memory: Memory;
    }
  | {
      domain: "task";
      attribute: "priority";
      value: "high";
      scope: string[];
      memory: Memory;
    };

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "is",
  "it",
  "my",
  "of",
  "on",
  "or",
  "the",
  "their",
  "to",
  "user",
  "usually",
  "when",
  "with",
]);

const GENERIC_SCOPE_WORDS = new Set([
  "communicate",
  "communication",
  "communicating",
  "contact",
  "contacting",
  "message",
  "meeting",
  "appointment",
  "talk",
  "talking",
  "speak",
  "speaking",
  "possible",
  "whenever",
  "timing",
  "flexible",
]);

function normalizeToken(token: string): string {
  let result = token
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  // Very small amount of normalization so that
  // "professors" and "professor" can match.
  if (
    result.length > 4 &&
    result.endsWith("s") &&
    !result.endsWith("ss")
  ) {
    result = result.slice(0, -1);
  }

  return result;
}

function tokenize(text: string): string[] {
  return text
    .split(/\s+/)
    .map(normalizeToken)
    .filter(Boolean)
    .filter((token) => !STOP_WORDS.has(token));
}

function cleanScope(text: string): string[] {
  return tokenize(text).filter(
    (token) => !GENERIC_SCOPE_WORDS.has(token),
  );
}

function containsAny(
  text: string,
  phrases: string[],
): boolean {
  return phrases.some((phrase) =>
    text.includes(phrase),
  );
}

export function classifyInstruction(
  instruction: string,
): ActionDomain {
  const text = instruction.toLowerCase();

  if (
    containsAny(text, [
      "schedule",
      "meeting",
      "calendar",
      "appointment",
      "review",
    ])
  ) {
    return "schedule";
  }

  if (
    containsAny(text, [
      "message",
      "email",
      "notify",
      "tell",
      "send",
    ])
  ) {
    return "message";
  }

  if (
    containsAny(text, [
      "task",
      "remind",
      "todo",
      "to-do",
    ])
  ) {
    return "task";
  }

  return "none";
}

/**
 * Looks for an explicit contextual qualifier:
 *
 * "prefers email WHEN communicating with professors"
 * "prefers morning meetings WITH family members"
 * "prefers remote meetings FOR tutoring sessions"
 */
function extractMarkedScope(
  text: string,
): string[] {
  const match = text.match(
    /\b(?:with|for|when)\s+(.+)$/i,
  );

  if (!match) {
    return [];
  }

  const scope = cleanScope(match[1]);

  return scope;
}

/**
 * Priority memories often encode their scope as the
 * grammatical subject rather than after "for/with".
 *
 * Example:
 * "Hackathon work is urgent."
 *       ↓
 * scope = ["hackathon", "work"]
 */
function extractUrgencyScope(
  text: string,
): string[] {
  const patterns = [
    /^(.+?)\s+is\s+(?:currently\s+)?(?:urgent|high priority)/i,

    /^(.+?)\s+is\s+(?:currently\s+)?(?:the\s+)?(?:user'?s\s+)?top priority/i,

    /^(.+?)\s+is\s+(?:currently\s+)?the most important/i,

    /^(.+?)\s+needs\s+(?:to be\s+)?(?:completed\s+)?urgently/i,

    /^(.+?)\s+needs\s+immediate attention/i,

    /^(.+?)\s+deadline\s+is approaching/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      return cleanScope(match[1]);
    }
  }

  return extractMarkedScope(text);
}

function scopeMatchesInstruction(
  scope: string[],
  instruction: string,
): boolean {
  // Empty scope = global preference.
  if (scope.length === 0) {
    return true;
  }

  const instructionTokens = new Set(
    tokenize(instruction),
  );

  return scope.some((token) =>
    instructionTokens.has(token),
  );
}

function interpretMemory(
  memory: Memory,
): MemoryConstraint[] {
  const text = memory.content.toLowerCase();

  const constraints: MemoryConstraint[] = [];

  // ---------------------------------
  // TIME PREFERENCE
  // ---------------------------------

  const morningPreference =
    containsAny(text, [
      "morning",
      "before noon",
      "earlier in the day",
      "first half of the day",
      "early meeting",
    ]) ||
    (
      text.includes("avoid") &&
      text.includes("afternoon")
    );

  if (morningPreference) {
    constraints.push({
      domain: "schedule",
      attribute: "time",
      value: "morning",
      scope: extractMarkedScope(text),
      memory,
    });
  }

  // ---------------------------------
  // REMOTE MEETING PREFERENCE
  // ---------------------------------

  const remotePreference =
    containsAny(text, [
      "remote",
      "virtual meeting",
      "video call",
      "online meeting",
      "join meetings from home",
    ]) ||
    (
      text.includes("avoid") &&
      text.includes("physical meeting")
    );

  if (remotePreference) {
    constraints.push({
      domain: "schedule",
      attribute: "location",
      value: "remote",
      scope: extractMarkedScope(text),
      memory,
    });
  }

  // ---------------------------------
  // COMMUNICATION PREFERENCE
  // ---------------------------------

  const emailPreference =
    containsAny(text, [
      "email",
      "electronic mail",
      "inbox",
    ]) ||
    (
      text.includes("avoid") &&
      text.includes("in-app")
    );

  if (emailPreference) {
    constraints.push({
      domain: "message",
      attribute: "channel",
      value: "email",
      scope: extractMarkedScope(text),
      memory,
    });
  }

  // ---------------------------------
  // TASK PRIORITY
  // ---------------------------------

  const urgencyPreference =
    containsAny(text, [
      "urgent",
      "urgently",
      "high priority",
      "top priority",
      "immediate attention",
      "most important",
      "deadline is approaching",
    ]);

  if (urgencyPreference) {
    constraints.push({
      domain: "task",
      attribute: "priority",
      value: "high",
      scope: extractUrgencyScope(text),
      memory,
    });
  }

  return constraints;
}

export function getApplicableConstraints(
  instruction: string,
  memories: Memory[],
): MemoryConstraint[] {
  const domain = classifyInstruction(instruction);

  return memories
    .flatMap(interpretMemory)
    .filter(
      (constraint) =>
        constraint.domain === domain,
    )
    .filter((constraint) =>
      scopeMatchesInstruction(
        constraint.scope,
        instruction,
      ),
    );
}
