import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { statusLabel } from "@/lib/labels";
import { formatEuro } from "@/lib/money";

export default async function MyBidsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const bids = await prisma.bid.findMany({
    where: { userId: user.id },
    include: { listing: { include: { transaction: true } } },
    orderBy: { createdAt: "desc" },
  });
  const byListing = new Map<string, typeof bids>();
  for (const bid of bids) {
    const list = byListing.get(bid.listingId) ?? [];
    list.push(bid);
    byListing.set(bid.listingId, list);
  }
  return (
    <div>
      <h1 className="serif text-4xl">Moje ponude</h1>
      <div className="mt-6 grid gap-3">
        {byListing.size === 0 && <p className="text-muted">Još niste licitirali.</p>}
        {[...byListing.values()].map((group) => {
          const listing = group[0].listing;
          const mine = Math.max(...group.map((bid) => bid.amount));
          const leading = listing.currentBid === mine;
          const won = listing.winnerId === user.id;
          return (
            <article key={listing.id} className="panel">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="serif text-2xl">{listing.title}</h2>
                  <p className="text-sm text-muted">{statusLabel[listing.status]} {listing.isDemo ? "· testni projekat" : ""}</p>
                </div>
                <p className="num">{formatEuro(mine)}</p>
              </div>
              <p className="mt-2 text-sm">{won ? "Osvojili ste aukciju." : leading && listing.status === "ACTIVE" ? "Vaša ponuda je trenutno najviša." : "Postoji viša ponuda."}</p>
              <Link className="mt-3 inline-block text-sm text-gold" href={won && listing.transaction ? `/placanje/${listing.transaction.id}` : `/aukcije/${listing.slug}`}>
                {won ? "Instrukcije za plaćanje" : listing.status === "ACTIVE" ? "Otvori licitaciju" : "Otvori sajt"}
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
