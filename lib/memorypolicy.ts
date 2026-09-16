import type { Memory } from "./types";

export type ActionDomain =
  | "schedule"
  | "message"
  | "task"
  | "none";

export type Polarity =
  | "positive"
  | "negative";

export type MemoryConstraint =
  | {
      domain: "schedule";
      attribute: "time";
      value: "morning";
      polarity: Polarity;
      scope: string[];
      memory: Memory;
    }
  | {
      domain: "schedule";
      attribute: "location";
      value: "remote";
      polarity: Polarity;
      scope: string[];
      memory: Memory;
    }
  | {
      domain: "message";
      attribute: "channel";
      value: "email";
      polarity: Polarity;
      scope: string[];
      memory: Memory;
    }
  | {
      domain: "task";
      attribute: "priority";
      value: "high";
      polarity: Polarity;
      scope: string[];
      memory: Memory;
    };

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
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
  "appointment",
  "appointments",
  "communication",
  "communications",
  "contact",
  "contacting",
  "meeting",
  "meetings",
  "message",
  "messages",
  "speaking",
  "talking",
  "session",
  "sessions",
]);

function normalizeToken(
  token: string,
): string {
  let result = token
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  if (
    result.length > 4 &&
    result.endsWith("s") &&
    !result.endsWith("ss")
  ) {
    result = result.slice(0, -1);
  }

  return result;
}

function tokenize(
  text: string,
): string[] {
  return text
    .split(/\s+/)
    .map(normalizeToken)
    .filter(Boolean)
    .filter(
      (token) =>
        !STOP_WORDS.has(token),
    );
}

function cleanScope(
  text: string,
): string[] {
  return tokenize(text).filter(
    (token) =>
      !GENERIC_SCOPE_WORDS.has(token),
  );
}

function containsAny(
  text: string,
  phrases: string[],
): boolean {
  return phrases.some(
    (phrase) =>
      text.includes(phrase),
  );
}

