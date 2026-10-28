import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AccountHome() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [bids, wins, favorites, unread, listings] = await Promise.all([
    prisma.bid.count({ where: { userId: user.id } }),
    prisma.transaction.count({ where: { buyerId: user.id } }),
    prisma.favorite.count({ where: { userId: user.id } }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
    prisma.listing.count({ where: { sellerId: user.id } }),
  ]);
  return (
    <div>
      <p className="kicker">Nalog</p>
      <h1 className="serif mt-2 text-4xl">{user.name}</h1>
      <p className="mt-2 text-muted">{user.email} · {user.isSeller ? "Kupac i kreator" : "Kupac"} {user.sellerVerified ? "· verifikovan kreator" : ""}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Ponude", bids, "/nalog/ponude"],
          ["Kupovine", wins, "/nalog/kupovine"],
          ["Omiljeni", favorites, "/nalog/omiljeni"],
          ["Nepročitano", unread, "/nalog/obavestenja"],
          ["Oglasi", listings, "/nalog/oglasi"],
        ].map(([label, value, href]) => (
          <Link key={String(href)} href={String(href)} className="panel">
            <p className="text-sm text-muted">{label}</p>
            <p className="serif num mt-2 text-4xl">{value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
