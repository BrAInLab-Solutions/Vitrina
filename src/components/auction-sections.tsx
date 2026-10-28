"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CardData } from "@/components/auction-card";
import { Countdown } from "@/components/countdown";
import { formatEuro } from "@/lib/money";

/** One list. The chosen auction is shown clearly. The rest stay as names you can open. */
export function ActiveAuctions({ items }: { items: CardData[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lit, setLit] = useState(false);
  const selected = items[index];

  useEffect(() => {
    if (paused || items.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % items.length);
      setLit(true);
      window.setTimeout(() => setLit(false), 700);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused, items.length]);

  if (!selected) return null;

  const price = selected.bidCount > 0 ? selected.currentBid : selected.startPrice;

  return (
    <section className="mt-16" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="serif text-4xl">Aktivne aukcije</h2>
        <Link href="/aukcije" className="text-sm text-gold">
          Sve
        </Link>
      </div>

      <article className={`section-detail ${lit ? "is-lit" : ""}`}>
        <p className="section-detail-meta">{selected.category}</p>
        <h3 className="serif section-detail-title">{selected.title}</h3>
        <div className="section-detail-bid">
          <div>
            <p className="stage-bid-label">{selected.bidCount > 0 ? "Trenutna ponuda" : "Početna cena"}</p>
            <p className="num lot-price">{formatEuro(price)}</p>
          </div>
          <div>
            <p className="num stage-bid-count">{selected.bidCount}</p>
            <p className="stage-bid-label">ponuda</p>
          </div>
          {selected.status === "ACTIVE" && selected.endsAt ? (
            <p className="text-sm text-muted">
              <Countdown endsAt={selected.endsAt} />
            </p>
          ) : null}
        </div>
        <div className="section-detail-actions">
          <Link href={`/aukcije/${selected.slug}`} className="btn btn-gold btn-sm">
            Licitiraj
          </Link>
          <Link href={`/demo/${selected.slug}`} className="btn btn-ghost btn-sm">
            Demo
          </Link>
        </div>
      </article>

      {items.length > 1 && (
        <div className="section-names mt-3">
          {items.map((item, itemIndex) => (
            <button
              key={item.slug}
              type="button"
              className={`section-name ${itemIndex === index ? "is-on" : ""}`}
              onClick={() => {
                setPaused(true);
                setIndex(itemIndex);
                setLit(true);
                window.setTimeout(() => setLit(false), 700);
              }}
            >
              <span className="section-name-title">{item.title}</span>
              <span className="num text-gold">{formatEuro(item.bidCount > 0 ? item.currentBid : item.startPrice)}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
