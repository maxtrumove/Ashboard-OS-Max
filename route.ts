"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { use, useState } from "react";
import { api } from "@/lib/api";
import { TEMPLATES } from "@/components/canvas/templates";

interface GraphItem {
  id: string;
  name: string;
  _count: { nodes: number };
}
interface AppDetail {
  id: string;
  name: string;
  project: { id: string; name: string };
  graphs: GraphItem[];
}

export default function AppPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const [name, setName] = useState("");

  const { data } = useQuery({
    queryKey: ["app", id],
    queryFn: () => api<AppDetail>(`/api/apps/${id}`),
  });

  const create = useMutation({
    mutationFn: () => api("/api/graphs", { method: "POST", body: JSON.stringify({ appId: id, name }) }),
    onSuccess: () => {
      setName("");
      qc.invalidateQueries({ queryKey: ["app", id] });
    },
  });

  const remove = useMutation({
    mutationFn: (graphId: string) => api(`/api/graphs/${graphId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["app", id] }),
  });

  const importGraph = useMutation({
    mutationFn: (graph: unknown) =>
      api("/api/graphs/import", { method: "POST", body: JSON.stringify({ appId: id, graph }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["app", id] }),
  });

  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      importGraph.mutate(JSON.parse(await file.text()));
    } catch {
      alert("Could not parse that file as a graph JSON.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-8">
      {data && (
        <Link href={`/projects/${data.project.id}`} className="text-sm text-slate-400 hover:text-slate-100">
          ← {data.project.name}
        </Link>
      )}
      <h1 className="mb-1 mt-2 text-2xl font-semibold text-slate-100">{data?.name ?? "…"}</h1>
      <p className="mb-6 text-sm text-slate-400">Graphs (agent workflows) in this app.</p>

      <form
        className="mb-8 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) create.mutate();
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New graph name"
          className="flex-1 rounded border border-panelborder bg-panel px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button type="submit" className="rounded bg-accent px-4 py-2 text-sm font-medium text-white">
          Create
        </button>
        <label className="cursor-pointer rounded border border-panelborder px-4 py-2 text-sm text-slate-300 hover:border-accent">
          Import
          <input type="file" accept="application/json,.json" onChange={onImportFile} className="hidden" />
        </label>
      </form>

      <div className="mb-8">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Start from a template
        </div>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.key}
              onClick={() => importGraph.mutate(t)}
              title={t.description}
              className="rounded border border-panelborder bg-panel px-3 py-2 text-xs text-slate-200 hover:border-accent"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-2">
        {(data?.graphs ?? []).map((g) => (
          <li
            key={g.id}
            className="flex items-center justify-between rounded border border-panelborder bg-panel px-4 py-3"
          >
            <Link href={`/graphs/${g.id}`} className="flex-1">
              <span className="font-medium text-slate-100">{g.name}</span>
              <span className="ml-3 text-xs text-slate-500">{g._count.nodes} node(s)</span>
            </Link>
            <button
              onClick={() => remove.mutate(g.id)}
              className="text-xs text-slate-500 hover:text-red-400"
            >
              Delete
            </button>
          </li>
        ))}
        {data && data.graphs.length === 0 && (
          <p className="text-slate-500">No graphs yet. Create one above.</p>
        )}
      </ul>
    </div>
  );
}
