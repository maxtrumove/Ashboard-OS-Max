import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

interface IncomingNode {
  id: string;
  type: string;
  title: string;
  posX: number;
  posY: number;
  data: Record<string, unknown>;
}

interface IncomingEdge {
  sourceNodeId: string;
  sourceHandle?: string | null;
  targetNodeId: string;
  targetHandle?: string | null;
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const graph = await prisma.graph.findUnique({
    where: { id },
    include: { nodes: true, edges: true, app: { include: { project: true } } },
  });
  if (!graph) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...graph,
    nodes: graph.nodes.map((n) => ({ ...n, data: safeParse(n.data) })),
  });
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const scalarData: Record<string, unknown> = {};
  if (typeof body.name === "string") scalarData.name = body.name.trim();
  if (typeof body.viewport === "string") scalarData.viewport = body.viewport;

  const hasGraph = Array.isArray(body.nodes) && Array.isArray(body.edges);

  if (hasGraph) {
    const nodes = body.nodes as IncomingNode[];
    const edges = body.edges as IncomingEdge[];
    await prisma.$transaction([
      prisma.node.deleteMany({ where: { graphId: id } }),
      prisma.edge.deleteMany({ where: { graphId: id } }),
      prisma.node.createMany({
        data: nodes.map((n) => ({
          id: n.id,
          graphId: id,
          type: n.type,
          title: n.title,
          posX: n.posX,
          posY: n.posY,
          data: JSON.stringify(n.data ?? {}),
        })),
      }),
      prisma.edge.createMany({
        data: edges.map((e) => ({
          graphId: id,
          sourceNodeId: e.sourceNodeId,
          sourceHandle: e.sourceHandle ?? null,
          targetNodeId: e.targetNodeId,
          targetHandle: e.targetHandle ?? null,
        })),
      }),
      prisma.graph.update({ where: { id }, data: scalarData }),
    ]);
  } else if (Object.keys(scalarData).length) {
    await prisma.graph.update({ where: { id }, data: scalarData });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  await prisma.graph.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

function safeParse(value: string): Record<string, unknown> {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}
