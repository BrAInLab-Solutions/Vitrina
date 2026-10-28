import { CategoryForm, RenameCategory, SettingsForm } from "@/components/actions";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export default async function SettingsPage() {
  const [settings, categories] = await Promise.all([
    getSettings(),
    prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { listings: true } } } }),
  ]);
  return (
    <div className="grid gap-6">
      <section>
        <h1 className="serif text-4xl">Podešavanja</h1>
        <p className="mt-2 text-sm text-muted">Podrazumevana provizija je 10%. Izmena važi za buduće prodaje, ne za već snimljene.</p>
        <div className="panel mt-4">
          <SettingsForm
            commissionPercent={Math.round(settings.commissionRate * 1000) / 10}
            antiSnipeWindowMinutes={settings.antiSnipeWindowMinutes}
            antiSnipeExtendMinutes={settings.antiSnipeExtendMinutes}
            maxExtensions={settings.maxExtensions}
          />
        </div>
      </section>
      <section className="panel">
        <h2 className="serif text-3xl">Kategorije</h2>
        <div className="mt-4 grid gap-3">
          {categories.map((category) => (
            <div key={category.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3">
              <div>
                <RenameCategory id={category.id} name={category.name} />
                <p className="mt-1 text-xs text-muted">{category.slug} · {category._count.listings} oglasa</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6"><CategoryForm /></div>
      </section>
    </div>
  );
}
