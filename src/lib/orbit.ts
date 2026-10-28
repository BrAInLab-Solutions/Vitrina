import { formatEuro } from "@/lib/money";

export type OrbitItem = {
  id: string;
  kind: "auction";
  title: string;
  blurb: string;
  meta: string;
  href: string;
  mark: string;
  price: string;
  bidCount: number;
  endsAt: string | null;
};

export function buildOrbitItems(
  auctions: Array<{
    slug: string;
    title: string;
    summary: string;
    currentBid: number;
    startPrice: number;
    bidCount: number;
    category: string;
    endsAt: string | null;
  }>,
): OrbitItem[] {
  return auctions.slice(0, 6).map((item, index) => ({
    id: `lot-${item.slug}`,
    kind: "auction" as const,
    title: item.title,
    blurb: item.summary,
    meta: item.category,
    href: `/aukcije/${item.slug}`,
    mark: String(index + 1).padStart(2, "0"),
    price: formatEuro(item.bidCount > 0 ? item.currentBid : item.startPrice),
    bidCount: item.bidCount,
    endsAt: item.endsAt,
  }));
}
