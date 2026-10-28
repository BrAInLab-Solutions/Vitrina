import { getCurrentUser } from "@/lib/auth";
import { loadListing, settleExpiredAuctions, toDetail } from "@/lib/auctions";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const user = await getCurrentUser();
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      let last = "";
      const send = async () => {
        if (closed) return;
        try {
          await settleExpiredAuctions();
          const listing = await loadListing(slug);
          if (!listing || !["ACTIVE", "ENDED_SOLD", "ENDED_UNSOLD"].includes(listing.status)) return;
          const detail = toDetail(listing, user?.id);
          const payload = JSON.stringify({
            status: detail.status,
            startPrice: detail.startPrice,
            currentBid: detail.currentBid,
            bidCount: detail.bidCount,
            nextBid: detail.nextBid,
            endsAt: detail.endsAt,
            extensions: detail.extensions,
            bids: detail.bids,
          });
          if (payload !== last) {
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
            last = payload;
          } else {
            controller.enqueue(encoder.encode(`: ping\n\n`));
          }
        } catch {
          /* The next tick tries again. */
        }
      };
      await send();
      const timer = setInterval(send, 3000);
      request.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(timer);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
