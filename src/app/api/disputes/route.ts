import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError, sameOrigin } from "@/lib/http";
import { notify } from "@/lib/notify";
import { disputeSchema, firstZodError } from "@/lib/validators";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Zahtev nije dozvoljen.", 403);
  const user = await getCurrentUser();
  if (!user) return jsonError("Prijavite se.", 401);
  const parsed = disputeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(firstZodError(parsed.error));
  const transaction = await prisma.transaction.findUnique({ where: { id: parsed.data.transactionId }, include: { listing: true } });
  if (!transaction || (transaction.buyerId !== user.id && transaction.sellerId !== user.id)) {
    return jsonError("Transakcija nije pronađena.", 404);
  }
  const open = await prisma.dispute.findFirst({ where: { transactionId: transaction.id, status: { in: ["OPEN", "REVIEW"] } } });
  if (open) return jsonError("Za ovu transakciju već postoji otvorena prijava.");
  const dispute = await prisma.dispute.create({
    data: { transactionId: transaction.id, userId: user.id, reason: parsed.data.reason },
  });
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
  for (const admin of admins) {
    await notify(admin.id, {
      type: "DISPUTE",
      title: "Nova prijava",
      body: `Prijava za „${transaction.listing.title}“.`,
      href: "/admin/sporovi",
    });
  }
  return NextResponse.json({ id: dispute.id });
}
