import { prisma } from "@/lib/db";
import { bidderAlias } from "@/lib/labels";
import { formatEuro, minimumBid, splitProceeds } from "@/lib/money";
import { notify } from "@/lib/notify";
import { getSettings } from "@/lib/settings";

const listingInclude = {
  category: true,
  seller: { select: { id: true, name: true, bio: true, sellerVerified: true, isSeller: true } },
  images: { orderBy: { sort: "asc" as const } },
  bids: { orderBy: { createdAt: "desc" as const }, include: { user: { select: { id: true, name: true } } } },
};

export type ListingRecord = Awaited<ReturnType<typeof loadListing>>;

export async function loadListing(slug: string) {
  return prisma.listing.findUnique({ where: { slug }, include: listingInclude });
}

export function parseJsonList(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function toCard(listing: {
  slug: string;
  title: string;
  summary: string;
  ownership: string;
  status: string;
  startPrice: number;
  currentBid: number;
  leadingPrice: number;
  bidCount: number;
  endsAt: Date | null;
  previewKey: string;
  coverImageUrl: string;
  isDemo: boolean;
  category: { name: string; slug: string };
  seller: { name: string; sellerVerified: boolean };
}) {
  return {
    slug: listing.slug,
    title: listing.title,
    summary: listing.summary,
    category: listing.category.name,
    categorySlug: listing.category.slug,
    ownership: listing.ownership,
    status: listing.status,
    startPrice: listing.startPrice,
    currentBid: listing.currentBid,
    leadingPrice: listing.leadingPrice,
    bidCount: listing.bidCount,
    endsAt: listing.endsAt ? listing.endsAt.toISOString() : null,
    previewKey: listing.previewKey,
    coverImageUrl: listing.coverImageUrl,
    isDemo: listing.isDemo,
    sellerName: listing.seller.name,
    sellerVerified: listing.seller.sellerVerified,
  };
}

export function toDetail(listing: NonNullable<ListingRecord>, viewerId?: string | null) {
  const card = toCard(listing);
  return {
    ...card,
    description: listing.description,
    demoUrl: listing.demoUrl,
    features: parseJsonList(listing.features),
    technologies: parseJsonList(listing.technologies),
    customization: listing.customization,
    deliverables: listing.deliverables,
    transferTerms: listing.transferTerms,
    includesDomain: listing.includesDomain,
    includesHosting: listing.includesHosting,
    includesCode: listing.includesCode,
    extensions: listing.extensions,
    seller: {
      name: listing.ownership === "HOUSE" ? "Vitrina Studio" : listing.seller.name,
      bio: listing.ownership === "HOUSE"
        ? "Naša firma izrađuje originalne sajtove i zadržava punu prodajnu cenu."
        : listing.seller.bio,
      verified: listing.ownership === "HOUSE" ? true : listing.seller.sellerVerified,
    },
    images: listing.images.map((image) => ({ label: image.label, url: image.url })),
    nextBid: minimumBid(listing.startPrice, listing.currentBid, listing.bidCount),
    bids: listing.bids.map((bid) => ({
      id: bid.id,
      amount: bid.amount,
      createdAt: bid.createdAt.toISOString(),
      alias: bid.userId === viewerId ? "Vi" : bidderAlias(bid.userId, bid.user.name),
      yours: bid.userId === viewerId,
    })),
    viewerIsSeller: viewerId === listing.sellerId,
  };
}

export async function settleExpiredAuctions() {
  const now = new Date();
  const due = await prisma.listing.findMany({
    where: { status: "ACTIVE", endsAt: { lte: now } },
    include: { bids: { orderBy: { amount: "desc" }, take: 1 } },
  });

  for (const listing of due) {
    await settleOne(listing.id);
  }

  const soon = new Date(now.getTime() + 60 * 60 * 1000);
  const ending = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      endingSoonNotified: false,
      endsAt: { gt: now, lte: soon },
    },
    include: {
      bids: { select: { userId: true } },
      favorites: { select: { userId: true } },
    },
  });

  for (const listing of ending) {
    const claimed = await prisma.listing.updateMany({
      where: { id: listing.id, endingSoonNotified: false, status: "ACTIVE" },
      data: { endingSoonNotified: true },
    });
    if (claimed.count !== 1) continue;
    const recipients = new Set<string>([listing.sellerId, ...listing.bids.map((bid) => bid.userId), ...listing.favorites.map((fav) => fav.userId)]);
    for (const userId of recipients) {
      await notify(userId, {
        type: "ENDING_SOON",
        title: "Aukcija se uskoro završava",
        body: `Aukcija za „${listing.title}“ završava se u narednih sat vremena.`,
        href: `/aukcije/${listing.slug}`,
      });
    }
  }
}

