import { z } from "zod";

export const actionSchema = z.object({
  tool: z.enum(["create_calendar_event", "send_message", "create_task", "none"]),
  arguments: z.record(z.union([z.string(), z.number(), z.boolean()])),
  rationale: z.string().min(1),
});

export const analyzeRequestSchema = z.object({
  instruction: z.string().trim().min(3).max(1000),
  demo: z.boolean().optional().default(false),
  memories: z.array(z.object({
    id: z.string(),
    content: z.string().min(1),
    source: z.string().optional(),
    createdAt: z.string().optional(),
    score: z.number().optional(),
  })).max(20).optional(),
});
