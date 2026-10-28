import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError, sameOrigin } from "@/lib/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Zahtev nije dozvoljen.", 403);
  const user = await getCurrentUser();
  if (!user) return jsonError("Prijavite se.", 401);
  await prisma.user.update({ where: { id: user.id }, data: { isSeller: true } });
  return NextResponse.json({ ok: true });
}
