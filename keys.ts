"use client";

import "@xyflow/react/dist/style.css";
import {
  Background,
  Controls,
  type NodeTypes,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { NodeType } from "@/lib/nodes/types";
import { Inspector } from "./Inspector";
import { Palette } from "./Palette";
import { PreviewPanel } from "./PreviewPanel";
import { PuppetNodeView } from "./PuppetNodeView";
import { RunHistory } from "./RunHistory";
import { runGraphStream } from "./runner";
import { fromDbEdges, fromDbNodes, toSavePayload } from "./serialize";
import { useCanvasStore } from "./store";
import { VariablesBar } from "./VariablesBar";

const nodeTypes: NodeTypes = { puppet: PuppetNodeView };

function exportGraph(name: string) {
  const { nodes, edges } = useCanvasStore.getState();
  const payload = { name, ...toSavePayload(nodes, edges) };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/[^\w.-]+/g, "_") || "graph"}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

interface GraphData {
  id: string;
  name: string;
  nodes: { id: string; type: string; title: string; posX: number; posY: number; data: Record<string, unknown> }[];
  edges: { id: string; sourceNodeId: string; sourceHandle: string | null; targetNodeId: string; targetHandle: string | null }[];
  app: { id: string; name: string; project: { id: string; name: string } };
}

export function CanvasEditor({ graphId }: { graphId: string }) {
  return (
    <ReactFlowProvider>
      <Flow graphId={graphId} />
    </ReactFlowProvider>
  );
}

function Flow({ graphId }: { graphId: string }) {
  const { screenToFlowPosition } = useReactFlow();
  const [tab, setTab] = useState<"inspect" | "preview" | "history">("inspect");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [graphName, setGraphName] = useState("");

  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const dirty = useCanvasStore((s) => s.dirty);
  const running = useCanvasStore((s) => s.running);
  const selectedId = useCanvasStore((s) => s.selectedId);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const onConnect = useCanvasStore((s) => s.onConnect);
  const setGraph = useCanvasStore((s) => s.setGraph);
  const select = useCanvasStore((s) => s.select);
  const addNode = useCanvasStore((s) => s.addNode);
  const markSaved = useCanvasStore((s) => s.markSaved);

  const { data } = useQuery({
    queryKey: ["graph", graphId],
    queryFn: () => api<GraphData>(`/api/graphs/${graphId}`),
  });

  // Hydrate the store once the graph loads.
  useEffect(() => {
    if (data) {
      setGraph(graphId, fromDbNodes(data.nodes), fromDbEdges(data.edges));
      setGraphName(data.name);
    }
  }, [data, graphId, setGraph]);

  const renameGraph = () => {
    void api(`/api/graphs/${graphId}`, { method: "PATCH", body: JSON.stringify({ name: graphName }) });
  };

  // Switch to the preview tab automatically when an agent node is selected.
  useEffect(() => {
    const node = useCanvasStore.getState().nodes.find((n) => n.id === selectedId);
    if (node?.data.nodeType === "agent") setTab("preview");
  }, [selectedId]);

  // Debounced autosave.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!dirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveState("saving");
      try {
        await api(`/api/graphs/${graphId}`, {
          method: "PATCH",
          body: JSON.stringify(toSavePayload(useCanvasStore.getState().nodes, useCanvasStore.getState().edges)),
        });
        markSaved();
        setSaveState("saved");
      } catch {
        setSaveState("idle");
      }
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [dirty, nodes, edges, graphId, markSaved]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/puppet-node") as NodeType;
      if (!type) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      addNode(type, position);
    },
    [screenToFlowPosition, addNode],
  );

  return (
    <div className="flex h-full">
      <Palette />

      <div className="relative min-w-0 flex-1">
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-panelborder bg-panel/80 px-4 py-2 backdrop-blur">
          <div className="flex items-center gap-3 text-sm">
            {data && (
              <Link href={`/apps/${data.app.id}`} className="text-slate-400 hover:text-slate-100">
                ← {data.app.name}
              </Link>
            )}
            <input
              value={graphName}
              onChange={(e) => setGraphName(e.target.value)}
              onBlur={renameGraph}
              className="rounded bg-transparent px-1 font-medium text-slate-100 outline-none focus:bg-canvas"
            />
            <span className="text-[11px] text-slate-500">
              {saveState === "saving" ? "saving…" : saveState === "saved" && !dirty ? "saved" : dirty ? "unsaved" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportGraph(data?.name ?? "graph")}
              className="rounded border border-panelborder px-3 py-1 text-xs text-slate-300 hover:border-accent"
            >
              Export
            </button>
            <button
              disabled={running}
              onClick={() => runGraphStream(graphId)}
              className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
            >
              {running ? "Running…" : "Run all agents"}
            </button>
          </div>
        </div>

        <div className="h-full pt-11" onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
          {nodes.length === 0 && (
            <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center">
              <p className="text-sm text-slate-600">
                Drag a node from the palette to begin — or start from a template on the app page.
              </p>
            </div>
          )}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => select(node.id)}
            onPaneClick={() => select(null)}
            deleteKeyCode={["Backspace", "Delete"]}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#262b38" gap={18} />
            <Controls className="!bg-panel" />
          </ReactFlow>
        </div>
      </div>

      <div className="flex w-[360px] flex-col border-l border-panelborder bg-panel">
        <VariablesBar />
        <div className="flex border-b border-panelborder text-xs">
          {(["inspect", "preview", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 px-3 py-2 ${
                tab === t ? "border-b-2 border-accent text-slate-100" : "text-slate-500"
              }`}
            >
              {t === "inspect" ? "Inspector" : t === "preview" ? "Live preview" : "History"}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          {tab === "inspect" ? <Inspector /> : tab === "preview" ? <PreviewPanel /> : <RunHistory />}
        </div>
      </div>
    </div>
  );
}
