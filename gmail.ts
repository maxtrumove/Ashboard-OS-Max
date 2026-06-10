// Starter graphs created via the import endpoint (node ids are remapped server-side).

interface TemplateNode {
  id: string;
  type: string;
  title: string;
  posX: number;
  posY: number;
  data: Record<string, unknown>;
}
interface TemplateEdge {
  sourceNodeId: string;
  sourceHandle: string;
  targetNodeId: string;
  targetHandle: string;
}
export interface GraphTemplate {
  key: string;
  label: string;
  description: string;
  name: string;
  nodes: TemplateNode[];
  edges: TemplateEdge[];
}

const agent = (id: string, title: string, x: number, y: number, extra: Record<string, unknown> = {}) => ({
  id,
  type: "agent",
  title,
  posX: x,
  posY: y,
  data: { provider: "mock", model: "", temperature: 0.7, maxTokens: 1024, systemExtra: "", ...extra },
});
const prompt = (id: string, title: string, x: number, y: number, text: string) => ({
  id,
  type: "prompt",
  title,
  posX: x,
  posY: y,
  data: { role: "user", text },
});

export const TEMPLATES: GraphTemplate[] = [
  {
    key: "single",
    label: "Single agent",
    description: "One prompt feeding one agent.",
    name: "Single agent",
    nodes: [prompt("p", "Idea", 0, 40, "Describe and refine this idea: {{idea}}"), agent("a", "Agent", 320, 40)],
    edges: [{ sourceNodeId: "p", sourceHandle: "out", targetNodeId: "a", targetHandle: "prompt" }],
  },
  {
    key: "fanout",
    label: "Fan-out compare",
    description: "One idea sent to two agents in parallel.",
    name: "Fan-out compare",
    nodes: [
      prompt("p", "Idea", 0, 80, "Give your best take on: {{idea}}"),
      agent("a1", "Agent A", 320, 0),
      agent("a2", "Agent B", 320, 180),
    ],
    edges: [
      { sourceNodeId: "p", sourceHandle: "out", targetNodeId: "a1", targetHandle: "prompt" },
      { sourceNodeId: "p", sourceHandle: "out", targetNodeId: "a2", targetHandle: "prompt" },
    ],
  },
  {
    key: "build",
    label: "Prompt → Agent → Build",
    description: "Capture the agent's output into a downloadable artifact.",
    name: "Spec writer",
    nodes: [
      prompt("p", "Brief", 0, 40, "Write a short spec for: {{idea}}"),
      agent("a", "Agent", 320, 40),
      { id: "b", type: "build", title: "Spec", posX: 640, posY: 40, data: { target: "spec.md", template: "# Spec" } },
    ],
    edges: [
      { sourceNodeId: "p", sourceHandle: "out", targetNodeId: "a", targetHandle: "prompt" },
      { sourceNodeId: "a", sourceHandle: "out", targetNodeId: "b", targetHandle: "content" },
    ],
  },
  {
    key: "tool",
    label: "Tool-using agent",
    description: "An agent with a connector tool (pick a connector after creating).",
    name: "Tool-using agent",
    nodes: [
      prompt("p", "Task", 0, 40, "Use your tools to handle: {{idea}}"),
      { id: "c", type: "connector", title: "Connector", posX: 0, posY: 200, data: { toolName: "tool", toolDescription: "An external tool", connectorDefId: "" } },
      agent("a", "Agent", 360, 100),
    ],
    edges: [
      { sourceNodeId: "p", sourceHandle: "out", targetNodeId: "a", targetHandle: "prompt" },
      { sourceNodeId: "c", sourceHandle: "out", targetNodeId: "a", targetHandle: "tools" },
    ],
  },
];
