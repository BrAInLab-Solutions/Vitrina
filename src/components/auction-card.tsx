"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Countdown } from "@/components/countdown";
import { LotRail } from "@/components/lot-rail";
import { formatEuro } from "@/lib/money";

export type CardData = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  ownership: string;
  status: string;
  startPrice: number;
  currentBid: number;
  bidCount: number;
  endsAt: string | null;
  previewKey: string;
  coverImageUrl: string;
  isDemo: boolean;
};

export function AuctionCard({ item, index = 0 }: { item: CardData; index?: number }) {
  const router = useRouter();
  const [lit, setLit] = useState(false);
  const href = `/aukcije/${item.slug}`;
  const price = item.bidCount > 0 ? item.currentBid : item.startPrice;
  const no = String(index + 1).padStart(2, "0");

  function open(event: React.MouseEvent) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    setLit(true);
    window.setTimeout(() => router.push(href), 420);
  }

  return (
    <article
      className={`lot-row ${lit ? "is-lit" : ""}`}
      onPointerEnter={() => setLit(true)}
      onPointerLeave={() => setLit(false)}
    >
      <button type="button" className="lot-hit" onClick={open} aria-label={item.title} />
      <div className="lot-card-top">
        <p className="lot-meta">{item.category}</p>
        <p className="lot-status">{item.status === "ACTIVE" ? "Aktivna" : "Završeno"}</p>
      </div>
      <h3 className="serif lot-title">{item.title}</h3>
      <p className="lot-summary">{item.summary}</p>
      <div className="lot-card-foot">
        <div className="lot-card-price">
          <p className="lot-price-label">{item.bidCount > 0 ? "Trenutna ponuda" : "Početna cena"}</p>
          <strong className="num lot-price">{formatEuro(price)}</strong>
          <p className="text-sm text-muted">
            {item.bidCount} ponuda
            {item.status === "ACTIVE" && item.endsAt ? (
              <>
                {" · "}
                <Countdown endsAt={item.endsAt} />
              </>
            ) : null}
          </p>
        </div>
        <div className="lot-actions">
          <Link href={href} onClick={open} className="btn btn-gold btn-sm">
            Licitiraj
          </Link>
          <Link href={`/demo/${item.slug}`} className="btn btn-ghost btn-sm">
            Demo
          </Link>
        </div>
      </div>
      <span className="sr-only">{no}</span>
    </article>
  );
}

export function Rail({
  kicker,
  title,
  href,
  children,
}: {
  kicker: string;
  title: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="kicker">{kicker}</p>
          <h2 className="serif mt-2 text-4xl">{title}</h2>
        </div>
        {href && (
          <Link href={href} className="text-sm text-gold">
            Sve aukcije
          </Link>
        )}
      </div>
      <LotRail>{children}</LotRail>
    </section>
  );
}
