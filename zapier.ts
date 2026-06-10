"use client";

import { useState } from "react";
import {
  ADVISORS,
  BUILD_QUEUE,
  KNOWLEDGE,
  MODELS,
  ORG_TEMPLATES,
  PROMPT_TARGETS,
  TEAMS,
  type PromptTarget,
} from "@/lib/godmode/buildspace";
import { BoardCard as Card, BoardColumn, CountBadge, Glyph, GroupLabel, Pill, StatusDot } from "./ui";

export interface BuildSpaceProps {
  onToast: (msg: string) => void;
}

export function BuildSpace({ onToast }: BuildSpaceProps) {
  return (
    <>
      <ModelsColumn onToast={onToast} />
      <KnowledgeColumn onToast={onToast} />
      <PromptBuilderColumn onToast={onToast} />
      <TeamsColumn onToast={onToast} />
      <AdvisorsColumn onToast={onToast} />
      <QueueColumn onToast={onToast} />
    </>
  );
}

/* ---- 1. Models / LLMs ----------------------------------------------------- */

function ModelsColumn({ onToast }: BuildSpaceProps) {
  return (
    <BoardColumn title="Models" count={MODELS.length} footer="+ Connect Model" onFooter={() => onToast("Connect a model — coming soon")}>
      {MODELS.map((m) => (
        <Card key={m.id} onClick={() => onToast(`Set primary model → ${m.name}`)}>
          <div className="flex items-center gap-3">
            <Glyph glyph={m.glyph} accent={m.accent} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-white">{m.name}</p>
                {m.primary && <Pill>Primary</Pill>}
              </div>
              <p className="truncate text-[11px] text-slate-400">{m.vendor} · {m.context} ctx</p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <StatusDot status={m.status} />
            <span className="text-[11px] text-slate-500">{m.note}</span>
          </div>
        </Card>
      ))}
    </BoardColumn>
  );
}

/* ---- 2. Knowledge / Docs -------------------------------------------------- */

function KnowledgeColumn({ onToast }: BuildSpaceProps) {
  return (
    <BoardColumn title="Knowledge" count={KNOWLEDGE.length} footer="+ New Folder" onFooter={() => onToast("New knowledge folder — coming soon")}>
      <GroupLabel>Folders</GroupLabel>
      {KNOWLEDGE.map((f) => (
        <Card key={f.id} onClick={() => onToast(`Opening ${f.name} · ${f.count} ${f.meta}`)}>
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/30 bg-white/[0.06] text-base">
              {f.glyph}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{f.name}</p>
              <p className="truncate text-[11px] text-slate-400">{f.kind} · {f.count} {f.meta}</p>
            </div>
            <span className="text-slate-500">›</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {f.items.slice(0, 3).map((it) => (
              <span key={it} className="rounded border border-white/15 px-1.5 py-0.5 text-[10px] text-slate-400">{it}</span>
            ))}
          </div>
        </Card>
      ))}
    </BoardColumn>
  );
}

/* ---- 3. Prompt Builder (interactive) -------------------------------------- */

