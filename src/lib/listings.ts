import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isSafeHttpUrl } from "@/lib/http";
import { getSettings } from "@/lib/settings";
import { slugify } from "@/lib/slug";
import { listingSchema } from "@/lib/validators";
import { parseJsonList } from "@/lib/auctions";

const previewKeys = new Set(["northline", "brasa", "atelier", "mira", "forma", "luna", "meridian", "kinfolk", "lumen", "clara", "signal"]);
const durations = [24, 48, 72, 168, 336];

export function refreshSurfaces(slug?: string) {
  revalidatePath("/");
  revalidatePath("/aukcije");
  revalidatePath("/nalog");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/aukcije/${slug}`);
}

type Actor = { id: string; role: string; isSeller: boolean };

export async function saveListing(actor: Actor, input: unknown, id?: string) {
  if (!actor.isSeller && actor.role !== "ADMIN") {
    throw new Error("Prvo uključite nalog kreatora.");
  }
  const source = typeof input === "object" && input ? input as Record<string, unknown> : {};
  const features = Array.isArray(source.features) ? source.features.map(String).map((item) => item.trim()).filter(Boolean).slice(0, 12) : [];
  const technologies = Array.isArray(source.technologies) ? source.technologies.map(String).map((item) => item.trim()).filter(Boolean).slice(0, 12) : [];
  const title = String(source.title ?? "").trim();
  if (title.length < 4) throw new Error("Naziv mora imati bar 4 karaktera.");

  const categorySlug = String(source.categorySlug ?? "");
  const category = categorySlug
    ? await prisma.category.findUnique({ where: { slug: categorySlug } })
    : await prisma.category.findFirst({ orderBy: { name: "asc" } });
  if (!category) throw new Error("Izaberite kategoriju.");

  const startPrice = Math.max(0, Math.round(Number(source.startPriceEuro ?? 0) * 100));
  const durationHours = Number(source.durationHours ?? 72);
  const ownership = actor.role === "ADMIN" && source.ownership === "HOUSE" ? "HOUSE" : "EXTERNAL";
  const previewKey = previewKeys.has(String(source.previewKey)) ? String(source.previewKey) : "signal";
  const demoUrl = String(source.demoUrl ?? "").trim();
  const coverImageUrl = String(source.coverImageUrl ?? "").trim();
  if (!isSafeHttpUrl(demoUrl) || !isSafeHttpUrl(coverImageUrl)) {
    throw new Error("Link mora biti prazan, interni demo ili https adresa.");
  }

  const data = {
    title,
    summary: String(source.summary ?? "").trim(),
    description: String(source.description ?? "").trim(),
    categoryId: category.id,
    ownership,
    startPrice,
    leadingPrice: startPrice,
    durationHours: Number.isFinite(durationHours) ? durationHours : 72,
    demoUrl,
    coverImageUrl,
    previewKey,
    features: JSON.stringify(features),
    technologies: JSON.stringify(technologies),
    customization: String(source.customization ?? "").trim(),
    deliverables: String(source.deliverables ?? "").trim(),
    transferTerms: String(source.transferTerms ?? "").trim(),
    includesDomain: Boolean(source.includesDomain),
    includesHosting: Boolean(source.includesHosting),
    includesCode: source.includesCode !== false,
  };

  if (!id) {
    const slug = await uniqueSlug(title);
    return prisma.listing.create({
      data: {
        ...data,
        slug,
        sellerId: actor.id,
        status: "DRAFT",
        images: {
          create: [
            { label: "Naslovna", sort: 0 },
            { label: "Unutrašnja strana", sort: 1 },
            { label: "Mobilni prikaz", sort: 2 },
          ],
        },
      },
    });
  }

  const existing = await prisma.listing.findUnique({ where: { id } });
  if (!existing || (existing.sellerId !== actor.id && actor.role !== "ADMIN")) {
    throw new Error("Oglas nije pronađen.");
  }
  if (!["DRAFT", "REJECTED"].includes(existing.status)) {
    throw new Error("Objavljen oglas ne može da se menja na ovaj način.");
  }
  return prisma.listing.update({
    where: { id },
    data: { ...data, leadingPrice: existing.bidCount > 0 ? existing.leadingPrice : startPrice, rejectionReason: "" },
  });
}

export async function submitListing(actor: Actor, id: string) {
  const listing = await prisma.listing.findUnique({ where: { id }, include: { category: true } });
  if (!listing || (listing.sellerId !== actor.id && actor.role !== "ADMIN")) throw new Error("Oglas nije pronađen.");
  if (!["DRAFT", "REJECTED"].includes(listing.status)) throw new Error("Ovaj oglas ne čeka slanje.");

  const parsed = listingSchema.safeParse({
    title: listing.title,
    summary: listing.summary,
    description: listing.description,
    categorySlug: listing.category.slug,
    startPriceEuro: Math.round(listing.startPrice / 100),
    durationHours: listing.durationHours,
    demoUrl: listing.demoUrl,
    coverImageUrl: listing.coverImageUrl,
    features: parseJsonList(listing.features),
    technologies: parseJsonList(listing.technologies),
    customization: listing.customization,
    deliverables: listing.deliverables,
    transferTerms: listing.transferTerms,
    includesDomain: listing.includesDomain,
    includesHosting: listing.includesHosting,
    includesCode: listing.includesCode,
    previewKey: listing.previewKey,
    ownership: listing.ownership,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Oglas nije kompletan.");
  if (!isSafeHttpUrl(listing.demoUrl) || !isSafeHttpUrl(listing.coverImageUrl)) {
    throw new Error("Proverite demo link i adresu slike.");
  }
  const settings = await getSettings();
  if (!durations.includes(listing.durationHours) || listing.durationHours < settings.minDurationHours || listing.durationHours > settings.maxDurationHours) {
    throw new Error("Trajanje aukcije nije u dozvoljenom opsegu.");
  }

  const publishNow = actor.role === "ADMIN" && listing.ownership === "HOUSE";
  const now = new Date();
  return prisma.listing.update({
    where: { id },
    data: publishNow
      ? { status: "ACTIVE", startsAt: now, endsAt: new Date(now.getTime() + listing.durationHours * 3600 * 1000), rejectionReason: "" }
      : { status: "PENDING", rejectionReason: "" },
  });
}

async function uniqueSlug(title: string) {
  const base = slugify(title);
  for (let i = 0; i < 5; i += 1) {
    const slug = i === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const existing = await prisma.listing.findUnique({ where: { slug } });
    if (!existing) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}
