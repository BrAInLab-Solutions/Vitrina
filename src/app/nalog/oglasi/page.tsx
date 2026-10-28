import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { statusLabel } from "@/lib/labels";
import { formatEuro } from "@/lib/money";

export default async function ListingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const listings = await prisma.listing.findMany({ where: { sellerId: user.id }, orderBy: { updatedAt: "desc" } });
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="serif text-4xl">Moji oglasi</h1>
        <Link className="btn btn-gold btn-sm" href="/prodaj">Novi sajt</Link>
      </div>
      <div className="mt-6 grid gap-3">
        {listings.length === 0 && <p className="text-muted">Nemate oglasa. Nacrt možete sačuvati pre slanja na odobrenje.</p>}
        {listings.map((listing) => (
          <article key={listing.id} className="panel">
            <h2 className="serif text-2xl">{listing.title}</h2>
            <p className="text-sm text-muted">{statusLabel[listing.status]} · početna {formatEuro(listing.startPrice)} {listing.isDemo ? "· testni projekat" : ""}</p>
            {listing.rejectionReason && <p className="mt-2 text-sm text-danger">{listing.rejectionReason}</p>}
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              {["DRAFT", "REJECTED"].includes(listing.status) && <Link className="text-gold" href={`/prodaj?id=${listing.id}`}>Nastavi uređivanje</Link>}
              <Link className="text-gold" href={`/pregled/${listing.id}`}>Pregled</Link>
              {["ACTIVE", "ENDED_SOLD", "ENDED_UNSOLD"].includes(listing.status) && <Link className="text-gold" href={`/aukcije/${listing.slug}`}>Javna stranica</Link>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
