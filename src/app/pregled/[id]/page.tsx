import { notFound, redirect } from "next/navigation";
import { ListingView } from "@/components/listing-view";
import { getCurrentUser } from "@/lib/auth";
import { loadListing, toDetail } from "@/lib/auctions";
import { prisma } from "@/lib/db";
import { formatPercent } from "@/lib/money";
import { getSettings } from "@/lib/settings";

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/prijava?next=/nalog/oglasi");
  const { id } = await params;
  const found = await prisma.listing.findUnique({ where: { id } });
  if (!found || (found.sellerId !== user.id && user.role !== "ADMIN")) notFound();
  const listing = await loadListing(found.slug);
  if (!listing) notFound();
  const settings = await getSettings();
  return (
    <ListingView
      detail={toDetail(listing, user.id)}
      commissionLabel={formatPercent(settings.commissionRate)}
      loggedIn
      favorite={false}
      allowBid={["ACTIVE", "ENDED_SOLD", "ENDED_UNSOLD"].includes(listing.status)}
    />
  );
}
