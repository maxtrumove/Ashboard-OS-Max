import type { NextRequest } from "next/server";
import type { CompiledCall } from "@/lib/engine/compile";
import type { CompiledMessage } from "@/lib/nodes/types";
import { resolveProviderKey } from "@/lib/engine/keys";
import { streamAgent } from "@/lib/engine/providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Diagnostic: reports which provider-key env-var NAMES are visible to this
// running function (booleans only — never the secret values). Lets us confirm
// from outside whether a key actually reached the deployment's runtime.
export async function GET() {
  const names = [
    "GOOGLE_GENERATIVE_AI_API_KEY",
    "GEMINI_API_KEY",
    "GOOGLE_API_KEY",
    "GOOGLE_AI_API_KEY",
    "ANTHROPIC_API_KEY",
    "OPENAI_API_KEY",
    "DATABASE_URL",
  ];
  const present = Object.fromEntries(names.map((n) => [n, Boolean(process.env[n]?.trim())]));
  return Response.json({
    present,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    note: "booleans only; no secret values are returned",
  });
}

// God Mode's command-bar brain. Streams a Claude (or GPT/Gemini) reply using
// the app's existing agent engine. With no key configured it gracefully falls
// back to the `mock` provider so the pipeline is demoable end-to-end; the
// moment an ANTHROPIC_API_KEY (or a saved credential) exists it answers for
// real. Connector tools (Firecrawl / Gmail / n8n / …) wire in on top of this.
const SYSTEM = [
  "You are God Mode — a unified command center copilot that sits above the user's whole tool ecosystem.",
  "Be concise, direct, and action-oriented. Prefer short paragraphs and tight bullet lists.",
  "When a request needs an external action (scrape the web, send email, run an automation),",
  "say which connector/tool you would use and what you'd do — real tool execution is enabled",
  "once the user adds that connector in Settings.",
].join(" ");

interface Body {
  messages?: { role: "user" | "assistant"; content: string }[];
  provider?: string;
}

export async function POST(req: NextRequest) {
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const incoming = (body.messages ?? []).filter((m) => m?.content?.trim());
  if (incoming.length === 0) return new Response("No messages", { status: 400 });

  let provider = body.provider || "anthropic";
  // resolveProviderKey hits the DB for saved creds; tolerate its absence.
  let apiKey: string | null = null;
  if (provider !== "mock") {
    try {
      apiKey = await resolveProviderKey(provider);
    } catch {
      apiKey = null;
    }
    if (!apiKey) provider = "mock"; // graceful fallback so the bar always responds
  }

  const messages: CompiledMessage[] = incoming.map((m) => ({ role: m.role, content: m.content }));
  const compiled: CompiledCall = {
    agentNodeId: "godmode",
    provider,
    model: "",
    temperature: 0.4,
    maxTokens: 1024,
    system: SYSTEM,
    messages,
    tools: [],
  };

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const delta of streamAgent(compiled, apiKey)) {
          controller.enqueue(encoder.encode(delta));
        }
      } catch (err) {
        controller.enqueue(encoder.encode(`\n\n[error] ${(err as Error).message}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Godmode-Provider": provider, // "mock" until a key is added
    },
  });
}
