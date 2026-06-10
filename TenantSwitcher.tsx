import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (typeof body.appId !== "string") {
    return NextResponse.json({ error: "appId required" }, { status: 400 });
  }
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : "Untitled graph";
  const graph = await prisma.graph.create({ data: { appId: body.appId, name } });
  return NextResponse.json(graph, { status: 201 });
}
