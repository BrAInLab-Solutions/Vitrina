"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { OrbitItem } from "@/lib/orbit";

function HeroTitle() {
  const text = "Aukcijska kuća";
  return (
    <h1 className="serif hero-title" aria-label={text}>
      <span className="hero-title-gen" aria-hidden="true">
        {Array.from(text).map((char, index) => (
          <span key={index} style={{ animationDelay: `${index * 0.045}s` }}>
            {char === " " ? "\u00a0" : char}
          </span>
        ))}
      </span>
    </h1>
  );
}

function HeroGavel() {
  return (
    <figure className="hero-gavel" aria-hidden="true">
      <img src="/hero-gavel.jpg" alt="" />
    </figure>
  );
}

export function HeroStage({ items }: { items: OrbitItem[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lit, setLit] = useState(false);
  const count = Math.max(items.length, 1);
  const selected = items[active] ?? items[0];

  useEffect(() => {
    if (!selected || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setActive((index) => (index + 1) % count);
    }, 4600);
    return () => window.clearInterval(id);
  }, [count, paused, selected]);

  function pick(index: number) {
    setPaused(true);
    setActive(index);
    setLit(true);
    window.setTimeout(() => setLit(false), 1500);
  }

  if (!selected) {
    return (
      <section className="hero-stage">
        <div className="wrap-wide hero-grid">
          <div className="hero-copy">
            <p className="brand-word brand-word--hero mb-2">
              <span className="brand-word-main">Vitrina</span>
            </p>
            <HeroTitle />
            <p className="hero-sense rise">Još nema sajtova. Postavi prvi.</p>
            <div className="hero-actions mt-7 flex flex-wrap gap-3">
              <Link href="/prodaj" className="btn btn-gold">
                Prodaj sajt
              </Link>
            </div>
          </div>
          <div className="hero-show">
            <HeroGavel />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`hero-stage ${lit ? "is-hot" : ""}`}>
      <div className="wrap-wide hero-grid">
        <div className="hero-copy">
          <p className="brand-word brand-word--hero mb-2">
            <span className="brand-word-main">Vitrina</span>
          </p>
          <HeroTitle />
          <p className="serif hero-line rise" style={{ animationDelay: "0.55s" }}>
            Dizajn koji osvaja.
          </p>
          <div className="hero-actions mt-7 flex flex-wrap gap-3">
            <Link href="/aukcije" className="btn btn-gold">
              Istraži aukcije
            </Link>
            <Link href="/prodaj" className="btn btn-ghost">
              Prodaj svoj sajt
            </Link>
          </div>
        </div>

        <div
          className="hero-show"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <HeroGavel />

        <article className={`stage-card ${lit ? "is-lit" : ""}`}>
            <div className="stage-card-top">
              <p className="orbit-chip">{lit ? "Osvetljen sajt" : "Sajt na aukciji"}</p>
              <span className="stage-card-pos">
                {active + 1}/{count}
              </span>
            </div>
            <h3 className="serif stage-card-title">{selected.title}</h3>
            <p className="stage-card-meta">{selected.meta}</p>
            <div className="stage-bid">
              <div>
                <p className="stage-bid-label">{selected.bidCount > 0 ? "Trenutna ponuda" : "Početna cena"}</p>
                <p className="num stage-bid-price">{selected.price}</p>
              </div>
              <div className="stage-bid-side">
                <p className="num stage-bid-count">{selected.bidCount}</p>
                <p className="stage-bid-label">ponuda</p>
              </div>
            </div>
            <p className="stage-blurb">{selected.blurb}</p>
            <div className="orbit-progress">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={index === active ? "is-on" : ""}
                  aria-label={item.title}
                  aria-pressed={index === active}
                  onClick={() => pick(index)}
                />
              ))}
            </div>
            <div className="stage-card-actions">
              <Link href={selected.href} className="btn btn-gold btn-sm">
                Licitiraj
              </Link>
              <Link href={`/demo/${selected.href.split("/").pop()}`} className="btn btn-ghost btn-sm">
                Pogledaj demo
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
