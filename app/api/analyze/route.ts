import { NextResponse } from "next/server";
import { runLiveAnalysis } from "@/lib/analyze";
import { hasBackboardConfig } from "@/lib/backboard";
import { createDemoAnalysis } from "@/lib/demo";
import { analyzeRequestSchema } from "@/lib/schema";

export async function POST(request: Request) {
  try {
    const input = analyzeRequestSchema.parse(await request.json());
    if (input.demo || !hasBackboardConfig()) return NextResponse.json(createDemoAnalysis(input.instruction));
    return NextResponse.json(await runLiveAnalysis(input.instruction, input.memories));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown analysis error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
