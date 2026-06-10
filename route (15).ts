"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";

interface Cred {
  id: string;
  provider: string;
  label: string;
}

const PROVIDERS = [
  { value: "anthropic", label: "Anthropic (Claude)" },
  { value: "openai", label: "OpenAI (GPT)" },
  { value: "google", label: "Google (Gemini)" },
];

export default function SettingsPage() {
  const qc = useQueryClient();
  const [provider, setProvider] = useState("anthropic");
  const [secret, setSecret] = useState("");

  const { data: creds = [] } = useQuery({
    queryKey: ["credentials"],
    queryFn: () => api<Cred[]>("/api/credentials"),
  });

  const save = useMutation({
    mutationFn: () =>
      api("/api/credentials", { method: "POST", body: JSON.stringify({ provider, secret }) }),
    onSuccess: () => {
      setSecret("");
      qc.invalidateQueries({ queryKey: ["credentials"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/credentials?id=${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["credentials"] }),
  });

  const configured = new Set(creds.map((c) => c.provider));

  return (
    <div className="mx-auto max-w-2xl p-8">
      <Link href="/" className="text-sm text-slate-400 hover:text-slate-100">
        ← Projects
      </Link>
      <h1 className="mb-1 mt-2 text-2xl font-semibold text-slate-100">Provider keys</h1>
      <p className="mb-6 text-sm text-slate-400">
        Keys are encrypted at rest and stored server-side only — they are never sent back to the
        browser. The <code className="text-accent">mock</code> provider needs no key.
      </p>

      <form
        className="mb-8 space-y-3 rounded border border-panelborder bg-panel p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (secret.trim()) save.mutate();
        }}
      >
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="w-full rounded border border-panelborder bg-canvas px-3 py-2 text-sm"
        >
          {PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label} {configured.has(p.value) ? "✓ configured" : ""}
            </option>
          ))}
        </select>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Paste API key"
          className="w-full rounded border border-panelborder bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button type="submit" className="rounded bg-accent px-4 py-2 text-sm font-medium text-white">
          {configured.has(provider) ? "Update key" : "Save key"}
        </button>
      </form>

      <h2 className="mb-2 text-sm font-medium text-slate-300">Configured providers</h2>
      <ul className="space-y-2">
        {creds.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded border border-panelborder bg-panel px-4 py-2 text-sm"
          >
            <span className="text-slate-200">
              {c.provider} <span className="text-slate-500">· {c.label}</span>
            </span>
            <button onClick={() => remove.mutate(c.id)} className="text-xs text-slate-500 hover:text-red-400">
              Remove
            </button>
          </li>
        ))}
        {creds.length === 0 && <p className="text-slate-500">No keys yet — the mock provider still works.</p>}
      </ul>

      <ConnectorsSection />
    </div>
  );
}

interface ConnectorDef {
  id: string;
  name: string;
  kind: string;
}

