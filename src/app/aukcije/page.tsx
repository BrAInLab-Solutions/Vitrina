import type { Metadata } from "next";
import Link from "next/link";
import { AuctionCard } from "@/components/auction-card";
import { FilterMenu } from "@/components/filter-menu";
import { searchAuctions, settleExpiredAuctions } from "@/lib/auctions";

export const metadata: Metadata = { title: "Aukcije" };

type Raw = Record<string, string | string[] | undefined>;

function pick(raw: Raw, key: string) {
  const value = raw[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AuctionsPage({ searchParams }: { searchParams: Promise<Raw> }) {
  await settleExpiredAuctions();
  const raw = await searchParams;
  const min = Number(pick(raw, "cenaMin"));
  const max = Number(pick(raw, "cenaMax"));
  const page = Number(pick(raw, "strana") || "1");
  const tip = pick(raw, "tip");
  const data = await searchAuctions({
    q: pick(raw, "q"),
    category: pick(raw, "kategorija"),
    ownership: tip === "nasi" ? "HOUSE" : tip === "eksterni" ? "EXTERNAL" : undefined,
    status: pick(raw, "status") || "aktivne",
    ending: pick(raw, "rok") || "svi",
    sort: pick(raw, "sort") || "kraj",
    min: Number.isFinite(min) && min > 0 ? min : undefined,
    max: Number.isFinite(max) && max > 0 ? max : undefined,
    page: Number.isFinite(page) ? page : 1,
  });

  const query = new URLSearchParams();
  for (const key of ["q", "kategorija", "tip", "status", "rok", "sort", "cenaMin", "cenaMax"]) {
    const value = pick(raw, key);
    if (value) query.set(key, value);
  }

  return (
    <div className="wrap py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="serif text-5xl">Aukcije</h1>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted num">{data.total}</p>
          <FilterMenu
            categories={data.categories}
            values={{
              q: pick(raw, "q"),
              kategorija: pick(raw, "kategorija"),
              tip,
              status: pick(raw, "status"),
              rok: pick(raw, "rok"),
              sort: pick(raw, "sort"),
              cenaMin: pick(raw, "cenaMin"),
              cenaMax: pick(raw, "cenaMax"),
            }}
          />
        </div>
      </div>

      {data.items.length === 0 ? (
        <p className="panel mt-8">Nema sajtova za izabrane filtere.</p>
      ) : (
        <div className="lot-stack mt-8">
          {data.items.map((item, index) => (
            <AuctionCard key={item.slug} item={item} index={index} />
          ))}
        </div>
      )}

      {data.pages > 1 && (
        <div className="mt-8 flex gap-2">
          {Array.from({ length: data.pages }, (_, index) => {
            const next = new URLSearchParams(query);
            next.set("strana", String(index + 1));
            return (
              <Link key={index} href={`/aukcije?${next.toString()}`} className={`btn btn-sm ${data.page === index + 1 ? "btn-line" : "btn-ghost"}`}>
                {index + 1}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
