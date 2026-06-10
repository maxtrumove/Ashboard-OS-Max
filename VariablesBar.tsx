import { NextResponse, type NextRequest } from "next/server";
import { authUrl, gmailCreds } from "@/lib/godmode/gmail";

// Kicks off the Google OAuth consent flow. If no OAuth client is configured we
// say so (the UI then falls back to Cop's manual playbook).

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const creds = gmailCreds();
  if (!creds) {
    return NextResponse.json(
      { configured: false, message: "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Gmail sign-in." },
      { status: 200 },
    );
  }
  return NextResponse.redirect(authUrl(req.nextUrl.origin, creds));
}
