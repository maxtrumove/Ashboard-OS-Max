"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getNodeDefinition } from "@/lib/nodes/registry";
import type { FieldDescriptor } from "@/lib/nodes/types";
import { useCanvasStore } from "./store";

export function Inspector() {
  const selectedId = useCanvasStore((s) => s.selectedId);
  const node = useCanvasStore((s) => s.nodes.find((n) => n.id === s.selectedId));
  const updateNodeValues = useCanvasStore((s) => s.updateNodeValues);
  const updateNodeTitle = useCanvasStore((s) => s.updateNodeTitle);
  const removeNode = useCanvasStore((s) => s.removeNode);

  if (!node || !selectedId) {
    return (
      <div className="p-4 text-xs text-slate-500">
        Select a node to edit its variables.
      </div>
    );
  }

  const def = getNodeDefinition(node.data.nodeType);
  if (!def) return null;

  const values = node.data.values;

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {def.label}
        </span>
        <button
          onClick={() => removeNode(selectedId)}
          className="text-[11px] text-slate-500 hover:text-red-400"
        >
          Delete node
        </button>
      </div>

      <div>
        <label className="mb-1 block text-[11px] text-slate-400">Title</label>
        <input
          value={node.data.title}
          onChange={(e) => updateNodeTitle(selectedId, e.target.value)}
          className="w-full rounded border border-panelborder bg-canvas px-2 py-1.5 text-sm outline-none focus:border-accent"
        />
      </div>

      {def.fields.map((field) => (
        <Field
          key={field.key}
          field={field}
          value={values[field.key]}
          onChange={(v) => updateNodeValues(selectedId, { [field.key]: v })}
        />
      ))}
    </div>
  );
}

function Field({
  field,
  value,
  onChange,
}: {
  field: FieldDescriptor;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const base =
    "w-full rounded border border-panelborder bg-canvas px-2 py-1.5 text-sm outline-none focus:border-accent";

  return (
    <div>
      <label className="mb-1 block text-[11px] text-slate-400">{field.label}</label>
      {field.control === "connectorRef" ? (
        <ConnectorSelect value={String(value ?? "")} onChange={onChange} className={base} />
      ) : field.control === "textarea" ? (
        <textarea
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={5}
          className={base}
        />
      ) : field.control === "select" ? (
        <select value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={base}>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : field.control === "number" ? (
        <input
          type="number"
          value={Number(value ?? 0)}
          step="any"
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className={base}
        />
      ) : (
        <input
          type="text"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={base}
        />
      )}
      {field.help && <p className="mt-1 text-[10px] text-slate-600">{field.help}</p>}
    </div>
  );
}

function ConnectorSelect({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: unknown) => void;
  className: string;
}) {
  const { data: connectors = [] } = useQuery({
    queryKey: ["connectors"],
    queryFn: () => api<{ id: string; name: string; kind: string }[]>("/api/connectors"),
  });
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      <option value="">— none —</option>
      {connectors.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name} ({c.kind})
        </option>
      ))}
    </select>
  );
}
