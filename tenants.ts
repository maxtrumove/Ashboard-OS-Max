"use client";

import { useEffect, useState } from "react";
import { BIZ_CATEGORIES, BUSINESSES, PORTFOLIO, type BizCategory, type BizUnit } from "@/lib/godmode/businesses";
import { BoardCard as Card, BoardColumn, Glyph, GroupLabel, Sparkline, StatusDot } from "./ui";

export interface AutomatedBusinessesProps {
  onToast: (msg: string) => void;
}

/** Tiny bar chart for a unit's trend — feels alive without a chart lib. */
function MiniBars({ data, up }: { data: number[]; up: boolean }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex h-8 items-end gap-0.5">
      {data.map((d, i) => (
        <span
          key={i}
          className={`w-1 rounded-sm ${up ? "bg-emerald-400/70" : "bg-rose-400/70"}`}
          style={{ height: `${Math.max(8, (d / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US");
}

export function AutomatedBusinesses({ onToast }: AutomatedBusinessesProps) {
  // Live-ish: nudge "revenue today" upward after mount so it feels real.
  const [revToday, setRevToday] = useState(PORTFOLIO.revenueToday);
  useEffect(() => {
    const i = setInterval(() => setRevToday((v) => v + Math.floor(Math.random() * 14) + 1), 2200);
    return () => clearInterval(i);
  }, []);

  return (
    <>
      <PortfolioColumn revToday={revToday} onToast={onToast} />
      {BIZ_CATEGORIES.map((c) => (
        <CategoryColumn key={c.id} category={c.id} label={c.label} onToast={onToast} />
      ))}
    </>
  );
}

function PortfolioColumn({ revToday, onToast }: { revToday: number; onToast: (m: string) => void }) {
  const tiles = [
    { label: "Revenue today", value: fmt(revToday), live: true },
    { label: "Total MRR", value: fmt(PORTFOLIO.mrr) },
    { label: "Net today", value: "+" + fmt(PORTFOLIO.netToday) },
    { label: "Active units", value: String(PORTFOLIO.activeUnits) },
  ];
  return (
    <BoardColumn title="Portfolio" footer="Export P&L" onFooter={() => onToast("Exporting portfolio P&L…")}>
      <div className="grid grid-cols-2 gap-2.5">
        {tiles.map((t) => (
          <div key={t.label} className="glass-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{t.label}</p>
            <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-white tabular-nums">
              {t.value}
              {t.live && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
            </p>
          </div>
        ))}
      </div>

      <GroupLabel>30-day revenue</GroupLabel>
      <div className="glass-card p-3.5">
        <Sparkline data={[12, 14, 13, 16, 15, 18, 17, 20, 19, 22, 21, 24]} width={250} height={56} />
        <p className="mt-2 text-[11px] text-slate-400">All units · trending up 18% MoM</p>
      </div>

      <GroupLabel>Alerts</GroupLabel>
      <Card onClick={() => onToast("Opening: ArbHunter paused")}>
        <div className="flex items-start gap-2.5">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white">ArbHunter paused</p>
            <p className="mt-0.5 text-[11px] text-slate-400">Trading Bots · drawdown limit hit</p>
          </div>
        </div>
      </Card>
      <Card onClick={() => onToast("Opening: HireLoop churn up")}>
        <div className="flex items-start gap-2.5">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white">HireLoop churn rising</p>
            <p className="mt-0.5 text-[11px] text-slate-400">AI Assistants · 3.8% this month</p>
          </div>
        </div>
      </Card>
    </BoardColumn>
  );
}

function CategoryColumn({ category, label, onToast }: { category: BizCategory; label: string; onToast: (m: string) => void }) {
  const units = BUSINESSES.filter((u) => u.category === category);
  return (
    <BoardColumn title={label} count={units.length} footer="+ New unit" onFooter={() => onToast(`New ${label} unit — coming soon`)}>
      {units.map((u) => (
        <UnitCard key={u.id} unit={u} onToast={onToast} />
      ))}
    </BoardColumn>
  );
}

function UnitCard({ unit, onToast }: { unit: BizUnit; onToast: (m: string) => void }) {
  const up = unit.trend[unit.trend.length - 1] >= unit.trend[0];
  const negative = unit.metric.value.startsWith("-");
  return (
    <Card onClick={() => onToast(`Opening ${unit.name} dashboard`)}>
      <div className="flex items-center gap-3">
        <Glyph glyph={unit.glyph} accent={unit.accent} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{unit.name}</p>
          <p className="truncate text-[11px] text-slate-400">{unit.note}</p>
        </div>
        <StatusDot status={unit.status} />
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">{unit.metric.label}</p>
          <p className={`text-lg font-semibold tabular-nums ${negative ? "text-rose-300" : "text-white"}`}>{unit.metric.value}</p>
        </div>
        <MiniBars data={unit.trend} up={up && !negative} />
      </div>

      <div className="mt-2 flex gap-2 border-t border-white/10 pt-2">
        {unit.sub.map((s) => (
          <div key={s.label} className="flex-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{s.label}</p>
            <p className="text-xs font-medium text-slate-200">{s.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
