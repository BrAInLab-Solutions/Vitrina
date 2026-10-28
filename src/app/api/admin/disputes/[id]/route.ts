import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError, sameOrigin } from "@/lib/http";
import { audit, notify } from "@/lib/notify";

const schema = z.object({
  status: z.enum(["REVIEW", "RESOLVED", "REJECTED"]),
  resolution: z.string().trim().max(2000).optional().default(""),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return jsonError("Zahtev nije dozvoljen.", 403);
  try {
    const admin = await requireAdmin();
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("Odluka nije ispravna.");
    if (parsed.data.status !== "REVIEW" && parsed.data.resolution.length < 5) {
      return jsonError("Unesite kratku odluku.");
    }
    const { id } = await context.params;
    const dispute = await prisma.dispute.update({
      where: { id },
      data: { status: parsed.data.status, resolution: parsed.data.resolution },
      include: { transaction: { include: { listing: true } } },
    });
    await notify(dispute.userId, {
      type: "DISPUTE",
      title: "Prijava je ažurirana",
      body: `Prijava za „${dispute.transaction.listing.title}“ sada ima status: ${parsed.data.status}. ${parsed.data.resolution}`,
      href: `/placanje/${dispute.transactionId}`,
    });
    await audit(admin.id, "dispute.update", "dispute", id, parsed.data);
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Nemate ovlašćenje.", 403);
  }
}
