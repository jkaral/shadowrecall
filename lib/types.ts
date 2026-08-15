export type RiskLevel = "none" | "low" | "medium" | "high";

export interface Memory {
  id: string;
  content: string;
  source?: string;
  createdAt?: string;
  score?: number;
}

export interface PlannedAction {
  tool: "create_calendar_event" | "send_message" | "create_task" | "none";
  arguments: Record<string, string | number | boolean>;
  rationale: string;
}

export interface FieldDiff {
  path: string;
  remembered: unknown;
  amnesiac: unknown;
  changed: boolean;
}

export interface Attribution {
  memory: Memory;
  confidence: number;
  explanation: string;
}

export interface AnalysisResult {
  id: string;
  instruction: string;
  remembered: PlannedAction;
  amnesiac: PlannedAction;
  diverged: boolean;
  risk: RiskLevel;
  diffs: FieldDiff[];
  attribution: Attribution | null;
  memoriesConsidered: Memory[];
  mode: "demo" | "live";
  durationMs: number;
}
