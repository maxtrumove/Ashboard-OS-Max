"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { use, useState } from "react";
import { api } from "@/lib/api";

interface AppItem {
  id: string;
  name: string;
  kind: string;
  _count: { graphs: number };
}
interface ProjectDetail {
  id: string;
  name: string;
  apps: AppItem[];
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const [name, setName] = useState("");

  const { data } = useQuery({
    queryKey: ["project", id],
    queryFn: () => api<ProjectDetail>(`/api/projects/${id}`),
  });

  const create = useMutation({
    mutationFn: () =>
      api("/api/apps", { method: "POST", body: JSON.stringify({ projectId: id, name }) }),
    onSuccess: () => {
      setName("");
      qc.invalidateQueries({ queryKey: ["project", id] });
    },
  });

  const remove = useMutation({
    mutationFn: (appId: string) => api(`/api/apps/${appId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["project", id] }),
  });

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link href="/" className="text-sm text-slate-400 hover:text-slate-100">
        ← Projects
      </Link>
      <h1 className="mb-1 mt-2 text-2xl font-semibold text-slate-100">{data?.name ?? "…"}</h1>
      <p className="mb-6 text-sm text-slate-400">Apps &amp; systems in this project.</p>

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
          placeholder="New app / system name"
          className="flex-1 rounded border border-panelborder bg-panel px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button type="submit" className="rounded bg-accent px-4 py-2 text-sm font-medium text-white">
          Create
        </button>
      </form>

      <ul className="space-y-2">
        {(data?.apps ?? []).map((a) => (
          <li
            key={a.id}
            className="flex items-center justify-between rounded border border-panelborder bg-panel px-4 py-3"
          >
            <Link href={`/apps/${a.id}`} className="flex-1">
              <span className="font-medium text-slate-100">{a.name}</span>
              <span className="ml-3 text-xs text-slate-500">{a._count.graphs} graph(s)</span>
            </Link>
            <button
              onClick={() => remove.mutate(a.id)}
              className="text-xs text-slate-500 hover:text-red-400"
            >
              Delete
            </button>
          </li>
        ))}
        {data && data.apps.length === 0 && (
          <p className="text-slate-500">No apps yet. Create one above.</p>
        )}
      </ul>
    </div>
  );
}
