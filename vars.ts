import { NextResponse, type NextRequest } from "next/server";
import { REFRESH_COOKIE, fetchInbox, gmailConfigured, resolveAccessToken } from "@/lib/godmode/gmail";

// Home board inbox. Returns real Gmail when the user has connected (or a static
// GMAIL_ACCESS_TOKEN is set), otherwise a clean "not connected" signal plus
// whether the OAuth flow is even available (configured) so the UI can choose
// between the one-click Connect button and Cop's manual playbook.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const configured = gmailConfigured();
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;

  const token = await resolveAccessToken(refresh);
  if (!token) {
    return NextResponse.json({ connected: false, configured });
  }

  try {
    const messages = await fetchInbox(token);
    if (messages === null) {
      return NextResponse.json({ connected: false, configured, error: "auth" });
    }
    return NextResponse.json({ connected: true, configured, messages });
  } catch {
    return NextResponse.json({ connected: false, configured, error: "network" });
  }
}
