@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

html,
body {
  height: 100%;
}

body {
  @apply bg-canvas text-slate-200;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

/* Make the React Flow canvas blend with the dark theme. */
.react-flow__edge-path {
  stroke: #4b5366;
  stroke-width: 1.5;
}
.react-flow__handle {
  width: 9px;
  height: 9px;
  border: 1px solid #0f1117;
}
.react-flow__attribution {
  display: none;
}

/* ============================================================
   God Mode — "Obsidian Command Center" theme (scoped .godmode)

   Floating translucent smoked-acrylic panels suspended in a real
   telescope starfield. Apple Vision Pro material system.
   NO gradients, NO glow, NO bloom, NO color overlays.
   Separation comes from the BORDER, not from glow.
   ============================================================ */

.godmode {
  position: relative;
  isolation: isolate;
  color: rgba(255, 255, 255, 0.95);
  background: #000000;
}

/* Photorealistic deep-space starfield — pure black, dense small
   stars, occasional larger ones, natural colors only (white,
   pale blue, pale yellow). No nebula, no fog, no glow. */
.godmode::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-color: #000000;
  background-image:
    /* occasional larger stars */
    radial-gradient(1.8px 1.8px at 120px 80px, rgba(255, 255, 255, 0.95), transparent 60%),
    radial-gradient(1.7px 1.7px at 480px 360px, rgba(214, 230, 255, 0.90), transparent 60%),
    radial-gradient(1.6px 1.6px at 760px 180px, rgba(255, 248, 224, 0.88), transparent 60%),
    radial-gradient(1.7px 1.7px at 300px 620px, rgba(255, 255, 255, 0.85), transparent 60%),
    /* medium pale stars */
    radial-gradient(1.2px 1.2px at 220px 160px, rgba(255, 255, 255, 0.70), transparent 65%),
    radial-gradient(1.2px 1.2px at 60px 300px, rgba(206, 224, 255, 0.65), transparent 65%),
    radial-gradient(1.1px 1.1px at 520px 90px, rgba(255, 250, 230, 0.62), transparent 65%),
    radial-gradient(1.2px 1.2px at 660px 480px, rgba(255, 255, 255, 0.66), transparent 65%),
    radial-gradient(1.1px 1.1px at 400px 540px, rgba(255, 255, 255, 0.60), transparent 65%),
    /* dense fine stars */
    radial-gradient(0.8px 0.8px at 36px 48px, rgba(255, 255, 255, 0.55), transparent 70%),
    radial-gradient(0.8px 0.8px at 150px 220px, rgba(255, 255, 255, 0.45), transparent 70%),
    radial-gradient(0.7px 0.7px at 260px 70px, rgba(220, 232, 255, 0.45), transparent 70%),
    radial-gradient(0.8px 0.8px at 330px 300px, rgba(255, 255, 255, 0.42), transparent 70%),
    radial-gradient(0.7px 0.7px at 90px 140px, rgba(255, 252, 240, 0.42), transparent 70%),
    radial-gradient(0.8px 0.8px at 200px 380px, rgba(255, 255, 255, 0.40), transparent 70%),
    radial-gradient(0.7px 0.7px at 440px 240px, rgba(255, 255, 255, 0.38), transparent 70%);
  background-repeat: repeat;
  background-size:
    900px 760px, 900px 760px, 900px 760px, 900px 760px,
    520px 600px, 520px 600px, 520px 600px, 520px 600px, 520px 600px,
    300px 420px, 300px 420px, 300px 420px, 300px 420px, 300px 420px, 300px 420px, 300px 420px;
}

/* OUTER COLUMN PANELS — contain related modules. Flat translucent
   smoked acrylic; stars remain visible through the panel. */
.glass {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 20px;
  box-shadow: none;
  background-image: none;
  backdrop-filter: blur(55px);
  -webkit-backdrop-filter: blur(55px);
}

/* INNER MODULE CARDS — actual content containers; slightly more
   solid than their parent panel. */
.glass-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  box-shadow: none;
  background-image: none;
  backdrop-filter: blur(45px);
  -webkit-backdrop-filter: blur(45px);
}

/* CHAT / rails / headers / modals — the densest acrylic surface. */
.glass-strong {
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 18px;
  box-shadow: none;
  background-image: none;
  backdrop-filter: blur(65px);
  -webkit-backdrop-filter: blur(65px);
}

/* Interaction — architectural, not playful. Border carries the
   change; no glow. */
.glass-hover {
  transition: transform 0.28s ease-in-out, border-color 0.28s ease-in-out,
    background-color 0.28s ease-in-out;
}
.glass-hover:hover {
  border-color: rgba(255, 255, 255, 0.4);
  background-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

/* Translucent inset field. */
.glass-field {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.30);
}
.glass-field:focus,
.glass-field:focus-within {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: none;
  outline: none;
}

/* Count badge next to column titles — neutral, minimal. */
.ob-badge {
  display: inline-grid;
  place-items: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.4rem;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.40);
}

