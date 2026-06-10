import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { executeConnector } from "@/lib/connectors";

function safeParse(value: string): Record<string, unknown> {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

// Run a connector once with a sample input so users can validate it before wiring.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const input = typeof body.input === "string" ? body.input : "hello";

  let kind: string;
  let config: Record<string, unknown>;
  if (typeof body.id === "string") {
    const def = await prisma.connectorDef.findUnique({ where: { id: body.id } });
    if (!def) return NextResponse.json({ error: "connector not found" }, { status: 404 });
    kind = def.kind;
    config = safeParse(def.config);
  } else {
    kind = typeof body.kind === "string" ? body.kind : "builtin";
    config = body.config && typeof body.config === "object" ? body.config : {};
  }

  const output = await executeConnector({ kind, config }, input);
  return NextResponse.json({ output });
}
