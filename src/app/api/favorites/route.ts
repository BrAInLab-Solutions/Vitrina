import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError, sameOrigin } from "@/lib/http";
import { refreshSurfaces } from "@/lib/listings";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Zahtev nije dozvoljen.", 403);
  const user = await getCurrentUser();
  if (!user) return jsonError("Prijavite se da biste sačuvali sajt.", 401);
  const body = await request.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug : "";
  const listing = await prisma.listing.findUnique({ where: { slug } });
  if (!listing) return jsonError("Sajt nije pronađen.", 404);
  const existing = await prisma.favorite.findUnique({ where: { userId_listingId: { userId: user.id, listingId: listing.id } } });
  if (existing) {
    await prisma.favorite.delete({ where: { userId_listingId: { userId: user.id, listingId: listing.id } } });
    refreshSurfaces(slug);
    return NextResponse.json({ saved: false });
  }
  await prisma.favorite.create({ data: { userId: user.id, listingId: listing.id } });
  refreshSurfaces(slug);
  return NextResponse.json({ saved: true });
}
