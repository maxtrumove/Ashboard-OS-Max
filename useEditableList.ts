"use client";

import type { Tenant } from "@/lib/godmode/tenants";

// What a brand-new company looks like: no boards, no businesses, no data —
// just the shell and a few starter actions. Replaces the rail + board
// carousel whenever the active tenant is blank.
export function BlankSlate({
  tenant,
  onToast,
  onOpenConnections,
}: {
  tenant: Tenant;
  onToast: (msg: string) => void;
  onOpenConnections: () => void;
}) {
  const starters = [
    {
      glyph: "▦",
      title: "Create your first board",
      desc: "Lay out a Home board with the panels this company needs.",
      onClick: () => onToast("Board builder coming soon"),
    },
    {
      glyph: "⚡",
      title: "Connect your stack",
      desc: "Wire up email, data, and tool integrations for this workspace.",
      onClick: onOpenConnections,
    },
    {
      glyph: "🏢",
      title: "Add a business",
      desc: "Bring an operating business under this company's umbrella.",
      onClick: () => onToast("Business onboarding coming soon"),
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-8">
      <div className="w-full max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
          Blank slate
        </span>
        <h2 className="mt-4 text-2xl font-semibold tracking-[0.15em] text-white">{tenant.name}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
          This company has nothing configured yet — no boards, businesses, or connections. Pick a
          starting point below, or switch back to another company from the dropdown up top.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {starters.map((s) => (
            <button
              key={s.title}
              onClick={s.onClick}
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-left transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.05]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/[0.05] text-lg text-white transition group-hover:border-white/40">
                {s.glyph}
              </span>
              <p className="mt-3 text-sm font-medium text-white">{s.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
