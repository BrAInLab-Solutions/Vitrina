import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError, sameOrigin } from "@/lib/http";
import { formatEuro, eurosToCents } from "@/lib/money";
import { audit, notify } from "@/lib/notify";
import { firstZodError, txUpdateSchema } from "@/lib/validators";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return jsonError("Zahtev nije dozvoljen.", 403);
  try {
    const admin = await requireAdmin();
    const parsed = txUpdateSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError(firstZodError(parsed.error));
    const { id } = await context.params;
    const current = await prisma.transaction.findUnique({ where: { id }, include: { listing: true } });
    if (!current) return jsonError("Transakcija nije pronađena.", 404);

    const data: {
      paymentStatus?: string;
      handoverStatus?: string;
      payoutStatus?: string;
      processorFee?: number;
      adminNote?: string;
      paidAt?: Date;
    } = {};

    if (parsed.data.adminNote !== undefined) data.adminNote = parsed.data.adminNote;
    if (parsed.data.processorFeeEuro !== undefined) data.processorFee = eurosToCents(parsed.data.processorFeeEuro);
    if (parsed.data.payoutStatus) {
      if (current.ownership === "HOUSE" && parsed.data.payoutStatus === "PAID") {
        return jsonError("Kod našeg projekta nema isplate eksternom kreatoru.");
      }
      if (parsed.data.payoutStatus === "PAID" && current.paymentStatus !== "PAID" && parsed.data.paymentStatus !== "PAID") {
        return jsonError("Isplata ide tek posle potvrđene uplate.");
      }
      data.payoutStatus = parsed.data.payoutStatus;
    }
    if (parsed.data.handoverStatus) {
      if (parsed.data.handoverStatus === "DELIVERED" && current.paymentStatus !== "PAID" && parsed.data.paymentStatus !== "PAID") {
        return jsonError("Predaja kreće tek posle potvrđene uplate.");
      }
      data.handoverStatus = parsed.data.handoverStatus;
    }
    if (parsed.data.paymentStatus) {
      data.paymentStatus = parsed.data.paymentStatus;
      if (parsed.data.paymentStatus === "PAID") {
        data.paidAt = new Date();
        if (!parsed.data.handoverStatus && current.handoverStatus === "PENDING") data.handoverStatus = "IN_PROGRESS";
      }
    }

    const updated = await prisma.transaction.update({ where: { id }, data });
    const title = current.listing.title;

    if (parsed.data.paymentStatus === "PAID") {
      await notify(current.buyerId, {
        type: "PAYMENT_CONFIRMED",
        title: "Plaćanje je potvrđeno",
        body: `Uplata za „${title}“ od ${formatEuro(current.finalPrice)} je evidentirana. Predaja može da počne.`,
        href: `/placanje/${current.id}`,
      });
      await notify(current.sellerId, {
        type: "PAYMENT_CONFIRMED",
        title: "Uplata je potvrđena",
        body: `Kupac je platio „${title}“.`,
        href: "/nalog/zarada",
      });
    }
    if (parsed.data.paymentStatus === "FAILED") {
      await notify(current.buyerId, {
        type: "PAYMENT_FAILED",
        title: "Plaćanje nije potvrđeno",
        body: `Uplata za „${title}“ je označena kao neuspešna.`,
        href: `/placanje/${current.id}`,
      });
    }
    if (updated.handoverStatus === "DELIVERED" && current.handoverStatus !== "DELIVERED") {
      await notify(current.buyerId, {
        type: "HANDOVER_DONE",
        title: "Sajt je predat",
        body: `Predaja za „${title}“ je označena kao završena.`,
        href: `/placanje/${current.id}`,
      });
    }
    if (updated.payoutStatus === "PAID" && current.payoutStatus !== "PAID") {
      await notify(current.sellerId, {
        type: "PAYOUT_SENT",
        title: "Isplata je evidentirana",
        body: `Neto iznos od ${formatEuro(current.sellerPayout)} za „${title}“ je označen kao isplaćen.`,
        href: "/nalog/zarada",
      });
    }

    await audit(admin.id, "transaction.update", "transaction", id, parsed.data);
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Nemate ovlašćenje.", 403);
  }
}
