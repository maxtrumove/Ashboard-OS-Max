"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { type Command, resolveCommands } from "@/lib/godmode/commands";
import { Glyph } from "./ui";

export function CommandBar({
  onRun,
  focusSignal,
  onAskModeChange,
}: {
  onRun: (command: Command) => void;
  focusSignal?: number;
  onAskModeChange?: (active: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  // Agent ("Ask God Mode") state.
  const [lastQ, setLastQ] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Command suggestions are opt-in: they only appear when the line starts with
  // "/", so plain typing reads as a question, not a launcher.
  const slashMode = query.startsWith("/");
  const commands = useMemo(
    () => (slashMode ? resolveCommands(query.slice(1)) : []),
    [query, slashMode],
  );
  const showCommands = commands.length > 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (focusSignal) {
      setOpen(true);
      inputRef.current?.focus();
    }
  }, [focusSignal]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  useEffect(() => setActive(0), [query]);

  // Tell the layout when there's an active chat — a question has been asked and
  // the answer window is open (streaming or showing). Merely focusing the bar
  // does NOT collapse the board; only a live conversation does.
  useEffect(() => {
    onAskModeChange?.(answer !== null || asking);
  }, [answer, asking, onAskModeChange]);

  function run(cmd: Command | undefined) {
    if (!cmd) return;
    onRun(cmd);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  /** Ask God Mode — stream a real agent reply from /api/godmode/agent. */
  async function ask(text: string) {
    const q = text.trim();
    if (!q || asking) return;
    setOpen(false);
    setLastQ(q);
    setAnswer("");
    setAsking(true);
    setProvider(null);
    setQuery("");
    try {
      const res = await fetch("/api/godmode/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: q }] }),
      });
      setProvider(res.headers.get("X-Godmode-Provider"));
      if (!res.body) throw new Error("No response stream");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setAnswer(acc);
      }
    } catch (err) {
      setAnswer(`[error] ${(err as Error).message}`);
    } finally {
      setAsking(false);
    }
  }

  function clearAnswer() {
    setAnswer(null);
    setAsking(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    // In slash mode the arrows + Enter drive the command list; otherwise the
    // bar is a plain question box and Enter asks Obsidian.
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      ask(query);
    } else if (showCommands && e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, commands.length - 1));
    } else if (showCommands && e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showCommands) run(commands[active]);
      else ask(query);
    } else if (e.key === "Escape") {
      if (answer !== null) clearAnswer();
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  const showAnswer = answer !== null || asking;
  const providerLabel = provider === "mock" ? "demo (add a key for real Claude)" : provider ?? "";

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-3xl">
      {showAnswer ? (
        <div className="glass-strong absolute bottom-full left-0 mb-2 max-h-[46vh] w-full overflow-y-auto rounded-2xl p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs text-slate-400">
              <span className="grid h-5 w-5 place-items-center rounded border border-white/40 bg-white/10 text-[10px] text-white">◈</span>
              AshboardOS 2.0 {providerLabel && <span className="text-slate-500">· {providerLabel}</span>}
            </span>
            <button onClick={clearAnswer} className="text-xs text-slate-500 hover:text-white">clear ✕</button>
          </div>
          <p className="mb-2 text-sm font-medium text-slate-300">{lastQ}</p>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
            {answer}
            {asking &&
              (answer ? (
                // Soft pulse on the trailing text while more streams in — no
                // hard terminal caret.
                <span className="ml-1 inline-flex gap-1 align-middle">
                  <Dot /> <Dot delay={0.15} /> <Dot delay={0.3} />
                </span>
              ) : (
                // Thinking state before the first token arrives.
                <span className="inline-flex gap-1.5 align-middle">
                  <Dot /> <Dot delay={0.15} /> <Dot delay={0.3} />
                </span>
              ))}
          </div>
        </div>
      ) : (
        showCommands && (
          <div className="glass-strong absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-2xl">
            {commands.map((c, i) => (
              <button
                key={c.id}
                onMouseEnter={() => setActive(i)}
                onClick={() => run(c)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                  i === active ? "bg-white/[0.12]" : "hover:bg-white/5"
                }`}
              >
                <Glyph glyph={c.glyph} accent={c.accent} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{c.title}</p>
                  <p className="truncate text-xs text-slate-400">{c.subtitle}</p>
                </div>
                {i === active && <span className="text-xs text-slate-400">launch ↵</span>}
              </button>
            ))}
            <div className="border-t border-white/[0.06] px-4 py-2 text-[11px] text-slate-500">
              ↵ launch · <span className="text-slate-400">⌘↵ ask AshboardOS</span>
            </div>
          </div>
        )
      )}

      <div
        className={`glass-strong flex items-center gap-3 px-4 py-3.5 transition ${
          open ? "border-white/80" : ""
        }`}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/40 bg-white/10 text-sm text-white">
          ◈
        </span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Ask AshboardOS Anything…  (type / for commands)"
          className="flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-slate-500"
        />
        <button
          onClick={() => ask(query)}
          disabled={asking}
          className="grid h-8 w-8 place-items-center rounded-full border border-white/50 bg-white/15 text-white transition hover:bg-white/25 disabled:opacity-50"
          aria-label="Ask AshboardOS"
          title="Ask AshboardOS (⌘↵)"
        >
          {asking ? "…" : "➤"}
        </button>
      </div>
    </div>
  );
}

// One dot of the typing indicator — a calm fading pulse, staggered by `delay`.
function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300/80"
      style={{ animation: "godmode-typing 1.1s ease-in-out infinite", animationDelay: `${delay}s` }}
    />
  );
}
