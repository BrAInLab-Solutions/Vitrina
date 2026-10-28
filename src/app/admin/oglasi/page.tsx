import Link from "next/link";
import { ModerateButtons } from "@/components/actions";
import { prisma } from "@/lib/db";
import { ownershipLabel, statusLabel } from "@/lib/labels";
import { formatEuro } from "@/lib/money";

export default async function AdminListings() {
  const listings = await prisma.listing.findMany({
    include: { seller: true, category: true },
    orderBy: { createdAt: "desc" },
  });
  const pending = listings.filter((listing) => listing.status === "PENDING");
  return (
    <div>
      <h1 className="serif text-4xl">Oglasi</h1>
      <p className="mt-2 text-sm text-muted">{pending.length} čeka odobrenje.</p>
      <div className="mt-6 grid gap-4">
        {listings.map((listing) => (
          <article key={listing.id} className="panel">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h2 className="serif text-2xl">{listing.title}</h2>
                <p className="text-sm text-muted">{listing.seller.name} · {listing.category.name} · {ownershipLabel[listing.ownership]} · {statusLabel[listing.status]} {listing.isDemo ? "· test" : ""}</p>
              </div>
              <p className="num">{formatEuro(listing.leadingPrice)}</p>
            </div>
            <div className="mt-3 flex gap-3 text-sm">
              <Link className="text-gold" href={`/pregled/${listing.id}`}>Pregled</Link>
              {["ACTIVE", "ENDED_SOLD", "ENDED_UNSOLD"].includes(listing.status) && <Link className="text-gold" href={`/aukcije/${listing.slug}`}>Javno</Link>}
            </div>
            {listing.status !== "ENDED_SOLD" && <div className="mt-4"><ModerateButtons id={listing.id} /></div>}
          </article>
        ))}
      </div>
    </div>
  );
}
