import { prisma } from "@/lib/db";
import { resolveProviderKey } from "@/lib/engine/keys";
import { type RunEvent, runGraph } from "@/lib/engine/run";
import type { GraphEdge, GraphNode } from "@/lib/engine/compile";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const onlyAgentId = typeof body.onlyAgentId === "string" ? body.onlyAgentId : undefined;
  const runVars =
    body.runVars && typeof body.runVars === "object" ? (body.runVars as Record<string, string>) : {};

  const graph = await prisma.graph.findUnique({
    where: { id },
    include: { nodes: true, edges: true },
  });
  if (!graph) {
    return new Response(JSON.stringify({ error: "Graph not found" }), { status: 404 });
  }

  const nodes: GraphNode[] = graph.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    data: safeParse(n.data),
  }));
  const edges: GraphEdge[] = graph.edges.map((e) => ({
    sourceNodeId: e.sourceNodeId,
    sourceHandle: e.sourceHandle,
    targetNodeId: e.targetNodeId,
    targetHandle: e.targetHandle,
  }));

  const run = await prisma.run.create({
    data: { graphId: id, status: "running", inputVars: JSON.stringify(runVars) },
  });

  // Loader for Connector tool execution.
  const loadConnector = async (connectorId: string) => {
    const def = await prisma.connectorDef.findUnique({ where: { id: connectorId } });
    if (!def) return null;
    return { kind: def.kind, config: safeParse(def.config) };
  };

  // Loader for App sub-graph nesting.
  const loadGraph = async (graphId: string) => {
    const g = await prisma.graph.findUnique({
      where: { id: graphId },
      include: { nodes: true, edges: true },
    });
    if (!g) return null;
    return {
      nodes: g.nodes.map((n) => ({ id: n.id, type: n.type, title: n.title, data: safeParse(n.data) })),
      edges: g.edges.map((e) => ({
        sourceNodeId: e.sourceNodeId,
        sourceHandle: e.sourceHandle,
        targetNodeId: e.targetNodeId,
        targetHandle: e.targetHandle,
      })),
    };
  };

  const encoder = new TextEncoder();
  const stepIds = new Map<string, string>();
  const outputs = new Map<string, string>();
  let sequence = 0;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (evt: RunEvent | { type: "run-meta"; runId: string }) => {
        controller.enqueue(encoder.encode(JSON.stringify(evt) + "\n"));
      };
      send({ type: "run-meta", runId: run.id });

      let failed = false;
      try {
        for await (const evt of runGraph({
          nodes,
          edges,
          runVars,
          onlyAgentId,
          resolveKey: resolveProviderKey,
          loadGraph,
          loadConnector,
          signal: req.signal,
        })) {
          send(evt);
          if (evt.type === "step-start") {
            const step = await prisma.runStep.create({
              data: {
                runId: run.id,
                nodeId: evt.nodeId,
                sequence: sequence++,
                compiledInput: JSON.stringify(evt.compiled),
                status: "running",
              },
            });
            stepIds.set(evt.nodeId, step.id);
            outputs.set(evt.nodeId, "");
          } else if (evt.type === "delta") {
            outputs.set(evt.nodeId, (outputs.get(evt.nodeId) ?? "") + evt.text);
          } else if (evt.type === "step-end") {
            const stepId = stepIds.get(evt.nodeId);
            if (stepId) {
              await prisma.runStep.update({
                where: { id: stepId },
                data: { output: evt.output, status: "succeeded" },
              });
            }
          } else if (evt.type === "app-result") {
            await prisma.runStep.create({
              data: {
                runId: run.id,
                nodeId: evt.nodeId,
                sequence: sequence++,
                output: evt.output,
                status: "succeeded",
              },
            });
          } else if (evt.type === "artifact") {
            await prisma.runStep.create({
              data: {
                runId: run.id,
                nodeId: evt.nodeId,
                sequence: sequence++,
                output: evt.content,
                status: "succeeded",
              },
            });
          } else if (evt.type === "tool-call") {
            await prisma.runStep.create({
              data: {
                runId: run.id,
                nodeId: evt.nodeId,
                sequence: sequence++,
                output: `tool ${evt.tool}(${evt.input}) → ${evt.output}`,
                status: "succeeded",
              },
            });
          } else if (evt.type === "error") {
            failed = true;
            if (evt.nodeId) {
              const stepId = stepIds.get(evt.nodeId);
              if (stepId) {
                await prisma.runStep.update({
                  where: { id: stepId },
                  data: { status: "failed", error: evt.message },
                });
              }
            }
          }
        }
      } catch (err) {
        failed = true;
        send({ type: "error", message: err instanceof Error ? err.message : String(err) });
      } finally {
        await prisma.run.update({
          where: { id: run.id },
          data: { status: failed ? "failed" : "succeeded", finishedAt: new Date() },
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}

function safeParse(value: string): Record<string, unknown> {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}
