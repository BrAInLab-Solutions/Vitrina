import { AuctionCard } from "@/components/auction-card";
import { toCard } from "@/lib/auctions";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { listing: { include: { category: true, seller: { select: { name: true, sellerVerified: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h1 className="serif text-4xl">Omiljeni sajtovi</h1>
      {favorites.length === 0 ? (
        <p className="mt-4 text-muted">Još nema sačuvanih sajtova. Na strani projekta izaberite „Sačuvaj“.</p>
      ) : (
        <div className="card-grid mt-6">
          {favorites.map((favorite) => <AuctionCard key={favorite.listingId} item={toCard(favorite.listing)} />)}
        </div>
      )}
    </div>
  );
}
