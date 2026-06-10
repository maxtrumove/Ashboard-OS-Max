"use client";

import {
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "@xyflow/react";
import { create } from "zustand";
import { NODE_DEFINITIONS, getNodeDefinition, isConnectionValid } from "@/lib/nodes/registry";
import type { NodeType } from "@/lib/nodes/types";

export interface PuppetNodeData extends Record<string, unknown> {
  nodeType: NodeType;
  title: string;
  values: Record<string, unknown>;
}

export type PuppetNode = Node<PuppetNodeData>;

export interface NodeRunState {
  status: "idle" | "running" | "succeeded" | "failed";
  output: string;
  error?: string;
}

interface CanvasState {
  graphId: string | null;
  nodes: PuppetNode[];
  edges: Edge[];
  selectedId: string | null;
  running: boolean;
  runStates: Record<string, NodeRunState>;
  artifacts: Record<string, { target: string; content: string }>;
  appResults: Record<string, string>;
  runVars: Record<string, string>;
  dirty: boolean;

  setGraph: (graphId: string, nodes: PuppetNode[], edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (conn: Connection) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeValues: (id: string, values: Record<string, unknown>) => void;
  updateNodeTitle: (id: string, title: string) => void;
  removeNode: (id: string) => void;
  select: (id: string | null) => void;
  markSaved: () => void;
  setRunVar: (key: string, value: string) => void;

  startRun: (nodeIds: string[]) => void;
  setStepRunning: (nodeId: string) => void;
  appendDelta: (nodeId: string, text: string) => void;
  finishStep: (nodeId: string) => void;
  failStep: (nodeId: string, error: string) => void;
  setArtifact: (nodeId: string, target: string, content: string) => void;
  setAppResult: (nodeId: string, output: string) => void;
  addToolCall: (nodeId: string, tool: string, output: string) => void;
  endRun: () => void;
}

let idCounter = 0;
function makeId(type: string) {
  idCounter += 1;
  return `${type}-${Date.now().toString(36)}-${idCounter}`;
}

function portRole(nodeType: NodeType, handleId: string | null | undefined, dir: "in" | "out") {
  const def = getNodeDefinition(nodeType);
  if (!def) return undefined;
  const ports = dir === "in" ? def.ports.inputs : def.ports.outputs;
  return (ports.find((p) => p.id === handleId) ?? ports[0])?.role;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  graphId: null,
  nodes: [],
  edges: [],
  selectedId: null,
  running: false,
  runStates: {},
  artifacts: {},
  appResults: {},
  runVars: {},
  dirty: false,

  setGraph: (graphId, nodes, edges) =>
    set({
      graphId,
      nodes,
      edges,
      selectedId: null,
      dirty: false,
      runStates: {},
      artifacts: {},
      appResults: {},
      runVars: {},
    }),

  onNodesChange: (changes) =>
    set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) as PuppetNode[], dirty: true })),

  onEdgesChange: (changes) =>
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges), dirty: true })),

  onConnect: (conn) => {
    const { nodes } = get();
    const source = nodes.find((n) => n.id === conn.source);
    const target = nodes.find((n) => n.id === conn.target);
    if (!source || !target) return;
    const sourceRole = portRole(source.data.nodeType, conn.sourceHandle, "out");
    const targetRole = portRole(target.data.nodeType, conn.targetHandle, "in");
    if (!sourceRole || !targetRole || !isConnectionValid(sourceRole, targetRole)) return;
    set((s) => ({ edges: addEdge({ ...conn, animated: true }, s.edges), dirty: true }));
  },

  addNode: (type, position) => {
    const def = NODE_DEFINITIONS[type];
    const id = makeId(type);
    const node: PuppetNode = {
      id,
      type: "puppet",
      position,
      data: { nodeType: type, title: def.label, values: { ...def.defaults } },
    };
    set((s) => ({ nodes: [...s.nodes, node], selectedId: id, dirty: true }));
  },

  updateNodeValues: (id, values) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, values: { ...n.data.values, ...values } } } : n,
      ),
      dirty: true,
    })),

  updateNodeTitle: (id, title) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, title } } : n)),
      dirty: true,
    })),

  removeNode: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
      dirty: true,
    })),

  select: (id) => set({ selectedId: id }),
  markSaved: () => set({ dirty: false }),
  setRunVar: (key, value) => set((s) => ({ runVars: { ...s.runVars, [key]: value } })),

  startRun: (nodeIds) =>
    set(() => ({
      running: true,
      artifacts: {},
      appResults: {},
      runStates: Object.fromEntries(
        nodeIds.map((id) => [id, { status: "running", output: "" } as NodeRunState]),
      ),
    })),

  setStepRunning: (nodeId) =>
    set((s) => ({
      runStates: { ...s.runStates, [nodeId]: { status: "running", output: "" } },
    })),

  appendDelta: (nodeId, text) =>
    set((s) => {
      const prev = s.runStates[nodeId] ?? { status: "running", output: "" };
      return { runStates: { ...s.runStates, [nodeId]: { ...prev, output: prev.output + text } } };
    }),

  finishStep: (nodeId) =>
    set((s) => {
      const prev = s.runStates[nodeId] ?? { status: "running", output: "" };
      return { runStates: { ...s.runStates, [nodeId]: { ...prev, status: "succeeded" } } };
    }),

  failStep: (nodeId, error) =>
    set((s) => {
      const prev = s.runStates[nodeId] ?? { status: "running", output: "" };
      return { runStates: { ...s.runStates, [nodeId]: { ...prev, status: "failed", error } } };
    }),

  setArtifact: (nodeId, target, content) =>
    set((s) => ({ artifacts: { ...s.artifacts, [nodeId]: { target, content } } })),

  setAppResult: (nodeId, output) =>
    set((s) => ({ appResults: { ...s.appResults, [nodeId]: output } })),

  addToolCall: (nodeId, tool, output) =>
    set((s) => {
      const prev = s.runStates[nodeId] ?? { status: "running", output: "" };
      const line = `\n→ tool ${tool}: ${output}\n`;
      return { runStates: { ...s.runStates, [nodeId]: { ...prev, output: prev.output + line } } };
    }),

  endRun: () => set({ running: false }),
}));
