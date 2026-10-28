import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatEuro, minimumBid } from "@/lib/money";
import { notify } from "@/lib/notify";
import { getSettings } from "@/lib/settings";

export class BidError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function placeBid(slug: string, userId: string, amountCents: number) {
  if (!Number.isInteger(amountCents) || amountCents <= 0 || amountCents > 100_000_000_00) {
    throw new BidError("Iznos ponude nije ispravan.");
  }

  const settings = await getSettings();

  try {
    return await prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({ where: { slug } });
      if (!listing || listing.status === "REMOVED") throw new BidError("Aukcija nije pronađena.", 404);
      if (listing.status !== "ACTIVE" || !listing.endsAt) throw new BidError("Aukcija nije aktivna.");
      if (listing.endsAt.getTime() <= Date.now()) throw new BidError("Aukcija je završena.");
      if (listing.sellerId === userId) throw new BidError("Ne možete da licitirate na sopstveni sajt.");

      const bidder = await tx.user.findUnique({ where: { id: userId } });
      if (!bidder || bidder.disabled) throw new BidError("Nalog ne može da licitira.", 403);

      const floor = minimumBid(listing.startPrice, listing.currentBid, listing.bidCount);
      if (amountCents < floor) {
        throw new BidError(`Ponuda mora biti najmanje ${formatEuro(floor)}.`);
      }

      const previous = await tx.bid.findFirst({
        where: { listingId: listing.id },
        orderBy: { amount: "desc" },
      });

      await tx.bid.create({
        data: { listingId: listing.id, userId, amount: amountCents },
      });

      let endsAt = listing.endsAt;
      let extensions = listing.extensions;
      let extended = false;
      const remainingMs = endsAt.getTime() - Date.now();
      const windowMs = settings.antiSnipeWindowMinutes * 60 * 1000;
      if (remainingMs <= windowMs && extensions < settings.maxExtensions) {
        endsAt = new Date(Date.now() + settings.antiSnipeExtendMinutes * 60 * 1000);
        extensions += 1;
        extended = true;
      }

      const stillSoon = endsAt.getTime() - Date.now() <= 60 * 60 * 1000;
      const updated = await tx.listing.updateMany({
        where: { id: listing.id, version: listing.version, status: "ACTIVE" },
        data: {
          currentBid: amountCents,
          leadingPrice: amountCents,
          bidCount: { increment: 1 },
          version: { increment: 1 },
          endsAt,
          extensions,
          endingSoonNotified: stillSoon ? listing.endingSoonNotified : false,
        },
      });
      if (updated.count !== 1) throw new BidError("Ponuda je u međuvremenu promenjena. Pokušajte ponovo.", 409);

      const watchers = await tx.favorite.findMany({
        where: { listingId: listing.id },
        select: { userId: true },
      });

      return {
        listing,
        userId,
        previousUserId: previous?.userId ?? null,
        watcherIds: watchers.map((item) => item.userId),
        extended,
        endsAt,
        amountCents,
      };
    });
  } catch (error) {
    if (error instanceof BidError) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new BidError("Isti iznos je već prihvaćen. Ponudite više.", 409);
    }
    throw error;
  }
}

export async function notifyBidResult(result: Awaited<ReturnType<typeof placeBid>>) {
  const { listing, userId, previousUserId, watcherIds, extended, amountCents } = result;
  const extra = extended ? " Aukcija je produžena jer je ponuda stigla neposredno pred kraj." : "";

  if (previousUserId && previousUserId !== userId) {
    await notify(previousUserId, {
      type: "OUTBID",
      title: "Vaša ponuda je nadmašena",
      body: `Nova najviša ponuda za „${listing.title}“ je ${formatEuro(amountCents)}.${extra}`,
      href: `/aukcije/${listing.slug}#ponuda`,
    });
  }

  const recipients = new Set<string>([listing.sellerId, ...watcherIds]);
  recipients.delete(userId);
  if (previousUserId) recipients.delete(previousUserId);

  for (const recipient of recipients) {
    await notify(recipient, {
      type: "NEW_BID",
      title: "Nova ponuda",
      body: `Na „${listing.title}“ stigla je ponuda od ${formatEuro(amountCents)}.${extra}`,
      href: `/aukcije/${listing.slug}`,
    });
  }

  return { extended, endsAt: result.endsAt.toISOString(), amount: amountCents };
}
