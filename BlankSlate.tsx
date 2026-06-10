import { NextResponse, type NextRequest } from "next/server";
import { REFRESH_COOKIE } from "@/lib/godmode/gmail";
import { getMailboxes } from "@/lib/godmode/mail";

// Aggregated multi-inbox feed for the Communications panel. Merges the Gmail
// OAuth inbox with any configured IMAP accounts (Yahoo, etc.). IMAP uses raw
// TLS sockets, so this must run on the Node.js runtime, not the edge.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;
  try {
    const { accounts, messages, unread } = await getMailboxes(refresh);
    return NextResponse.json({
      accounts: accounts.map(({ messages: _m, ...a }) => a), // per-account status, not the bodies
      messages: messages.slice(0, 8),
      unread,
    });
  } catch {
    return NextResponse.json({ accounts: [], messages: [], unread: 0, error: "network" }, { status: 200 });
  }
}
