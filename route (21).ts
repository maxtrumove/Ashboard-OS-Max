import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const app = await prisma.app.findUnique({
    where: { id },
    include: {
      project: true,
      graphs: {
        orderBy: { updatedAt: "desc" },
        include: { _count: { select: { nodes: true } } },
      },
    },
  });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(app);
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.kind === "string") data.kind = body.kind;
  const app = await prisma.app.update({ where: { id }, data });
  return NextResponse.json(app);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  await prisma.app.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