export function classifyInstruction(
  instruction: string,
): ActionDomain {
  const text =
    instruction.toLowerCase();

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

/*
 * Extract context such as:
 *
 * "For alumni networking, ..."
 * "with professors"
 * "for tutoring sessions"
 */
function extractScope(
  text: string,
): string[] {
  const prefixPatterns = [
    /^for\s+(.+?),/i,
    /^when\s+(.+?),/i,
    /^during\s+(.+?),/i,
  ];

  for (
    const pattern
    of prefixPatterns
  ) {
    const match =
      text.match(pattern);

    if (match) {
      return cleanScope(
        match[1],
      );
    }
  }

  const suffixPatterns = [
    /\bwith\s+(.+?)(?:[.,]|$)/i,
    /\bfor\s+(.+?)(?:[.,]|$)/i,
    /\bwhen\s+(.+?)(?:[.,]|$)/i,
    /\bduring\s+(.+?)(?:[.,]|$)/i,
  ];

  for (
    const pattern
    of suffixPatterns
  ) {
    const match =
      text.match(pattern);

    if (match) {
      return cleanScope(
        match[1],
      );
    }
  }

  return [];
}

function extractUrgencyScope(
  text: string,
): string[] {
  const patterns = [
    /^(.+?)\s+is\s+(?:currently\s+)?urgent/i,

    /^(.+?)\s+is\s+(?:currently\s+)?high priority/i,

    /^(.+?)\s+is\s+(?:currently\s+)?(?:the\s+)?(?:user'?s\s+)?top priority/i,

    /^(.+?)\s+needs\s+(?:to be\s+)?(?:completed\s+)?urgently/i,

    /^(.+?)\s+needs\s+immediate attention/i,

    /^(.+?)\s+needs\s+to\s+be\s+handled\s+right away/i,

    /^(.+?)\s+cannot wait/i,

    /^(.+?)\s+is\s+time-sensitive/i,

    /^(.+?)\s+deadline\s+is\s+(?:approaching|close|near)/i,
  ];

  for (
    const pattern
    of patterns
  ) {
    const match =
      text.match(pattern);

    if (match) {
      return cleanScope(
        match[1],
      );
    }
  }

  return extractScope(text);
}

function scopeMatchesInstruction(
  scope: string[],
  instruction: string,
): boolean {
  if (
    scope.length === 0
  ) {
    return true;
  }

  const instructionTokens =
    new Set(
      tokenize(instruction),
    );

  return scope.some(
    (token) =>
      instructionTokens.has(
        token,
      ),
  );
}

/*
 * ---------------------------
 * POLARITY HELPERS
 * ---------------------------
 */

function hasNegationNear(
  text: string,
  concept:
    | "email"
    | "morning"
    | "remote"
    | "urgent",
): boolean {
  const patterns:
    Record<
      typeof concept,
      RegExp[]
    > = {
      email: [
        /does not (?:prefer|like|want).*email/i,
        /doesn't (?:prefer|like|want).*email/i,
        /not.*email/i,
        /used to prefer email/i,
        /no longer prefers? email/i,
        /prefers? in-app.*(?:over|rather than).*email/i,
      ],

      morning: [
        /does not (?:prefer|like|want).*morning/i,
        /doesn't (?:prefer|like|want).*morning/i,
        /not morning/i,
        /prefers? afternoon/i,
        /rather.*afternoon.*than.*morning/i,
        /used to prefer morning/i,
        /no longer prefers? morning/i,
      ],

      remote: [
        /does not (?:prefer|like|want).*(?:remote|virtual|online)/i,
        /doesn't (?:prefer|like|want).*(?:remote|virtual|online)/i,
        /prefers? .*in[- ]person.*(?:rather than|over).*(?:remote|virtual|online)/i,
        /rather.*in[- ]person.*than.*(?:remote|virtual|online)/i,
        /no longer prefers? .*remote/i,
      ],

      urgent: [
        /no longer urgent/i,
        /not urgent/i,
        /isn't urgent/i,
        /is not urgent/i,
        /does not need immediate attention/i,
        /can wait/i,
        /used to be urgent/i,
      ],
    };

  return patterns[
    concept
  ].some(
    (pattern) =>
      pattern.test(text),
  );
}

/*
 * ---------------------------
 * SEMANTIC NORMALIZATION
 * ---------------------------
 */

function meansMorning(
  text: string,
): boolean {
  if (
    hasNegationNear(
      text,
      "morning",
    )
  ) {
    return false;
  }

  const directSignals = [
    "morning",
    "before noon",
    "before lunch",
    "earlier in the day",
    "early in the day",
    "first half of the day",
    "first meeting slot",
    "earliest meeting slot",
    "early meeting",
  ];

  if (
    containsAny(
      text,
      directSignals,
    )
  ) {
    return true;
  }

  if (
    text.includes(
      "afternoon",
    ) &&
    containsAny(
      text,
      [
        "avoid",
        "dislike",
        "inconvenient",
        "doesn't work",
        "does not work",
      ],
    )
  ) {
    return true;
  }

  /*
   * Recognize morning time ranges.
   *
   * Example:
   * "between 8 AM and 11 AM"
   */
  const hourMatches =
    [
      ...text.matchAll(
        /\b(\d{1,2})\s*(am|pm)\b/gi,
      ),
    ];

  if (
    hourMatches.length > 0
  ) {
    const hasMorningTime =
      hourMatches.some(
        (match) =>
          match[2]
            .toLowerCase() ===
          "am",
      );

    if (
      hasMorningTime &&
      containsAny(
        text,
        [
          "available",
          "prefer",
          "best",
          "works",
          "convenient",
        ],
      )
    ) {
      return true;
    }
  }

  return false;
}

function meansRemote(
  text: string,
): boolean {
  if (
    hasNegationNear(
      text,
      "remote",
    )
  ) {
    return false;
  }

  return containsAny(
    text,
    [
      "remote",
      "virtually",
      "virtual meeting",
      "virtual call",
      "online meeting",
      "online call",
      "video meeting",
      "video call",
      "video conference",
      "zoom",
      "google meet",
      "microsoft teams",
      "meet from home",
      "join from home",
      "rather use zoom",
    ],
  ) ||
    (
      text.includes(
        "avoid",
      ) &&
      containsAny(
        text,
        [
          "meeting room",
          "in person",
          "in-person",
          "physical meeting",
        ],
      )
    );
}

function meansEmail(
  text: string,
): boolean {
  if (
    hasNegationNear(
      text,
      "email",
    )
  ) {
    return false;
  }

  if (
    containsAny(
      text,
      [
        "email",
        "e-mail",
        "electronic mail",
        "inbox",
        "mailbox",
        "written correspondence",
      ],
    )
  ) {
    return true;
  }

  if (
    text.includes("in-app") &&
    containsAny(
      text,
      [
        "avoid",
        "dislike",
        "rather not",
      ],
    )
  ) {
    return true;
  }

  return false;
}

function meansUrgent(
  text: string,
): boolean {
  if (
    hasNegationNear(
      text,
      "urgent",
    )
  ) {
    return false;
  }

  return containsAny(
    text,
    [
      "urgent",
      "urgently",
      "high priority",
      "top priority",
      "highest priority",
      "immediate attention",
      "right away",
      "time-sensitive",
      "time sensitive",
      "cannot wait",
      "can't wait",
      "as soon as possible",
      "asap",
      "deadline is approaching",
      "deadline is close",
      "deadline is near",
      "most important work",
    ],
  );
}

function interpretMemory(
  memory: Memory,
): MemoryConstraint[] {
  const text =
    memory.content
      .toLowerCase()
      .trim();

  const constraints:
    MemoryConstraint[] = [];

  /*
   * Scheduling time
   */
  const morningPositive =
    meansMorning(text);

  const morningNegative =
    !morningPositive &&
    hasNegationNear(
      text,
      "morning",
    );

  if (
    morningPositive ||
    morningNegative
  ) {
    constraints.push({
      domain: "schedule",
      attribute: "time",
      value: "morning",
      polarity:
        morningPositive
          ? "positive"
          : "negative",
      scope:
        extractScope(text),
      memory,
    });
  }

  /*
   * Scheduling location
   */
  const remotePositive =
    meansRemote(text);

  const remoteNegative =
    !remotePositive &&
    hasNegationNear(
      text,
      "remote",
    );

  if (
    remotePositive ||
    remoteNegative
  ) {
    constraints.push({
      domain: "schedule",
      attribute: "location",
      value: "remote",
      polarity:
        remotePositive
          ? "positive"
          : "negative",
      scope:
        extractScope(text),
      memory,
    });
  }

  /*
   * Message channel
   */
  const emailPositive =
    meansEmail(text);

  const emailNegative =
    !emailPositive &&
    hasNegationNear(
      text,
      "email",
    );

  if (
    emailPositive ||
    emailNegative
  ) {
    constraints.push({
      domain: "message",
      attribute: "channel",
      value: "email",
      polarity:
        emailPositive
          ? "positive"
          : "negative",
      scope:
        extractScope(text),
      memory,
    });
  }

  /*
   * Task priority
   */
  const urgentPositive =
    meansUrgent(text);

  const urgentNegative =
    !urgentPositive &&
    hasNegationNear(
      text,
      "urgent",
    );

  if (
    urgentPositive ||
    urgentNegative
  ) {
    constraints.push({
      domain: "task",
      attribute: "priority",
      value: "high",
      polarity:
        urgentPositive
          ? "positive"
          : "negative",
      scope:
        extractUrgencyScope(
          text,
        ),
      memory,
    });
  }

  return constraints;
}

export function getApplicableConstraints(
  instruction: string,
  memories: Memory[],
): MemoryConstraint[] {
  const domain =
    classifyInstruction(
      instruction,
    );

  const candidates =
    memories.flatMap(
      interpretMemory,
    );

  return candidates.filter(
    (constraint) =>
      constraint.domain ===
        domain &&
      constraint.polarity ===
        "positive" &&
      scopeMatchesInstruction(
        constraint.scope,
        instruction,
      ),
  );
}
