import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { apps: true } } },
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : "Untitled project";
  const project = await prisma.project.create({
    data: { name, description: typeof body.description === "string" ? body.description : null },
  });
  return NextResponse.json(project, { status: 201 });
}
