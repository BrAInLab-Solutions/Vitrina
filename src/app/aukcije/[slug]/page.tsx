import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingView } from "@/components/listing-view";
import { getCurrentUser } from "@/lib/auth";
import { loadListing, settleExpiredAuctions, toDetail } from "@/lib/auctions";
import { prisma } from "@/lib/db";
import { formatPercent } from "@/lib/money";
import { getSettings } from "@/lib/settings";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const listing = await loadListing(slug);
  return { title: listing?.title ?? "Aukcija" };
}

export default async function AuctionPage({ params }: { params: Promise<{ slug: string }> }) {
  await settleExpiredAuctions();
  const { slug } = await params;
  const listing = await loadListing(slug);
  if (!listing || !["ACTIVE", "ENDED_SOLD", "ENDED_UNSOLD"].includes(listing.status)) notFound();
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);
  const favorite = user
    ? Boolean(await prisma.favorite.findUnique({ where: { userId_listingId: { userId: user.id, listingId: listing.id } } }))
    : false;
  return (
    <ListingView
      detail={toDetail(listing, user?.id)}
      commissionLabel={formatPercent(settings.commissionRate)}
      loggedIn={Boolean(user)}
      favorite={favorite}
      allowBid
    />
  );
}
