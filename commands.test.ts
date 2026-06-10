import type { RunEvent } from "@/lib/engine/run";
import { useCanvasStore } from "./store";

/**
 * POST to the run endpoint and stream NDJSON events into the canvas store.
 * Each line is one JSON event tagged by nodeId.
 */
export async function runGraphStream(graphId: string, onlyAgentId?: string) {
  const store = useCanvasStore.getState();
  const agentIds = store.nodes
    .filter((n) => n.data.nodeType === "agent")
    .filter((n) => !onlyAgentId || n.id === onlyAgentId)
    .map((n) => n.id);

  store.startRun(agentIds);

  let res: Response;
  try {
    res = await fetch(`/api/graphs/${graphId}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onlyAgentId, runVars: store.runVars }),
    });
  } catch (err) {
    agentIds.forEach((id) => store.failStep(id, err instanceof Error ? err.message : String(err)));
    store.endRun();
    return;
  }

  if (!res.ok || !res.body) {
    agentIds.forEach((id) => store.failStep(id, `Run failed: ${res.status}`));
    store.endRun();
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      let evt: RunEvent;
      try {
        evt = JSON.parse(line) as RunEvent;
      } catch {
        continue;
      }
      dispatch(evt);
    }
  }
  useCanvasStore.getState().endRun();
}

function dispatch(evt: RunEvent) {
  const store = useCanvasStore.getState();
  switch (evt.type) {
    case "step-start":
      store.setStepRunning(evt.nodeId);
      break;
    case "delta":
      store.appendDelta(evt.nodeId, evt.text);
      break;
    case "step-end":
      store.finishStep(evt.nodeId);
      break;
    case "app-result":
      store.setAppResult(evt.nodeId, evt.output);
      break;
    case "artifact":
      store.setArtifact(evt.nodeId, evt.target, evt.content);
      break;
    case "tool-call":
      store.addToolCall(evt.nodeId, evt.tool, evt.output);
      break;
    case "error":
      if (evt.nodeId) store.failStep(evt.nodeId, evt.message);
      break;
    default:
      break;
  }
}
