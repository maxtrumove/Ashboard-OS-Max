# agent-puppets

A web-based visual studio for orchestrating LLM agents on a canvas. Prompt an idea, compose
building-block nodes (Prompt, Skill, Connector, App, Plan, Build, Agent), wire them together, and
fan the idea out to multiple LLM agents (Claude / GPT / Gemini) — all by editing fields, never by
typing commands. A live preview shows the exact prompt that will be sent and streams the agent's
output as you build.

Work is organized as **Projects → Apps/Systems → Graphs**.

## God Mode (`/god-mode`)

God Mode is a desktop-first, horizontal **command center** that sits above your whole ecosystem —
think Raycast × Arc × Mission Control. It doesn't replace any tool; it organizes and launches them.

- **AI Workspace** — launch/preview ChatGPT, Codex, Claude, Claude Code, Gemini, Gemini Enterprise,
  Vertex, Agent Builder, Lovable, Cursor, Replit, HyperFX, n8n. Each card carries a logo, live
  status, recent activity, and Launch/Preview buttons (browser / app / embed per configuration).
- **Projects** — launcher cards (TruMove, MASSA, …) with screenshot, description, quick links, and
  associated AI tools. Projects are launchers and previews, not the whole app.
- **Marketing** — placeholder section (SEO / PPC / Content / Email / Analytics) for future versions.
- **Content Studio** — immediately usable image / video / asset generation and a prompt library.
- **Skills** — searchable skills, markdown, SOPs, prompt packs, and templates with tags + preview.
- **File Library** — images, videos, wireframes, documents with search, filters, and recents.
- **Universal Command Bar** — the headline feature. A persistent input (focus with **⌘K / Ctrl-K**)
  that parses natural language — “Open Claude”, “Launch Lovable”, “Find SEO Prompt”,
  “Generate Image”, “Create New Project” — into ranked, executable commands.

The catalog is plain data in `lib/godmode/catalog.ts`; the command parser
(`lib/godmode/commands.ts`) is pure and unit-tested (`npm test`).

## Quick start

```bash
npm install
cp .env.example .env          # then set CREDENTIAL_SECRET to a long random string
npm run db:push               # create the local SQLite database
npm run dev                   # http://localhost:3000
```

Add provider API keys under **Settings** (encrypted at rest, server-side only). No key is needed to
try the app — every Agent node defaults to the `mock` provider, which echoes the assembled prompt.

## How it works

- **Canvas** (`/graphs/:id`): drag nodes from the palette, edit their variables in the Inspector,
  and wire ports left → right. The graph autosaves.
- **Compilation** (`lib/engine/compile.ts`, pure): reverse-traverses upstream of an Agent node and
  assembles `{ system, messages, tools }`. The live preview renders this exact call, so what you see
  is what gets sent.
- **Execution** (`lib/engine/run.ts`): runs every Agent node, fanning out independent agents
  concurrently and streaming their output (multiplexed per node) back to the UI as newline-delimited
  JSON.
- **Node types** are defined in one place (`lib/nodes/registry.ts`) — each entry supplies a Zod
  schema, Inspector fields, ports, and a `compile()` contribution. Adding a node type needs no
  database migration.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (runs `prisma generate`) |
| `npm test` | Run the compiler unit tests (Vitest) |
| `npm run db:push` | Sync the Prisma schema to SQLite |

## Integrate your stack

The app is feature-complete for local use; "going live" is mostly integration:

1. **Add provider keys** (Settings) for Anthropic / OpenAI / Google, then switch any Agent node off
   the `mock` provider. Keys are encrypted at rest and never sent to the browser.
2. **Add connectors** (Settings) so agents can call your tools:
   - `builtin` — local helpers (echo/uppercase/…), no setup.
   - `http` — any HTTP endpoint (behind an SSRF guard).
   - `mcp` — a Model Context Protocol server (e.g. your HyperFX/Zapier MCP) via stdio or Streamable
     HTTP. Use **Discover tools** to list a server's tools, and **Test** to validate a connector.
3. **Build graphs** — start from a template on an app's page, wire nodes, fill `{{variables}}`, and Run.

## Feature status

Implemented: project/app/graph hierarchy; canvas editor with all node types; live prompt preview;
single-agent and concurrent fan-out streaming runs; App sub-graph nesting (with cycle/depth guards);
Build artifact capture; run history; Connector tool execution (`builtin` / `http` / `mcp`) with
connector test + MCP tool discovery; run-variable inputs; graph export/import; starter templates;
encrypted credentials; mock + Anthropic/OpenAI/Google providers.

Not yet done: the real-provider tool-calling loop is wired but unverified without a key; the canvas
still needs real-browser QA; MCP connectors cover stdio + Streamable HTTP (no SSE transport yet).