/* Thin, neutral scrollbars inside the workspace. */
.godmode *::-webkit-scrollbar { width: 9px; height: 9px; }
.godmode *::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}
.godmode *::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.30); background-clip: padding-box; }
.godmode *::-webkit-scrollbar-track { background: transparent; }

/* Slow rotation for the Obsidian Core rings. */
@keyframes gm-spin { to { transform: rotate(360deg); } }

/* Typing indicator — a calm fade in/out, not a blinking terminal caret. */
@keyframes godmode-typing {
  0%, 100% { opacity: 0.25; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-1px); }
}

/* ============================================================================
   HOME BOARD — "Quant Graphite" executive restyle (scoped: execa-*).
   A PE / quant trading terminal: cool graphite slabs, a single ice-blue accent,
   faint gridlines between rows, tabular figures, and snappy precise motion.
   These classes are used ONLY by components/godmode/ObsidianDashboard.tsx so
   nothing here touches the other boards.
   ========================================================================== */

:root {
  --execa-accent: 125, 170, 215; /* ice / steel blue */
}

/* Panel — a cool graphite instrument slab. Crisp hairline edge, sharper corners,
   a tight floor shadow that snaps deeper on hover so the board feels precise. */
.execa-panel {
  position: relative;
  background:
    linear-gradient(180deg, rgba(150, 180, 210, 0.05) 0%, rgba(150, 180, 210, 0.012) 46%, rgba(0, 0, 0, 0.06) 100%),
    #101319;
  border: 1px solid rgba(160, 185, 215, 0.08);
  border-radius: 10px;
  box-shadow:
    inset 0 1px 0 rgba(180, 205, 235, 0.05),
    0 10px 30px -16px rgba(0, 0, 0, 0.7);
  transition:
    transform 0.3s cubic-bezier(0.22, 0.7, 0.25, 1),
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}
.execa-panel:hover {
  transform: translateY(-3px);
  border-color: rgba(var(--execa-accent), 0.32);
  box-shadow:
    inset 0 1px 0 rgba(180, 205, 235, 0.08),
    0 22px 50px -20px rgba(0, 0, 0, 0.82);
}
/* The single instrument detail: an ice-blue hairline along the top edge. */
.execa-panel::before {
  content: "";
  position: absolute;
  inset: 0 14% auto 14%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(var(--execa-accent), 0.9), transparent);
  opacity: 0.5;
  transition: opacity 0.3s ease;
}
.execa-panel:hover::before { opacity: 1; }

/* Header glyph tile and count badge. */
.execa-glyph {
  border: 1px solid rgba(160, 185, 215, 0.1);
  background: linear-gradient(180deg, rgba(160, 190, 220, 0.06), rgba(160, 190, 220, 0.015));
  border-radius: 7px;
  transition: border-color 0.3s ease;
}
.execa-panel:hover .execa-glyph { border-color: rgba(var(--execa-accent), 0.45); }
.execa-badge {
  border: 1px solid rgba(var(--execa-accent), 0.35);
  background: rgba(var(--execa-accent), 0.1);
  color: rgba(var(--execa-accent), 1);
}

/* Recessed inner module. */
.execa-card {
  background: rgba(150, 180, 210, 0.02);
  border: 1px solid rgba(160, 185, 215, 0.07);
  border-radius: 8px;
}

/* Data rows — a quant-terminal ledger: faint gridline divider under each row,
   tight inset highlight + ice-blue tick on hover. */
.execa-row {
  border-radius: 6px;
  margin: 0 -7px;
  padding: 4px 7px;
  border-bottom: 1px solid rgba(160, 185, 215, 0.05);
  transition: background-color 0.16s ease, box-shadow 0.16s ease;
}
.execa-row:hover {
  background: rgba(150, 180, 210, 0.05);
  box-shadow: inset 2px 0 0 rgba(var(--execa-accent), 0.85);
}

/* Footer / action chip — precise; border brightens and fills fast on hover. */
.execa-action {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(160, 185, 215, 0.11);
  border-radius: 8px;
  transition: border-color 0.2s ease, color 0.2s ease;
}
.execa-action::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(var(--execa-accent), 0.12);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.22s cubic-bezier(0.22, 0.7, 0.25, 1);
}
.execa-action:hover { border-color: rgba(var(--execa-accent), 0.5); }
.execa-action:hover::after { transform: scaleX(1); }
.execa-action > * { position: relative; z-index: 1; }

/* Tabular figures so columns of numbers line up like a terminal ledger. */
.execa-num {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
  letter-spacing: -0.01em;
}

