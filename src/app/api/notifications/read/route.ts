import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError, sameOrigin } from "@/lib/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Zahtev nije dozvoljen.", 403);
  const user = await getCurrentUser();
  if (!user) return jsonError("Prijavite se.", 401);
  const body = await request.json().catch(() => null);
  if (body?.all) {
    await prisma.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
  } else if (typeof body?.id === "string") {
    await prisma.notification.updateMany({ where: { id: body.id, userId: user.id }, data: { read: true } });
  }
  return NextResponse.json({ ok: true });
}
