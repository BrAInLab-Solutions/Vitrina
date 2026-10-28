import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { loadListing, settleExpiredAuctions, toDetail } from "@/lib/auctions";
import { BidError, notifyBidResult, placeBid } from "@/lib/bids";
import { jsonError, rateLimit, sameOrigin } from "@/lib/http";
import { refreshSurfaces } from "@/lib/listings";
import { bidSchema, firstZodError } from "@/lib/validators";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  if (!sameOrigin(request)) return jsonError("Zahtev nije dozvoljen.", 403);
  const user = await getCurrentUser();
  if (!user) return jsonError("Prijavite se da biste licitirali.", 401);
  const limit = rateLimit(`bid:${user.id}`, 20, 60 * 1000);
  if (!limit.ok) return jsonError("Previše ponuda u kratkom vremenu.", 429);

  const parsed = bidSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(firstZodError(parsed.error));
  const { slug } = await context.params;

  try {
    const result = await placeBid(slug, user.id, parsed.data.amountEuro * 100);
    const note = await notifyBidResult(result);
    await settleExpiredAuctions();
    const listing = await loadListing(slug);
    const detail = listing ? toDetail(listing, user.id) : null;
    refreshSurfaces(slug);
    return NextResponse.json({ ok: true, ...note, nextBid: detail?.nextBid ?? null });
  } catch (error) {
    if (error instanceof BidError) return jsonError(error.message, error.status);
    console.error(error);
    return jsonError("Ponuda trenutno ne može da se prihvati.", 500);
  }
}
