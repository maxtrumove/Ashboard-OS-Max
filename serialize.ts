import { NextResponse, type NextRequest } from "next/server";
import { REFRESH_COOKIE, exchangeCode, gmailCreds } from "@/lib/godmode/gmail";

// Google redirects back here with an authorization code. We exchange it for a
// refresh token, stash it in an httpOnly cookie, and bounce home.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const home = (status: string) => NextResponse.redirect(`${origin}/god-mode?gmail=${status}`);

  const error = req.nextUrl.searchParams.get("error");
  const code = req.nextUrl.searchParams.get("code");
  if (error || !code) return home("denied");

  const creds = gmailCreds();
  if (!creds) return home("unconfigured");

  const { refreshToken } = await exchangeCode(code, origin, creds);
  if (!refreshToken) {
    // No refresh token (e.g. already-granted consent without prompt) — still a
    // failure for our purposes since we can't mint future access tokens.
    return home("error");
  }

  const res = home("connected");
  res.cookies.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180, // ~6 months
  });
  return res;
}
