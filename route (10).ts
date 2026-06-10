"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";

interface Project {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
  _count: { apps: number };
}

export default function HomePage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api<Project[]>("/api/projects"),
  });

  const create = useMutation({
    mutationFn: () => api<Project>("/api/projects", { method: "POST", body: JSON.stringify({ name }) }),
    onSuccess: () => {
      setName("");
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-1 text-2xl font-semibold text-slate-100">Projects</h1>
      <p className="mb-6 text-sm text-slate-400">
        Organize your work as Projects → Apps/Systems → Graphs.
      </p>

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
          placeholder="New project name"
          className="flex-1 rounded border border-panelborder bg-panel px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          disabled={create.isPending}
        >
          Create
        </button>
      </form>

      {isLoading ? (
        <p className="text-slate-500">Loading…</p>
      ) : projects.length === 0 ? (
        <p className="text-slate-500">No projects yet. Create one above.</p>
      ) : (
        <ul className="space-y-2">
          {projects.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded border border-panelborder bg-panel px-4 py-3"
            >
              <Link href={`/projects/${p.id}`} className="flex-1">
                <span className="font-medium text-slate-100">{p.name}</span>
                <span className="ml-3 text-xs text-slate-500">{p._count.apps} app(s)</span>
              </Link>
              <button
                onClick={() => remove.mutate(p.id)}
                className="text-xs text-slate-500 hover:text-red-400"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
