"use client";

import { useMemo } from "react";
import { useCanvasStore } from "./store";
import { extractVariables } from "./vars";

export function VariablesBar() {
  const nodes = useCanvasStore((s) => s.nodes);
  const runVars = useCanvasStore((s) => s.runVars);
  const setRunVar = useCanvasStore((s) => s.setRunVar);

  const vars = useMemo(() => extractVariables(nodes), [nodes]);
  if (vars.length === 0) return null;

  return (
    <div className="border-b border-panelborder bg-canvas/60 p-3">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Run variables
      </div>
      <div className="space-y-2">
        {vars.map((name) => (
          <div key={name} className="flex items-center gap-2">
            <code className="w-24 shrink-0 truncate text-[11px] text-accent">{`{{${name}}}`}</code>
            <input
              value={runVars[name] ?? ""}
              onChange={(e) => setRunVar(name, e.target.value)}
              placeholder="value"
              className="flex-1 rounded border border-panelborder bg-panel px-2 py-1 text-xs outline-none focus:border-accent"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
