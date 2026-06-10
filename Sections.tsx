import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface ImportNode {
  id: string;
  type: string;
  title: string;
  posX?: number;
  posY?: number;
  data?: Record<string, unknown>;
}
interface ImportEdge {
  sourceNodeId: string;
  sourceHandle?: string | null;
  targetNodeId: string;
  targetHandle?: string | null;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const appId = typeof body.appId === "string" ? body.appId : "";
  const graph = body.graph;
  if (!appId || !graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
    return NextResponse.json({ error: "appId and graph {nodes, edges} required" }, { status: 400 });
  }

  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) return NextResponse.json({ error: "app not found" }, { status: 404 });

  // Remap node ids to fresh ones so imports never collide with existing rows.
  const idMap = new Map<string, string>();
  for (const n of graph.nodes as ImportNode[]) idMap.set(n.id, randomUUID());

  const name = typeof graph.name === "string" && graph.name.trim() ? graph.name.trim() : "Imported graph";

  const created = await prisma.graph.create({
    data: {
      appId,
      name,
      viewport: typeof graph.viewport === "string" ? graph.viewport : null,
      nodes: {
        create: (graph.nodes as ImportNode[]).map((n) => ({
          id: idMap.get(n.id),
          type: n.type,
          title: n.title,
          posX: typeof n.posX === "number" ? n.posX : 0,
          posY: typeof n.posY === "number" ? n.posY : 0,
          data: JSON.stringify(n.data ?? {}),
        })),
      },
      edges: {
        create: (graph.edges as ImportEdge[])
          .filter((e) => idMap.has(e.sourceNodeId) && idMap.has(e.targetNodeId))
          .map((e) => ({
            sourceNodeId: idMap.get(e.sourceNodeId) as string,
            sourceHandle: e.sourceHandle ?? null,
            targetNodeId: idMap.get(e.targetNodeId) as string,
            targetHandle: e.targetHandle ?? null,
          })),
      },
    },
  });

  return NextResponse.json({ id: created.id, name: created.name }, { status: 201 });
}
