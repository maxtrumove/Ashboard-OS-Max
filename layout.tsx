#!/usr/bin/env node
// Driver for the agent-puppets web app — God Mode workspace (and the
// legacy /graphs canvas). Launches a headless Chromium (via Playwright),
// drives the running Next.js server, runs a smoke flow, and writes a
// screenshot. This is the harness a future agent uses to *see* the app.
//
// Prereqs (see SKILL.md): a server already running, Playwright + its
// chromium browser installed, PLAYWRIGHT_BROWSERS_PATH pointing at them.
//
// Usage:
//   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node \
//     .claude/skills/run-agent-puppets/driver.mjs [--url=URL] [--out=PATH] [--no-smoke]
//
// Defaults: --url=http://localhost:3137/god-mode  --out=/tmp/godmode.png
// Exit code is non-zero if the smoke assertions fail.

import { chromium } from "playwright";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : [a, true];
  }),
);

const url = args.url || process.env.BASE_URL || "http://localhost:3137/god-mode";
const out = args.out || "/tmp/godmode.png";
const smoke = !args["no-smoke"];

const fail = (msg) => {
  console.error("FAIL:", msg);
  process.exitCode = 1;
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });

try {
  const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  console.log("GET", url, "->", resp?.status());

  if (smoke) {
    // 1) God Mode shell renders: header + command bar.
    await page.getByText("COMMAND CENTER", { exact: false }).first().waitFor({ timeout: 10000 });
    const cmd = page.getByPlaceholder(/Ask God Mode anything/);
    await cmd.waitFor({ timeout: 10000 });
    console.log("OK: God Mode shell + command bar present");

    // 2) Command palette resolves a query (the command engine works).
    await cmd.click();
    await cmd.fill("Open Gemini");
    await page.getByText(/Launch Gemini/i).first().waitFor({ timeout: 5000 });
    console.log("OK: command palette resolved 'Open Gemini'");
    await page.keyboard.press("Escape");

    // 3) A column card opens the preview modal.
    await page.locator("#col-projects button").nth(1).click();
    await page.getByText(/Screenshot preview/i).first().waitFor({ timeout: 5000 });
    console.log("OK: project preview modal opened");
    await page.keyboard.press("Escape");
  }

  await page.screenshot({ path: out, fullPage: false });
  console.log("screenshot ->", out);
} catch (err) {
  fail(err.message);
  try {
    await page.screenshot({ path: out });
    console.log("screenshot (on error) ->", out);
  } catch {}
} finally {
  await browser.close();
}

if (process.exitCode) console.error("driver: smoke FAILED");
else console.log("driver: smoke PASSED");