function PromptBuilderColumn({ onToast }: BuildSpaceProps) {
  const [text, setText] = useState("");
  const [model, setModel] = useState(MODELS[0].id);

  const send = (target: PromptTarget) => {
    if (!text.trim()) return onToast("Write a prompt first");
    const m = MODELS.find((x) => x.id === model)?.name ?? "model";
    onToast(`${target} · ${m}`);
    if (target === "Save to CLAUDE.md" || target === "Save to Library") setText("");
  };

  return (
    <BoardColumn title="Prompt Builder">
      <GroupLabel>Compose the perfect prompt</GroupLabel>
      <div className="glass-card p-3.5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="System + task… reference skills with @, knowledge with #"
          className="h-36 w-full resize-none bg-transparent text-sm leading-relaxed text-white outline-none placeholder:text-slate-500"
        />
        <div className="mt-2 flex flex-wrap gap-1 border-t border-white/15 pt-2">
          {MODELS.filter((m) => m.status !== "offline").map((m) => (
            <button
              key={m.id}
              onClick={() => setModel(m.id)}
              className={`rounded-full border px-2 py-0.5 text-[10px] transition ${
                model === m.id ? "border-white/70 bg-white/[0.14] text-white" : "border-white/20 text-slate-400 hover:text-white"
              }`}
            >
              {m.name.replace(/^Claude /, "")}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {PROMPT_TARGETS.map((t) => (
          <button
            key={t}
            onClick={() => send(t)}
            className="w-full rounded-xl border border-white/30 bg-white/[0.06] py-2 text-xs font-medium text-white/85 transition hover:border-white/60 hover:bg-white/[0.12] hover:text-white"
          >
            {t}
          </button>
        ))}
      </div>
      <GroupLabel>Recent</GroupLabel>
      <Card onClick={() => setText("You are an SEO strategist. Given a keyword, produce a search-optimized content brief…")}>
        <p className="text-sm font-medium text-white">SEO Content Brief</p>
        <p className="mt-0.5 truncate text-[11px] text-slate-400">Saved to Library · 2h ago</p>
      </Card>
    </BoardColumn>
  );
}

/* ---- 4. Agent Teams + Org-Clone ------------------------------------------- */

function TeamsColumn({ onToast }: BuildSpaceProps) {
  const [company, setCompany] = useState(ORG_TEMPLATES[0].id);
  const tpl = ORG_TEMPLATES.find((t) => t.id === company)!;

  return (
    <BoardColumn title="Agent Teams" count={TEAMS.length} footer="+ New Team" onFooter={() => onToast("New agent team — coming soon")}>
      <GroupLabel>Deployments</GroupLabel>
      {TEAMS.map((t) => (
        <Card key={t.id} onClick={() => onToast(`Deploying ${t.lead} + ${t.subagents.length} sub-agents → ${t.deployment}`)}>
          <div className="flex items-center gap-3">
            <Glyph glyph={t.glyph} accent={t.accent} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{t.name}</p>
              <p className="truncate text-[11px] text-slate-400">{t.lead} · {t.deployment}</p>
            </div>
            <StatusDot status={t.status} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {t.subagents.map((s) => (
              <span key={s} className="rounded border border-white/15 px-1.5 py-0.5 text-[10px] text-slate-400">{s}</span>
            ))}
          </div>
        </Card>
      ))}

      <GroupLabel>Org-Clone — copy a real dev-team structure</GroupLabel>
      <div className="glass-card p-3.5">
        <div className="flex flex-wrap gap-1.5">
          {ORG_TEMPLATES.map((o) => (
            <button
              key={o.id}
              onClick={() => setCompany(o.id)}
              className={`grid h-8 w-8 place-items-center rounded-lg border text-sm font-semibold transition ${
                company === o.id ? "border-white/70 bg-white/[0.14] text-white" : "border-white/20 text-slate-400 hover:text-white"
              }`}
            >
              {o.glyph}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{tpl.structure}</p>
        <button
          onClick={() => onToast(`Cloned ${tpl.company}'s structure → ${tpl.roles} agents (leads + sub-agents) provisioned`)}
          className="mt-2 w-full rounded-xl border border-white/30 bg-white/[0.06] py-2 text-xs font-medium text-white/85 transition hover:border-white/60 hover:bg-white/[0.12] hover:text-white"
        >
          Clone {tpl.company} → {tpl.roles} agents
        </button>
      </div>
    </BoardColumn>
  );
}

/* ---- 5. C-suite Advisors -------------------------------------------------- */

function AdvisorsColumn({ onToast }: BuildSpaceProps) {
  const [devil, setDevil] = useState(false);

  return (
    <BoardColumn title="Advisors" count={ADVISORS.length}>
      <GroupLabel>Ask the C-suite</GroupLabel>
      {ADVISORS.filter((a) => a.id !== "devil").map((a) => (
        <Card key={a.id} onClick={() => onToast(`Asking ${a.role}${devil ? " (devil's advocate on)" : ""}…`)}>
          <div className="flex items-center gap-3">
            <Glyph glyph={a.glyph} accent={a.accent} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{a.role}</p>
              <p className="truncate text-[11px] text-slate-400">{a.persona}</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{a.focus}</p>
        </Card>
      ))}

      <GroupLabel>Mode</GroupLabel>
      <button
        onClick={() => {
          setDevil((d) => !d);
          onToast(devil ? "Devil's Advocate off" : "Devil's Advocate on — answers will be pressure-tested");
        }}
        className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition ${
          devil ? "border-red-400/70 bg-red-500/[0.12]" : "border-white/30 bg-white/[0.06] hover:border-white/60"
        }`}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/30 text-base text-rose-300">▼</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">Devil's Advocate</p>
          <p className="text-[11px] text-slate-400">Pokes holes in every idea</p>
        </div>
        <span className={`text-[11px] font-medium ${devil ? "text-rose-300" : "text-slate-500"}`}>{devil ? "ON" : "OFF"}</span>
      </button>
    </BoardColumn>
  );
}

/* ---- 6. Build Queue ------------------------------------------------------- */

function QueueColumn({ onToast }: BuildSpaceProps) {
  const dot = (type: string) =>
    type === "needs-reply" ? "bg-amber-400" : type === "build-ready" ? "bg-emerald-400" : "bg-sky-400";
  const label = (type: string) =>
    type === "needs-reply" ? "Needs reply" : type === "build-ready" ? "Build ready" : "Running";

  return (
    <BoardColumn title="Build Queue" count={BUILD_QUEUE.length} footer="View all activity" onFooter={() => onToast("Activity feed — coming soon")}>
      {BUILD_QUEUE.map((t) => (
        <Card key={t.id} onClick={() => onToast(`Opening: ${t.title}`)}>
          <div className="flex items-start gap-2.5">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot(t.type)}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug text-white">{t.title}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{t.meta}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] text-slate-300">{label(t.type)}</span>
          </div>
        </Card>
      ))}
    </BoardColumn>
  );
}
