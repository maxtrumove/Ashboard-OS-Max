"use client";

import { useMemo } from "react";
import { type CompiledCall, compileAgentCall } from "@/lib/engine/compile";
import { runGraphStream } from "./runner";
import { toGraphEdges, toGraphNodes } from "./serialize";
import { useCanvasStore } from "./store";

export function PreviewPanel() {
  const selectedId = useCanvasStore((s) => s.selectedId);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const graphId = useCanvasStore((s) => s.graphId);
  const running = useCanvasStore((s) => s.running);
  const runState = useCanvasStore((s) => (selectedId ? s.runStates[selectedId] : undefined));

  const artifact = useCanvasStore((s) => (selectedId ? s.artifacts[selectedId] : undefined));
  const appResult = useCanvasStore((s) => (selectedId ? s.appResults[selectedId] : undefined));

  const selected = nodes.find((n) => n.id === selectedId);
  const nodeType = selected?.data.nodeType;
  const isAgent = nodeType === "agent";

  const compiled = useMemo<CompiledCall | null>(() => {
    if (!isAgent || !selectedId) return null;
    try {
      return compileAgentCall(selectedId, toGraphNodes(nodes), toGraphEdges(edges));
    } catch {
      return null;
    }
  }, [isAgent, selectedId, nodes, edges]);

  if (nodeType === "build") {
    return (
      <div className="space-y-3 p-4 text-xs">
        <Section title="Build artifact">
          {artifact ? (
            <>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-slate-300">{artifact.target}</span>
                <button
                  onClick={() => downloadText(artifact.target, artifact.content)}
                  className="rounded bg-accent px-2 py-1 text-[11px] text-white"
                >
                  Download
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-slate-400">{artifact.content}</pre>
            </>
          ) : (
            <span className="text-slate-600">
              Wire an Agent&apos;s output into this Build node and run to capture an artifact.
            </span>
          )}
        </Section>
      </div>
    );
  }

  if (nodeType === "app") {
    return (
      <div className="space-y-3 p-4 text-xs">
        <Section title="Sub-graph result">
          {appResult ? (
            <pre className="whitespace-pre-wrap text-slate-400">{appResult}</pre>
          ) : (
            <span className="text-slate-600">
              Set this App node&apos;s Graph id to another graph, then run to execute it as a sub-system.
            </span>
          )}
        </Section>
      </div>
    );
  }

  if (!isAgent) {
    return (
      <div className="p-4 text-xs text-slate-500">
        Select an <span className="text-slate-300">Agent</span> node to preview the assembled prompt
        and run it.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-panelborder px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Live preview
        </span>
        <button
          disabled={running || !graphId}
          onClick={() => graphId && selectedId && runGraphStream(graphId, selectedId)}
          className="rounded bg-accent px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {running ? "Running…" : "Run this agent"}
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4 text-xs">
        {compiled && (
          <>
            <Section title={`Provider: ${compiled.provider}${compiled.model ? ` · ${compiled.model}` : ""}`}>
              <span className="text-slate-500">
                temp {compiled.temperature} · maxTokens {compiled.maxTokens}
              </span>
            </Section>

            {compiled.system && (
              <Section title="System">
                <pre className="whitespace-pre-wrap text-slate-400">{compiled.system}</pre>
              </Section>
            )}

            <Section title={`Messages (${compiled.messages.length})`}>
              {compiled.messages.map((m, i) => (
                <div key={i} className="mb-2">
                  <span className="text-accent">{m.role}:</span>
                  <pre className="whitespace-pre-wrap text-slate-400">{m.content}</pre>
                </div>
              ))}
            </Section>

            {compiled.tools.length > 0 && (
              <Section title={`Tools (${compiled.tools.length})`}>
                {compiled.tools.map((t) => (
                  <div key={t.name} className="text-slate-400">
                    <span className="text-sky-400">{t.name}</span> — {t.description}
                  </div>
                ))}
              </Section>
            )}
          </>
        )}

        <Section title="Output">
          {runState?.error ? (
            <pre className="whitespace-pre-wrap text-red-400">{runState.error}</pre>
          ) : runState?.output ? (
            <pre className="whitespace-pre-wrap text-emerald-300">{runState.output}</pre>
          ) : (
            <span className="text-slate-600">Run to see streamed output.</span>
          )}
        </Section>
      </div>
    </div>
  );
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "artifact.txt";
  a.click();
  URL.revokeObjectURL(url);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-panelborder bg-canvas p-2">
      <div className="mb-1 text-[11px] font-medium text-slate-300">{title}</div>
      {children}
    </div>
  );
}
