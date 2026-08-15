import type { FieldDiff, PlannedAction, RiskLevel } from "./types";

function flatten(value: unknown, prefix = ""): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return { [prefix || "value"]: value };
  }
  return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
    (result, [key, child]) => ({ ...result, ...flatten(child, prefix ? `${prefix}.${key}` : key) }),
    {},
  );
}

export function diffActions(remembered: PlannedAction, amnesiac: PlannedAction): FieldDiff[] {
  const left = flatten({ tool: remembered.tool, ...remembered.arguments });
  const right = flatten({ tool: amnesiac.tool, ...amnesiac.arguments });
  return [...new Set([...Object.keys(left), ...Object.keys(right)])]
    .sort()
    .map((path) => ({
      path,
      remembered: left[path],
      amnesiac: right[path],
      changed: JSON.stringify(left[path]) !== JSON.stringify(right[path]),
    }));
}

export function assessRisk(diffs: FieldDiff[]): RiskLevel {
  const changed = diffs.filter((diff) => diff.changed);
  if (!changed.length) return "none";
  if (changed.some((diff) => diff.path === "tool" || /recipient|amount|date/.test(diff.path))) return "high";
  if (changed.some((diff) => /time|channel|priority/.test(diff.path))) return "medium";
  return "low";
}
