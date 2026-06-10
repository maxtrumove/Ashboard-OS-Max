import type { Edge } from "@xyflow/react";
import type { GraphEdge, GraphNode } from "@/lib/engine/compile";
import type { PuppetNode } from "./store";

export function toGraphNodes(nodes: PuppetNode[]): GraphNode[] {
  return nodes.map((n) => ({
    id: n.id,
    type: n.data.nodeType,
    title: n.data.title,
    data: n.data.values,
  }));
}

export function toGraphEdges(edges: Edge[]): GraphEdge[] {
  return edges.map((e) => ({
    sourceNodeId: e.source,
    sourceHandle: e.sourceHandle,
    targetNodeId: e.target,
    targetHandle: e.targetHandle,
  }));
}

export interface SavePayload {
  nodes: { id: string; type: string; title: string; posX: number; posY: number; data: Record<string, unknown> }[];
  edges: GraphEdge[];
  viewport?: string;
}

export function toSavePayload(nodes: PuppetNode[], edges: Edge[]): SavePayload {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.data.nodeType,
      title: n.data.title,
      posX: n.position.x,
      posY: n.position.y,
      data: n.data.values,
    })),
    edges: toGraphEdges(edges),
  };
}

export function fromDbNodes(
  dbNodes: { id: string; type: string; title: string; posX: number; posY: number; data: Record<string, unknown> }[],
): PuppetNode[] {
  return dbNodes.map((n) => ({
    id: n.id,
    type: "puppet",
    position: { x: n.posX, y: n.posY },
    data: { nodeType: n.type as PuppetNode["data"]["nodeType"], title: n.title, values: n.data ?? {} },
  }));
}

export function fromDbEdges(
  dbEdges: { id: string; sourceNodeId: string; sourceHandle: string | null; targetNodeId: string; targetHandle: string | null }[],
): Edge[] {
  return dbEdges.map((e) => ({
    id: e.id,
    source: e.sourceNodeId,
    sourceHandle: e.sourceHandle ?? undefined,
    target: e.targetNodeId,
    targetHandle: e.targetHandle ?? undefined,
    animated: true,
  }));
}
