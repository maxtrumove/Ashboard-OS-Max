import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const runs = await prisma.run.findMany({
    where: { graphId: id },
    orderBy: { startedAt: "desc" },
    take: 25,
    include: { steps: { orderBy: { sequence: "asc" } } },
  });
  return NextResponse.json(runs);
}