async function settleOne(id: string) {
  const settings = await getSettings();
  const now = new Date();
  const result = await prisma.$transaction(async (tx) => {
    const fresh = await tx.listing.findUnique({
      where: { id },
      include: { bids: { orderBy: { amount: "desc" }, take: 1 } },
    });
    if (!fresh || fresh.status !== "ACTIVE" || !fresh.endsAt || fresh.endsAt > now) return null;

    const top = fresh.bids[0];
    if (!top) {
      const updated = await tx.listing.updateMany({
        where: { id: fresh.id, status: "ACTIVE" },
        data: { status: "ENDED_UNSOLD" },
      });
      if (updated.count !== 1) return null;
      return { kind: "unsold" as const, listing: fresh };
    }

    const split = splitProceeds(top.amount, fresh.ownership, settings.commissionRate);
    const locked = await tx.listing.updateMany({
      where: { id: fresh.id, status: "ACTIVE" },
      data: {
        status: "ENDED_SOLD",
        winnerId: top.userId,
        currentBid: top.amount,
        leadingPrice: top.amount,
      },
    });
    if (locked.count !== 1) return null;

    const transaction = await tx.transaction.create({
      data: {
        listingId: fresh.id,
        buyerId: top.userId,
        sellerId: fresh.sellerId,
        finalPrice: top.amount,
        commissionRate: split.commissionRate,
        platformRevenue: split.platformRevenue,
        sellerPayout: split.sellerPayout,
        ownership: fresh.ownership,
        paymentStatus: "AWAITING",
        handoverStatus: "PENDING",
        payoutStatus: fresh.ownership === "HOUSE" ? "NOT_APPLICABLE" : "PENDING",
        paymentRef: "PENDING",
        isDemo: fresh.isDemo,
      },
    });
    const paymentRef = `VIT-${transaction.id.slice(-6).toUpperCase()}`;
    await tx.transaction.update({ where: { id: transaction.id }, data: { paymentRef } });
    return {
      kind: "sold" as const,
      listing: fresh,
      buyerId: top.userId,
      amount: top.amount,
      split,
      transactionId: transaction.id,
      paymentRef,
    };
  });

  if (!result) return;
  if (result.kind === "unsold") {
    await notify(result.listing.sellerId, {
      type: "AUCTION_ENDED",
      title: "Aukcija je završena bez ponuda",
      body: `„${result.listing.title}“ nije prodat. Oglas ostaje neprodat.`,
      href: `/aukcije/${result.listing.slug}`,
    });
    return;
  }

  await notify(result.buyerId, {
    type: "WON",
    title: "Osvojili ste aukciju",
    body: `„${result.listing.title}“ je vaš po ceni ${formatEuro(result.amount)}. Slede instrukcije za plaćanje. Referenca: ${result.paymentRef}.`,
    href: `/placanje/${result.transactionId}`,
  });
  await notify(result.listing.sellerId, {
    type: "AUCTION_ENDED",
    title: "Aukcija je završena",
    body:
      result.listing.ownership === "HOUSE"
        ? `„${result.listing.title}“ je prodat za ${formatEuro(result.amount)}. Cela cena pripada firmi.`
        : `„${result.listing.title}“ je prodat za ${formatEuro(result.amount)}. Vaš neto iznos je ${formatEuro(result.split.sellerPayout)}, posle provizije od ${formatEuro(result.split.platformRevenue)}.`,
    href: "/nalog/zarada",
  });
}

