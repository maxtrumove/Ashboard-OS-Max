"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { useCanvasStore } from "./store";

interface RunStep {
  id: string;
  nodeId: string;
  sequence: number;
  status: string;
  output: string | null;
  error: string | null;
}
interface Run {
  id: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  steps: RunStep[];
}

export function RunHistory() {
  const graphId = useCanvasStore((s) => s.graphId);
  const running = useCanvasStore((s) => s.running);
  const nodes = useCanvasStore((s) => s.nodes);
  const [openId, setOpenId] = useState<string | null>(null);

  const titleFor = (nodeId: string) =>
    nodes.find((n) => n.id === nodeId)?.data.title ?? nodeId;

  const { data: runs = [], isLoading } = useQuery({
    queryKey: ["runs", graphId],
    queryFn: () => api<Run[]>(`/api/graphs/${graphId}/runs`),
    enabled: !!graphId,
    // Poll while a run is in progress so finished steps appear.
    refetchInterval: running ? 1500 : false,
  });

  if (!graphId) return null;
  if (isLoading) return <div className="p-4 text-xs text-slate-500">Loading…</div>;
  if (runs.length === 0)
    return <div className="p-4 text-xs text-slate-500">No runs yet. Run a graph to see history.</div>;

  return (
    <div className="space-y-2 p-3 text-xs">
      {runs.map((run) => (
        <div key={run.id} className="rounded border border-panelborder bg-canvas">
          <button
            onClick={() => setOpenId(openId === run.id ? null : run.id)}
            className="flex w-full items-center justify-between px-2 py-1.5 text-left"
          >
            <span style={{ color: statusColor(run.status) }}>{run.status}</span>
            <span className="text-slate-500">
              {new Date(run.startedAt).toLocaleTimeString()} · {run.steps.length} step(s)
            </span>
          </button>
          {openId === run.id && (
            <div className="space-y-2 border-t border-panelborder p-2">
              {run.steps.map((step) => (
                <div key={step.id}>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">{titleFor(step.nodeId)}</span>
                    <span style={{ color: statusColor(step.status) }}>{step.status}</span>
                  </div>
                  {step.error ? (
                    <pre className="whitespace-pre-wrap text-red-400">{step.error}</pre>
                  ) : step.output ? (
                    <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap text-slate-500">
                      {step.output}
                    </pre>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function statusColor(status: string): string {
  if (status === "failed") return "#f87171";
  if (status === "succeeded") return "#4ade80";
  if (status === "running") return "#fbbf24";
  return "#94a3b8";
}
