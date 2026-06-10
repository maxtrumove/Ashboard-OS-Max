"use client";

// The Command Center board — mirrors the command-center mockup. Each category
// column shows only the items we've actually built (wired to a working
// surface); everything still on the roadmap is collected, grouped by category,
// in the Roadmap column on the right. An honest map of what works today.

import {
  COMMAND_CATEGORIES,
  builtItems,
  plannedSubs,
  type CmdAction,
  type CmdCategory,
  type CmdItem,
} from "@/lib/godmode/command";

export interface CommandCenterProps {
  onAction: (action: CmdAction) => void;
  onToast: (msg: string) => void;
}

export function CommandCenter({ onAction, onToast }: CommandCenterProps) {
  const plannedTotal = COMMAND_CATEGORIES.reduce(
    (n, c) => n + plannedSubs(c).reduce((m, s) => m + s.items.length, 0),
    0,
  );

  return (
    <>
      {COMMAND_CATEGORIES.map((cat) => (
        <CategoryColumn key={cat.id} cat={cat} onAction={onAction} />
      ))}
      <RoadmapColumn total={plannedTotal} onToast={onToast} />
    </>
  );
}

function CategoryColumn({ cat, onAction }: { cat: CmdCategory; onAction: (a: CmdAction) => void }) {
  const live = builtItems(cat);
  return (
    <section id={`cmd-${cat.id}`} className="glass flex h-full w-[300px] shrink-0 flex-col">
      <div className="flex items-center gap-2.5 border-b border-white/15 px-4 py-3.5">
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${cat.accent} text-sm text-white ring-1 ring-white/10`}
        >
          {cat.glyph}
        </span>
        <h2 className="flex-1 text-[13px] font-semibold uppercase tracking-wider text-white/90">{cat.title}</h2>
        {live.length > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {live.length} live
          </span>
        )}
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto px-3.5 py-4">
        {live.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 px-3 py-6 text-center">
            <p className="text-[11px] text-slate-400">Nothing wired up here yet.</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">See Roadmap →</p>
          </div>
        ) : (
          live.map((item) => (
            <LiveCard key={item.name} item={item} accent={cat.accent} onClick={() => item.action && onAction(item.action)} />
          ))
        )}
      </div>
    </section>
  );
}

function LiveCard({ item, accent, onClick }: { item: CmdItem; accent: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="glass-card glass-hover flex w-full items-center gap-3 p-3 text-left">
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${accent} text-sm text-white ring-1 ring-white/10`}
      >
        {item.glyph}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-medium text-white">
          {item.name}
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" title="Live" />
        </p>
        <p className="truncate text-[11px] text-slate-400">{item.subtitle}</p>
      </div>
      <span className="shrink-0 text-slate-500">›</span>
    </button>
  );
}

function RoadmapColumn({ total, onToast }: { total: number; onToast: (msg: string) => void }) {
  return (
    <section className="glass flex h-full w-[300px] shrink-0 flex-col border-dashed">
      <div className="flex items-center justify-between border-b border-white/15 px-4 py-3.5">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-white/90">Roadmap</h2>
        <span className="ob-badge">{total}</span>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-3.5 py-4">
        <p className="px-1 text-[11px] leading-relaxed text-slate-400">
          Not built yet — these are the mockup’s features still ahead. Tap one to flag it for the next sprint.
        </p>
        {COMMAND_CATEGORIES.map((cat) => {
          const subs = plannedSubs(cat);
          if (subs.length === 0) return null;
          return (
            <div key={cat.id} className="space-y-1.5">
              <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{cat.title}</p>
              {subs.map((sub) => (
                <div key={(sub.label ?? "main") + cat.id} className="space-y-1.5">
                  {sub.label && <p className="px-1 text-[9px] uppercase tracking-wider text-slate-600">{sub.label}</p>}
                  {sub.items.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => onToast(`“${item.name}” flagged for the roadmap`)}
                      className="flex w-full items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1.5 text-left transition hover:border-white/25 hover:bg-white/[0.05]"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-white/10 text-[11px] text-slate-400">
                        {item.glyph}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[12px] text-slate-300">{item.name}</span>
                      <span className="shrink-0 rounded-full border border-white/15 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-slate-500">
                        Planned
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
