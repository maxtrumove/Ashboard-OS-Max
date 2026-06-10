"use client";

import { NODE_LIST } from "@/lib/nodes/registry";
import { useCanvasStore } from "./store";

export function Palette() {
  const addNode = useCanvasStore((s) => s.addNode);

  return (
    <div className="flex w-44 flex-col gap-2 border-r border-panelborder bg-panel p-3">
      <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Node palette
      </h2>
      {NODE_LIST.map((def) => (
        <button
          key={def.type}
          onClick={() => addNode(def.type, { x: 120 + Math.random() * 200, y: 80 + Math.random() * 200 })}
          draggable
          onDragStart={(e) => e.dataTransfer.setData("application/puppet-node", def.type)}
          className="flex items-center gap-2 rounded border border-panelborder bg-canvas px-2 py-2 text-left text-xs text-slate-200 hover:border-accent"
          title={def.description}
        >
          <span className="h-3 w-3 rounded-sm" style={{ background: def.color }} />
          {def.label}
        </button>
      ))}
      <p className="mt-2 text-[10px] leading-snug text-slate-600">
        Click or drag to add. Wire ports left→right. Select a node to edit it.
      </p>
    </div>
  );
}
