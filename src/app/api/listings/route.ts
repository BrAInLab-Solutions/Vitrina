import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, sameOrigin } from "@/lib/http";
import { refreshSurfaces, saveListing } from "@/lib/listings";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Zahtev nije dozvoljen.", 403);
  const user = await getCurrentUser();
  if (!user) return jsonError("Prijavite se.", 401);
  try {
    const listing = await saveListing(user, await request.json().catch(() => null));
    refreshSurfaces(listing.slug);
    return NextResponse.json({ id: listing.id, slug: listing.slug });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Nacrt nije sačuvan.");
  }
}