/* Snappy staggered entrance — panels register into place quickly and precisely. */
.execa-rise {
  opacity: 0;
  animation: execa-rise 0.5s cubic-bezier(0.22, 0.7, 0.25, 1) both;
}
@keyframes execa-rise {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Respect reduced-motion: no entrance, no lift. */
@media (prefers-reduced-motion: reduce) {
  .execa-rise { animation: none; opacity: 1; }
  .execa-panel { transition: border-color 0.3s ease; }
  .execa-panel:hover { transform: none; }
}


/* ============================================================================
   ASHBOARD OS MAX — Gemini "build" hero (scoped: gem-*).
   Modeled on the Gemini build-your-ideas screen: centered headline with the
   outlined four-point spark, a dark composer wrapped in a continuously
   looping Google-color gradient border, pill chips below. Used ONLY by
   components/godmode/DailyBriefing.tsx.
   ========================================================================== */

:root {
  --g-blue: #4285f4;
  --g-green: #34a853;
  --g-yellow: #fbbc05;
  --g-red: #ea4335;
}

/* Hero headline — Google Sans look: light weight, generous size, no tracking. */
.gem-hero-title {
  font-size: 38px;
  font-weight: 400;
  letter-spacing: -0.005em;
  color: #e8eaed;
}
/* The spinning planet beside the headline. The continent strip drifts left
   and wraps (rotation illusion); the gradient orbit line travels endlessly
   around the sphere. */
.gem-hero-globe {
  width: 72px;
  height: 72px;
  margin-left: 18px;
  margin-top: -20px;
  flex-shrink: 0;
}
.gem-globe-strip {
  animation: gem-globe-drift 16s linear infinite;
}
@keyframes gem-globe-drift {
  from { transform: translateX(0); }
  to { transform: translateX(-140px); }
}
.gem-globe-orbit {
  stroke-dasharray: 75 245;
  animation: gem-orbit-travel 4.5s linear infinite;
}
@keyframes gem-orbit-travel {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: -320; }
}

/* Composer shell — the looping gradient border. A padded gradient layer with
   the inner surface inset, colors flowing left→right on an endless loop. */
.gem-shell {
  position: relative;
  border-radius: 18px;
  padding: 1.5px;
  background: linear-gradient(
    100deg,
    var(--g-blue),
    var(--g-green) 22%,
    var(--g-yellow) 48%,
    var(--g-red) 72%,
    var(--g-blue) 100%
  );
  background-size: 300% 100%;
  animation: gem-border-flow 7s linear infinite;
}
@keyframes gem-border-flow {
  from { background-position: 0% 50%; }
  to { background-position: -300% 50%; }
}
.gem-shell-inner {
  border-radius: 16.5px;
  background: #131316;
}

/* Round icon buttons inside the composer (mic, add). */
.gem-iconbtn {
  display: grid;
  height: 36px;
  width: 36px;
  place-items: center;
  border-radius: 50%;
  font-size: 16px;
  color: #c4c7c5;
  transition: background-color 0.18s ease, color 0.18s ease;
}
.gem-iconbtn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

/* "I'm feeling lucky" — quiet pill, spark in Gemini blue. */
.gem-lucky {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border-radius: 999px;
  background: #2d2f33;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #e8eaed;
  transition: background-color 0.18s ease;
}
.gem-lucky:hover:not(:disabled) { background: #3a3d42; }
.gem-lucky-spark { color: var(--g-blue); font-size: 12px; }

/* Shortcut chips — rounded pills with per-product colored glyphs. */
.gem-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  background: #1e1f20;
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 9px 16px;
  font-size: 13px;
  color: #e3e3e3;
  transition: background-color 0.18s ease;
}
.gem-chip:hover { background: #2a2b2d; }

/* Conversation view. */
.gem-msg-user {
  max-width: 80%;
  border-radius: 18px 18px 4px 18px;
  background: #2d2f33;
  padding: 10px 15px;
  font-size: 14.5px;
  line-height: 1.55;
  color: #e8eaed;
  white-space: pre-wrap;
}
.gem-msg-spark {
  margin-top: 2px;
  flex-shrink: 0;
  background-image: linear-gradient(135deg, var(--g-blue), #9b72cb 60%, var(--g-red));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 15px;
}
.gem-msg-ai {
  min-width: 0;
  flex: 1;
  font-size: 14.5px;
  line-height: 1.65;
  color: #e8eaed;
}
/* Rendered-markdown elements inside an AI reply. */
.gem-msg-ai p { margin: 0 0 8px; }
.gem-msg-ai p:last-child { margin-bottom: 0; }
.gem-msg-ai ul,
.gem-msg-ai ol {
  margin: 0 0 8px;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.gem-msg-ai ul { list-style: disc; }
.gem-msg-ai ol { list-style: decimal; }
.gem-msg-ai strong { font-weight: 600; color: #fff; }
.gem-msg-ai code {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 5px;
  padding: 1.5px 5px;
  font-size: 13px;
}
.gem-typing {
  letter-spacing: 2px;
  color: var(--g-blue);
  animation: gem-pulse 1.2s ease-in-out infinite;
}
@keyframes gem-pulse {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .gem-shell { animation: none; }
  .gem-globe-strip { animation: none; }
  .gem-globe-orbit { animation: none; }
}
