---
name: run-agent-puppets
description: Build, launch, and drive the agent-puppets web app — especially the God Mode command center at /god-mode. Use when asked to run, start, serve, smoke-test, or screenshot agent-puppets or God Mode in a headless container.
---

# Run agent-puppets

A Next.js 15 (React 19) app. The headline surface is **God Mode** at
**`/god-mode`** — a fully static/client command center that needs **no
database**. The legacy surfaces (`/graphs`, `/settings`, `/api/*`) use
Prisma/Postgres and need env to function at runtime.

Drive it headlessly with the committed Playwright driver
`.claude/skills/run-agent-puppets/driver.mjs`: start the server, then run
the driver to smoke-test and screenshot. `chromium-cli` is **not**
available in this container — use the driver.

All paths below are relative to the repo root (the unit).

## Prerequisites

```bash
npm install                          # app deps (~315 pkgs)
npm install --no-save playwright     # the driver's only extra dep (keeps package.json clean)
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npx playwright install chromium
```

In this container Chromium is already at `/opt/pw-browsers` — set
`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers` for every driver/Playwright
command. On a fresh machine, omit the env var and `npx playwright install
chromium` downloads it to the default cache.

## Build

```bash
npm run build                        # runs `prisma generate && next build`
```

Builds clean with **no env vars** — Prisma's client connects lazily and
God Mode never queries, so a missing `DATABASE_URL` does not break the
build. (15 routes; `/god-mode` is prerendered static.)

## Run (agent path) — server + driver

Start the server in the background, wait for it, then drive it:

```bash
PORT=3137 npm run start >/tmp/start.log 2>&1 &
for i in $(seq 1 30); do curl -sf http://localhost:3137/god-mode -o /dev/null && break; sleep 1; done
curl -s -o /dev/null -w 'god-mode %{http_code}\n' http://localhost:3137/god-mode   # -> 200

PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
  node .claude/skills/run-agent-puppets/driver.mjs --out=/tmp/godmode.png
```

The driver navigates to `/god-mode`, asserts the shell renders, types
`Open Gemini` into the command bar and checks the palette resolves it,
opens a project preview modal, then writes the screenshot. Expected tail:

```
GET http://localhost:3137/god-mode -> 200
OK: God Mode shell + command bar present
OK: command palette resolved 'Open Gemini'
OK: project preview modal opened
screenshot -> /tmp/godmode.png
driver: smoke PASSED
```

Driver flags: `--url=<full url>` (default `http://localhost:3137/god-mode`),
`--out=<png path>` (default `/tmp/godmode.png`), `--no-smoke` (just
screenshot). Non-zero exit means a smoke assertion failed (and it still
writes a screenshot for inspection). **Look at the PNG** to confirm a real
render, not an error page.

Stop the server (run on its own line — see Gotchas):

```bash
pkill -f next-server
```

## Run (human path)

```bash
npm run dev          # http://localhost:3000 — Ctrl-C to stop
```

Useless headless (no browser opens); use the driver instead.

## Test

```bash
npm test             # vitest, 27 tests (command engine, compiler, connectors)
npx tsc --noEmit     # typecheck, clean
```

## Gotchas

- **`/` 307-redirects to `/god-mode`** (set in `next.config.mjs`). Point
  the driver straight at `/god-mode`; navigating to `/` just bounces.
- **God Mode needs zero env.** It's static/client-only. Only `/graphs`,
  `/settings`, and `/api/*` need `DATABASE_URL` + `DIRECT_URL` (Postgres)
  and `CREDENTIAL_SECRET`; without them the build still succeeds but those
  routes 500 at runtime. You can build + run + screenshot God Mode with no
  `.env` at all.
- **Playwright can't find the browser** unless `PLAYWRIGHT_BROWSERS_PATH`
  points at where chromium was installed (`/opt/pw-browsers` here).
- **`chromium-cli` is not installed** in this container — the committed
  `driver.mjs` (Playwright) is the harness.
- **The driver does not start a server** — it drives one that's already
  running. Start the server and wait for `/god-mode` → 200 first.
- **Keep `playwright` out of `package.json`** — install it `--no-save`;
  it's agent tooling, not an app dependency.

## Troubleshooting

- `Cannot find module 'vitest/config'` or `Cannot find module 'playwright'`
  → deps aren't installed; run the Prerequisites block.
- Driver throws `browserType.launch: Executable doesn't exist at …` → set
  `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`, or run
  `npx playwright install chromium`.
- `npm run start` 404s everything / connection refused → you didn't
  `npm run build` first, or the port is taken; this app's start command
  needs a prior build.
