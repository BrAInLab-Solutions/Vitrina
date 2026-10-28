import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, sameOrigin } from "@/lib/http";
import { refreshSurfaces, submitListing } from "@/lib/listings";
import { notify } from "@/lib/notify";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return jsonError("Zahtev nije dozvoljen.", 403);
  const user = await getCurrentUser();
  if (!user) return jsonError("Prijavite se.", 401);
  const { id } = await context.params;
  try {
    const listing = await submitListing(user, id);
    if (listing.status === "PENDING") {
      const admins = await import("@/lib/db").then((mod) => mod.prisma.user.findMany({ where: { role: "ADMIN" } }));
      for (const admin of admins) {
        await notify(admin.id, {
          type: "LISTING_APPROVED",
          title: "Novi oglas čeka pregled",
          body: `„${listing.title}“ je poslat na odobrenje.`,
          href: "/admin/oglasi",
        });
      }
    }
    refreshSurfaces(listing.slug);
    return NextResponse.json({ ok: true, status: listing.status });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Oglas nije poslat.");
  }
}
