export const statusLabel: Record<string, string> = {
  DRAFT: "Nacrt",
  PENDING: "Čeka odobrenje",
  REJECTED: "Odbijen",
  ACTIVE: "Aktivna",
  ENDED_SOLD: "Prodato",
  ENDED_UNSOLD: "Nije prodato",
  REMOVED: "Uklonjen",
};

export const ownershipLabel: Record<string, string> = {
  HOUSE: "Naš projekat",
  EXTERNAL: "Eksterni kreator",
};

export const paymentLabel: Record<string, string> = {
  AWAITING: "Čeka uplatu",
  PAID: "Plaćanje potvrđeno",
  FAILED: "Plaćanje neuspešno",
  REFUNDED: "Novac vraćen",
  CANCELLED: "Otkazano",
};

export const handoverLabel: Record<string, string> = {
  PENDING: "Predaja nije počela",
  IN_PROGRESS: "Predaja u toku",
  DELIVERED: "Sajt predat",
  BLOCKED: "Predaja zaustavljena",
};

export const payoutLabel: Record<string, string> = {
  NOT_APPLICABLE: "Nije primenljivo",
  PENDING: "Isplata čeka",
  PROCESSING: "Isplata u obradi",
  PAID: "Isplaćeno kreatoru",
};

export const disputeLabel: Record<string, string> = {
  OPEN: "Otvoren",
  REVIEW: "U pregledu",
  RESOLVED: "Rešen",
  REJECTED: "Odbijen",
};

export const notificationLabel: Record<string, string> = {
  NEW_BID: "Nova ponuda",
  OUTBID: "Ponuda je nadmašena",
  ENDING_SOON: "Aukcija se uskoro završava",
  WON: "Osvojena aukcija",
  AUCTION_ENDED: "Aukcija je završena",
  PAYMENT_CONFIRMED: "Plaćanje potvrđeno",
  PAYMENT_FAILED: "Plaćanje neuspešno",
  LISTING_APPROVED: "Oglas odobren",
  LISTING_REJECTED: "Oglas odbijen",
  HANDOVER_DONE: "Sajt je predat",
  PAYOUT_SENT: "Isplata kreatoru",
  DISPUTE: "Prijava",
};

export function bidderAlias(userId: string, name: string) {
  const initial = name.trim().charAt(0).toUpperCase() || "K";
  let hash = 0;
  for (const char of userId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const code = hash.toString(36).slice(0, 4).toUpperCase().padEnd(4, "X");
  return `${initial}···${code}`;
}
