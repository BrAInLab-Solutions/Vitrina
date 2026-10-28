import Link from "next/link";
import { bidderAlias } from "@/lib/labels";
import { prisma } from "@/lib/db";
import { statusLabel } from "@/lib/labels";
import { formatEuro } from "@/lib/money";

export default async function AdminAuctions() {
  const listings = await prisma.listing.findMany({
    where: { status: { in: ["ACTIVE", "ENDED_SOLD", "ENDED_UNSOLD"] } },
    include: { bids: { include: { user: true }, orderBy: { amount: "desc" } }, seller: true },
    orderBy: { endsAt: "asc" },
  });
  return (
    <div>
      <h1 className="serif text-4xl">Aukcije i ponude</h1>
      <p className="mt-2 text-sm text-muted">Imena ponuđača vide se samo ovde, zbog provere. Na javnoj strani ostaje skraćeni alias.</p>
      <div className="mt-6 grid gap-4">
        {listings.map((listing) => (
          <article key={listing.id} className="panel">
            <div className="flex flex-wrap justify-between gap-2">
              <h2 className="serif text-2xl">{listing.title}</h2>
              <span className="text-sm text-muted">{statusLabel[listing.status]} {listing.isDemo ? "· test" : ""}</span>
            </div>
            <p className="text-sm text-muted">Prodavac: {listing.seller.email} · najviša {formatEuro(listing.currentBid || listing.startPrice)}</p>
            <Link className="text-sm text-gold" href={`/aukcije/${listing.slug}`}>Javna stranica</Link>
            <div className="table-wrap mt-3">
              <table>
                <thead><tr><th>Ponuđač</th><th>Alias</th><th>Iznos</th><th>Vreme</th></tr></thead>
                <tbody>
                  {listing.bids.map((bid) => (
                    <tr key={bid.id}>
                      <td>{bid.user.name}<br /><span className="text-muted">{bid.user.email}</span></td>
                      <td>{bidderAlias(bid.userId, bid.user.name)}</td>
                      <td className="num">{formatEuro(bid.amount)}</td>
                      <td>{bid.createdAt.toLocaleString("sr-Latn-RS")}</td>
                    </tr>
                  ))}
                  {listing.bids.length === 0 && <tr><td colSpan={4}>Nema ponuda.</td></tr>}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