function ConnectorsSection() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [kind, setKind] = useState("builtin");
  const [op, setOp] = useState("echo");
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("POST");
  const [mcpToolName, setMcpToolName] = useState("");
  const [discovered, setDiscovered] = useState<string[]>([]);
  const [discoverErr, setDiscoverErr] = useState("");
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  const discover = useMutation({
    mutationFn: () =>
      api<{ tools?: { name: string }[]; error?: string }>("/api/connectors/discover", {
        method: "POST",
        body: JSON.stringify({ config: { transport: "http", url } }),
      }),
    onSuccess: (res) => {
      setDiscoverErr("");
      setDiscovered((res.tools ?? []).map((t) => t.name));
    },
    onError: (e: Error) => setDiscoverErr(e.message),
  });

  const test = useMutation({
    mutationFn: (id: string) =>
      api<{ output: string }>("/api/connectors/test", { method: "POST", body: JSON.stringify({ id }) }).then(
        (r) => ({ id, output: r.output }),
      ),
    onSuccess: ({ id, output }) => setTestResults((p) => ({ ...p, [id]: output })),
  });

  const { data: connectors = [] } = useQuery({
    queryKey: ["connectors"],
    queryFn: () => api<ConnectorDef[]>("/api/connectors"),
  });

  const save = useMutation({
    mutationFn: () => {
      const config =
        kind === "builtin"
          ? { op }
          : kind === "http"
            ? { url, method }
            : { transport: "http", url, toolName: mcpToolName };
      return api("/api/connectors", { method: "POST", body: JSON.stringify({ name, kind, config }) });
    },
    onSuccess: () => {
      setName("");
      setUrl("");
      setMcpToolName("");
      qc.invalidateQueries({ queryKey: ["connectors"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/connectors?id=${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connectors"] }),
  });

  return (
    <div className="mt-10">
      <h1 className="mb-1 text-2xl font-semibold text-slate-100">Connectors</h1>
      <p className="mb-6 text-sm text-slate-400">
        Define tools an Agent can call. Copy a connector&apos;s id into a Connector node&apos;s
        &quot;Connector definition id&quot; field. <code className="text-accent">builtin</code> connectors run
        locally (great for testing); <code className="text-accent">http</code> connectors call an external URL.
      </p>

      <form
        className="mb-6 space-y-3 rounded border border-panelborder bg-panel p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) save.mutate();
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Connector name"
          className="w-full rounded border border-panelborder bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="w-full rounded border border-panelborder bg-canvas px-3 py-2 text-sm"
        >
          <option value="builtin">builtin (local, no network)</option>
          <option value="http">http (external URL)</option>
          <option value="mcp">mcp (Model Context Protocol server)</option>
        </select>
        {kind === "mcp" ? (
          <div className="space-y-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="MCP server URL (Streamable HTTP)"
              className="w-full rounded border border-panelborder bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <div className="flex gap-2">
              <input
                value={mcpToolName}
                onChange={(e) => setMcpToolName(e.target.value)}
                placeholder="MCP tool name to call (e.g. search)"
                className="flex-1 rounded border border-panelborder bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => url.trim() && discover.mutate()}
                className="shrink-0 rounded border border-panelborder px-3 py-2 text-xs text-slate-300 hover:border-accent"
              >
                {discover.isPending ? "…" : "Discover tools"}
              </button>
            </div>
            {discoverErr && <p className="text-[11px] text-red-400">{discoverErr}</p>}
            {discovered.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {discovered.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMcpToolName(t)}
                    className="rounded border border-panelborder bg-canvas px-2 py-0.5 text-[11px] text-slate-300 hover:border-accent"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : kind === "builtin" ? (
          <select
            value={op}
            onChange={(e) => setOp(e.target.value)}
            className="w-full rounded border border-panelborder bg-canvas px-3 py-2 text-sm"
          >
            {["echo", "uppercase", "lowercase", "reverse", "length"].map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="rounded border border-panelborder bg-canvas px-3 py-2 text-sm"
            >
              {["POST", "GET"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className="flex-1 rounded border border-panelborder bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        )}
        <button type="submit" className="rounded bg-accent px-4 py-2 text-sm font-medium text-white">
          Add connector
        </button>
      </form>

      <ul className="space-y-2">
        {connectors.map((c) => (
          <li key={c.id} className="rounded border border-panelborder bg-panel px-4 py-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-200">
                {c.name} <span className="text-slate-500">· {c.kind}</span>
                <code className="ml-2 text-[11px] text-slate-500">{c.id}</code>
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => test.mutate(c.id)}
                  className="text-xs text-slate-400 hover:text-accent"
                >
                  {test.isPending && test.variables === c.id ? "Testing…" : "Test"}
                </button>
                <button onClick={() => remove.mutate(c.id)} className="text-xs text-slate-500 hover:text-red-400">
                  Remove
                </button>
              </div>
            </div>
            {testResults[c.id] !== undefined && (
              <pre className="mt-2 max-h-24 overflow-auto whitespace-pre-wrap rounded bg-canvas p-2 text-[11px] text-emerald-300">
                {testResults[c.id]}
              </pre>
            )}
          </li>
        ))}
        {connectors.length === 0 && <p className="text-slate-500">No connectors yet.</p>}
      </ul>
    </div>
  );
}
