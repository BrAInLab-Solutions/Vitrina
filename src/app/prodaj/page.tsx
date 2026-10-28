import type { Metadata } from "next";
import { BecomeSeller } from "@/components/auth-form";
import { Wizard } from "@/components/wizard";
import { getCurrentUser } from "@/lib/auth";
import { parseJsonList } from "@/lib/auctions";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Prodaj sajt" };

export default async function SellPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const params = await searchParams;
  const existing = params.id
    ? await prisma.listing.findUnique({ where: { id: params.id }, include: { category: true } })
    : null;
  const canEdit = existing && (existing.sellerId === user.id || user.role === "ADMIN") && ["DRAFT", "REJECTED"].includes(existing.status);

  if (!user.isSeller && user.role !== "ADMIN") {
    return (
      <div className="wrap py-16">
        <p className="kicker">Kreatori</p>
        <h1 className="serif mt-2 text-5xl">Prodaj svoj sajt</h1>
        <p className="mt-4 max-w-xl leading-7 text-muted">
          Nalog može istovremeno da kupuje i da prodaje. Uključite kreatora, pa pošaljite projekat na proveru. Provizija platforme je vidljiva pre objave.
        </p>
        <div className="mt-6"><BecomeSeller /></div>
      </div>
    );
  }

  const initial = canEdit && existing
    ? {
        id: existing.id,
        title: existing.title,
        summary: existing.summary,
        description: existing.description,
        categorySlug: existing.category.slug,
        startPriceEuro: Math.round(existing.startPrice / 100),
        durationHours: existing.durationHours,
        demoUrl: existing.demoUrl,
        coverImageUrl: existing.coverImageUrl,
        features: parseJsonList(existing.features).join("\n"),
        technologies: parseJsonList(existing.technologies).join("\n"),
        customization: existing.customization,
        deliverables: existing.deliverables,
        transferTerms: existing.transferTerms,
        includesDomain: existing.includesDomain,
        includesHosting: existing.includesHosting,
        includesCode: existing.includesCode,
        previewKey: existing.previewKey,
        ownership: existing.ownership === "HOUSE" ? "HOUSE" as const : "EXTERNAL" as const,
      }
    : {
        title: "",
        summary: "",
        description: "",
        categorySlug: categories[0]?.slug ?? "",
        startPriceEuro: 100,
        durationHours: 72,
        demoUrl: "",
        coverImageUrl: "",
        features: "",
        technologies: "",
        customization: "",
        deliverables: "",
        transferTerms: "",
        includesDomain: false,
        includesHosting: false,
        includesCode: true,
        previewKey: "signal",
        ownership: "EXTERNAL" as const,
      };

  return (
    <div className="wrap py-12">
      <p className="kicker">Novi oglas</p>
      <h1 className="serif mt-2 text-5xl">Postavite sajt na aukciju</h1>
      <p className="mt-3 max-w-2xl text-muted">Nacrt možete sačuvati pre slanja. Eksterni projekat postaje javan tek kad ga administrator odobri.</p>
      {existing?.status === "REJECTED" && <p className="mt-4 text-danger">Razlog odbijanja: {existing.rejectionReason}</p>}
      <div className="mt-8">
        <Wizard
          categories={categories.map((category) => ({ slug: category.slug, name: category.name }))}
          durations={[24, 48, 72, 168, 336]}
          isAdmin={user.role === "ADMIN"}
          initial={initial}
        />
      </div>
    </div>
  );
}
