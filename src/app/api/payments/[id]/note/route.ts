import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError, sameOrigin } from "@/lib/http";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return jsonError("Zahtev nije dozvoljen.", 403);
  const user = await getCurrentUser();
  if (!user) return jsonError("Prijavite se.", 401);
  const { id } = await context.params;
  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction || transaction.buyerId !== user.id) return jsonError("Transakcija nije pronađena.", 404);
  const body = await request.json().catch(() => null);
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 1000) : "";
  if (note.length < 3) return jsonError("Napomena je prekratka.");
  await prisma.transaction.update({ where: { id }, data: { buyerNote: note } });
  return NextResponse.json({ ok: true });
}
