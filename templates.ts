import { NextResponse } from "next/server";
import { REFRESH_COOKIE } from "@/lib/godmode/gmail";

// Clears the stored Gmail refresh token (the UI's "Disconnect").

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ connected: false });
  res.cookies.set(REFRESH_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
