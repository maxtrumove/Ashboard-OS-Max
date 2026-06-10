import { NextResponse, type NextRequest } from "next/server";
import { listAutomations, runAutomation, zapierConfigured } from "@/lib/godmode/zapier";

// Zapier automations bridge. GET lists what's available; POST runs one.
// MCP over streamable HTTP needs the Node runtime.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!zapierConfigured()) {
    return NextResponse.json({ configured: false, automations: [] });
  }
  try {
    const automations = await listAutomations();
    return NextResponse.json({ configured: true, automations });
  } catch {
    return NextResponse.json({ configured: true, automations: [], error: "connect" });
  }
}

export async function POST(req: NextRequest) {
  if (!zapierConfigured()) {
    return NextResponse.json({ ok: false, output: "Zapier isn't configured" }, { status: 400 });
  }
  try {
    const body = (await req.json()) as { tool?: string; args?: Record<string, unknown> };
    if (!body.tool) {
      return NextResponse.json({ ok: false, output: "Missing tool" }, { status: 400 });
    }
    const result = await runAutomation(body.tool, body.args ?? {});
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ ok: false, output: (err as Error).message }, { status: 500 });
  }
}
