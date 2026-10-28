import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError, sameOrigin } from "@/lib/http";
import { refreshSurfaces } from "@/lib/listings";
import { audit, notify } from "@/lib/notify";

const schema = z.object({
  action: z.enum(["approve", "reject", "remove"]),
  reason: z.string().trim().max(500).optional().default(""),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return jsonError("Zahtev nije dozvoljen.", 403);
  try {
    const admin = await requireAdmin();
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("Radnja nije prepoznata.");
    const { id } = await context.params;
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return jsonError("Oglas nije pronađen.", 404);

    if (parsed.data.action === "approve") {
      if (listing.status !== "PENDING") return jsonError("Samo oglas na čekanju može da se odobri.");
      const now = new Date();
      await prisma.listing.update({
        where: { id },
        data: {
          status: "ACTIVE",
          startsAt: now,
          endsAt: new Date(now.getTime() + listing.durationHours * 3600 * 1000),
          rejectionReason: "",
        },
      });
      await notify(listing.sellerId, {
        type: "LISTING_APPROVED",
        title: "Oglas je odobren",
        body: `„${listing.title}“ je sada na aukciji.`,
        href: `/aukcije/${listing.slug}`,
      });
    } else if (parsed.data.action === "reject") {
      if (listing.status !== "PENDING") return jsonError("Samo oglas na čekanju može da se odbije.");
      if (parsed.data.reason.length < 5) return jsonError("Unesite razlog odbijanja.");
      await prisma.listing.update({ where: { id }, data: { status: "REJECTED", rejectionReason: parsed.data.reason } });
      await notify(listing.sellerId, {
        type: "LISTING_REJECTED",
        title: "Oglas je odbijen",
        body: `„${listing.title}“ nije objavljen. ${parsed.data.reason}`,
        href: "/nalog/oglasi",
      });
    } else {
      if (listing.status === "ENDED_SOLD") return jsonError("Prodata aukcija se ne uklanja jer ima finansijski zapis.");
      await prisma.listing.update({ where: { id }, data: { status: "REMOVED", rejectionReason: parsed.data.reason } });
      await notify(listing.sellerId, {
        type: "LISTING_REJECTED",
        title: "Oglas je uklonjen",
        body: `„${listing.title}“ je uklonjen sa platforme.`,
        href: "/nalog/oglasi",
      });
    }

    await audit(admin.id, parsed.data.action, "listing", id, { reason: parsed.data.reason });
    refreshSurfaces(listing.slug);
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Nemate ovlašćenje.", 403);
  }
}
