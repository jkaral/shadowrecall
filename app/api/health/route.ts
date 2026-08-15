import { NextResponse } from "next/server";
import { hasBackboardConfig } from "@/lib/backboard";

export function GET() {
  return NextResponse.json({ ok: true, mode: hasBackboardConfig() ? "live" : "demo", timestamp: new Date().toISOString() });
}