export type SearchInput = {
  q?: string;
  category?: string;
  ownership?: string;
  status?: string;
  min?: number;
  max?: number;
  ending?: string;
  sort?: string;
  page?: number;
};

export async function searchAuctions(input: SearchInput) {
  const pageSize = 12;
  const page = Math.max(1, input.page ?? 1);
  const now = new Date();
  const where: Record<string, unknown> = {};

  if (input.q) {
    where.OR = [
      { title: { contains: input.q } },
      { summary: { contains: input.q } },
    ];
  }
  if (input.category) where.category = { slug: input.category };
  if (input.ownership === "HOUSE" || input.ownership === "EXTERNAL") where.ownership = input.ownership;

  const status = input.status || "aktivne";
  if (status === "aktivne") where.status = "ACTIVE";
  else if (status === "prodate") where.status = "ENDED_SOLD";
  else if (status === "neprodate") where.status = "ENDED_UNSOLD";
  else if (status === "zavrsene") where.status = { in: ["ENDED_SOLD", "ENDED_UNSOLD"] };
  else where.status = { in: ["ACTIVE", "ENDED_SOLD", "ENDED_UNSOLD"] };

  if (input.min) where.leadingPrice = { ...(where.leadingPrice as object), gte: input.min * 100 };
  if (input.max) where.leadingPrice = { ...(where.leadingPrice as object), lte: input.max * 100 };

  if (input.ending && input.ending !== "svi") {
    const hours = input.ending === "24h" ? 24 : input.ending === "72h" ? 72 : input.ending === "7d" ? 168 : 0;
    if (hours) {
      where.status = "ACTIVE";
      where.endsAt = { gte: now, lte: new Date(now.getTime() + hours * 60 * 60 * 1000) };
    }
  }

  const sort = input.sort || "kraj";
  const orderBy =
    sort === "popularno"
      ? [{ bidCount: "desc" as const }, { endsAt: "asc" as const }]
      : sort === "novo"
        ? [{ createdAt: "desc" as const }]
        : sort === "cena-rast"
          ? [{ leadingPrice: "asc" as const }]
          : sort === "cena-pad"
            ? [{ leadingPrice: "desc" as const }]
            : [{ endsAt: "asc" as const }];

  const [total, rows, categories] = await Promise.all([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      include: { category: true, seller: { select: { name: true, sellerVerified: true } } },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { listings: { where: { status: "ACTIVE" } } } } } }),
  ]);

  return {
    items: rows.map(toCard),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / pageSize)),
    categories: categories.map((category) => ({
      slug: category.slug,
      name: category.name,
      blurb: category.blurb,
      count: category._count.listings,
    })),
  };
}

export async function homeRails() {
  const include = { category: true, seller: { select: { name: true, sellerVerified: true } } };
  const active = { status: "ACTIVE" as const };
  const [ending, popular, newest, house, external, categories] = await Promise.all([
    prisma.listing.findMany({ where: active, include, orderBy: { endsAt: "asc" }, take: 12 }),
    prisma.listing.findMany({ where: active, include, orderBy: [{ bidCount: "desc" }, { endsAt: "asc" }], take: 12 }),
    prisma.listing.findMany({ where: active, include, orderBy: { createdAt: "desc" }, take: 12 }),
    prisma.listing.findMany({ where: { ...active, ownership: "HOUSE" }, include, orderBy: { endsAt: "asc" }, take: 12 }),
    prisma.listing.findMany({ where: { ...active, ownership: "EXTERNAL" }, include, orderBy: { bidCount: "desc" }, take: 12 }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { listings: { where: active } } } },
    }),
  ]);

  return {
    ending: ending.map(toCard),
    popular: popular.map(toCard),
    newest: newest.map(toCard),
    house: house.map(toCard),
    external: external.map(toCard),
    categories: categories.map((category) => ({
      slug: category.slug,
      name: category.name,
      blurb: category.blurb,
      count: category._count.listings,
    })),
  };
}
