import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (typeof body.projectId !== "string") {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : "Untitled app";
  const app = await prisma.app.create({
    data: {
      projectId: body.projectId,
      name,
      kind: typeof body.kind === "string" ? body.kind : "system",
    },
  });
  return NextResponse.json(app, { status: 201 });
}
