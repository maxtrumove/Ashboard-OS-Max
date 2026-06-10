"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { getNodeDefinition } from "@/lib/nodes/registry";
import { useCanvasStore } from "./store";
import type { PuppetNodeData } from "./store";

export function PuppetNodeView({ id, data, selected }: NodeProps) {
  const nodeData = data as PuppetNodeData;
  const def = getNodeDefinition(nodeData.nodeType);
  const runState = useCanvasStore((s) => s.runStates[id]);
  if (!def) return null;

  const summaryField = def.fields.find((f) => f.control === "textarea" || f.control === "text");
  const summary = summaryField ? String(nodeData.values[summaryField.key] ?? "") : "";

  return (
    <div
      className="w-56 rounded-lg border bg-panel text-xs shadow-lg"
      style={{ borderColor: selected ? def.color : "#262b38" }}
    >
      <div
        className="flex items-center justify-between rounded-t-lg px-2 py-1.5 font-medium text-white"
        style={{ background: def.color }}
      >
        <span>{nodeData.title}</span>
        <span className="opacity-75">{def.label}</span>
      </div>

      <div className="px-2 py-2 text-slate-300">
        {summary ? (
          <p className="line-clamp-3 whitespace-pre-wrap text-slate-400">{summary}</p>
        ) : (
          <p className="italic text-slate-600">empty</p>
        )}
        {nodeData.nodeType === "agent" && (
          <p className="mt-1 text-[10px] text-slate-500">
            provider: {String(nodeData.values.provider ?? "mock")}
          </p>
        )}
        {runState && (
          <p
            className="mt-1 text-[10px]"
            style={{
              color:
                runState.status === "failed"
                  ? "#f87171"
                  : runState.status === "succeeded"
                    ? "#4ade80"
                    : "#fbbf24",
            }}
          >
            {runState.status}
          </p>
        )}
      </div>

      {def.ports.inputs.map((port, i) => (
        <Handle
          key={port.id}
          id={port.id}
          type="target"
          position={Position.Left}
          style={{ top: 38 + i * 16, background: "#4b5366" }}
          title={port.label}
        />
      ))}
      {def.ports.outputs.map((port, i) => (
        <Handle
          key={port.id}
          id={port.id}
          type="source"
          position={Position.Right}
          style={{ top: 38 + i * 16, background: def.color }}
          title={port.label}
        />
      ))}
    </div>
  );
}
