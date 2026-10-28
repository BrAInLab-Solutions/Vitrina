export function formatEuro(cents: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function eurosToCents(euros: number) {
  return Math.round(euros * 100);
}

export function formatPercent(rate: number) {
  return new Intl.NumberFormat("sr-Latn-RS", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(rate);
}

export function bidIncrement(currentCents: number) {
  if (currentCents < 50_000) return 1_000;
  if (currentCents < 200_000) return 2_500;
  if (currentCents < 1_000_000) return 5_000;
  return 10_000;
}

export function minimumBid(startPrice: number, currentBid: number, bidCount: number) {
  if (bidCount <= 0 || currentBid <= 0) return startPrice;
  return currentBid + bidIncrement(currentBid);
}

export function splitProceeds(amount: number, ownership: string, commissionRate: number) {
  if (ownership === "HOUSE") {
    return {
      commissionRate: 1,
      platformRevenue: amount,
      sellerPayout: 0,
    };
  }
  const bps = Math.round(commissionRate * 10_000);
  const platformRevenue = Math.round((amount * bps) / 10_000);
  return {
    commissionRate: bps / 10_000,
    platformRevenue,
    sellerPayout: amount - platformRevenue,
  };
}
