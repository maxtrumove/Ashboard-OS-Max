import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { listMcpTools, type McpConfig } from "@/lib/connectors/mcp";

function safeParse(value: string): Record<string, unknown> {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

// List the tools an MCP server exposes, by saved connector id or inline config.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  let config: Record<string, unknown>;
  if (typeof body.id === "string") {
    const def = await prisma.connectorDef.findUnique({ where: { id: body.id } });
    if (!def) return NextResponse.json({ error: "connector not found" }, { status: 404 });
    if (def.kind !== "mcp") return NextResponse.json({ error: "not an mcp connector" }, { status: 400 });
    config = safeParse(def.config);
  } else {
    config = body.config && typeof body.config === "object" ? body.config : {};
  }

  try {
    const tools = await listMcpTools(config as McpConfig);
    return NextResponse.json({ tools });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }
}
