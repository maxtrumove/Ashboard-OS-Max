import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encryptSecret } from "@/lib/crypto";

// Never returns secrets — only masked metadata.
export async function GET() {
  const creds = await prisma.credential.findMany({ orderBy: { provider: "asc" } });
  return NextResponse.json(
    creds.map((c) => ({ id: c.id, provider: c.provider, label: c.label, createdAt: c.createdAt })),
  );
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const provider = typeof body.provider === "string" ? body.provider : "";
  const secret = typeof body.secret === "string" ? body.secret : "";
  if (!provider || !secret) {
    return NextResponse.json({ error: "provider and secret required" }, { status: 400 });
  }
  const label = typeof body.label === "string" && body.label.trim() ? body.label.trim() : `${provider} key`;
  const secretEnc = encryptSecret(secret);

  const existing = await prisma.credential.findFirst({ where: { provider } });
  const cred = existing
    ? await prisma.credential.update({ where: { id: existing.id }, data: { label, secretEnc } })
    : await prisma.credential.create({ data: { provider, label, secretEnc } });

  return NextResponse.json({ id: cred.id, provider: cred.provider, label: cred.label });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.credential.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
