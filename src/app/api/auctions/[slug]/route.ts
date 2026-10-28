import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { loadListing, settleExpiredAuctions, toDetail } from "@/lib/auctions";
import { jsonError } from "@/lib/http";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  await settleExpiredAuctions();
  const listing = await loadListing(slug);
  if (!listing || !["ACTIVE", "ENDED_SOLD", "ENDED_UNSOLD"].includes(listing.status)) {
    return jsonError("Aukcija nije pronađena.", 404);
  }
  const user = await getCurrentUser();
  const detail = toDetail(listing, user?.id);
  return NextResponse.json({
    status: detail.status,
    startPrice: detail.startPrice,
    currentBid: detail.currentBid,
    bidCount: detail.bidCount,
    nextBid: detail.nextBid,
    endsAt: detail.endsAt,
    extensions: detail.extensions,
    bids: detail.bids,
  });
}
