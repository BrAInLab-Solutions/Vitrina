import Link from "next/link";
import { notFound } from "next/navigation";
import { LiveDemo } from "@/components/live-demo";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await prisma.listing.findUnique({ where: { slug } });
  if (!listing || listing.status === "REMOVED") notFound();
  const user = await getCurrentUser();
  const isPublic = ["ACTIVE", "ENDED_SOLD", "ENDED_UNSOLD"].includes(listing.status);
  if (!isPublic && user?.id !== listing.sellerId && user?.role !== "ADMIN") notFound();
  const external = listing.demoUrl.startsWith("https://");

  return (
    <div>
      <div className="wrap flex flex-wrap items-center justify-between gap-3 py-4">
        <div>
          <p className="kicker">Demo pregled</p>
          <h1 className="serif text-3xl">{listing.title}</h1>
        </div>
        <div className="flex gap-2">
          <Link className="btn btn-ghost btn-sm" href={isPublic ? `/aukcije/${listing.slug}` : `/pregled/${listing.id}`}>
            Nazad na oglas
          </Link>
          {external && (
            <a className="btn btn-line btn-sm" href={listing.demoUrl} target="_blank" rel="noopener noreferrer">
              Spoljašnji demo
            </a>
          )}
        </div>
      </div>
      {listing.isDemo && (
        <p className="wrap pb-4 text-sm text-muted">Ovo je interaktivni testni prikaz. Radnje u njemu ne šalju podatke i ne predstavljaju stvaran sajt klijenta.</p>
      )}
      <LiveDemo previewKey={listing.previewKey} interactive />
    </div>
  );
}
