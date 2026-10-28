"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { OrbitItem } from "@/lib/orbit";

export type { OrbitItem };

export function HeroOrbit({ items }: { items: OrbitItem[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [flash, setFlash] = useState(false);
  const count = Math.max(items.length, 1);
  const selected = items[active] ?? items[0];

  useEffect(() => {
    if (paused || count < 2) return;
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % count);
      setFlash(true);
      window.setTimeout(() => setFlash(false), 480);
    }, 3800);
    return () => window.clearInterval(timer);
  }, [paused, count]);

  function pick(index: number) {
    setPaused(true);
    setActive(index);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 700);
  }

  if (!selected) return null;

  return (
    <div
      className={`orbit ${paused ? "is-paused" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={`orbit-lamp ${flash ? "is-on" : ""}`} aria-hidden="true" />
      <div className="orbit-halo" aria-hidden="true" />

      <div className="orbit-wheel">
        <div className="orbit-track" aria-hidden="true" />
        {items.map((item, index) => {
          const angle = (360 / count) * index;
          const isActive = index === active;
          return (
            <button
              key={item.id}
              type="button"
              className={`orbit-node ${isActive ? "is-active" : ""}`}
              style={{ ["--a" as string]: `${angle}deg` }}
              onClick={() => pick(index)}
              aria-pressed={isActive}
              aria-label={item.title}
            >
              <span className="orbit-node-face">
                <span className="orbit-node-mark">{item.mark}</span>
                <span className="orbit-node-label">{item.title}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="orbit-core" aria-hidden="true">
        <span>V</span>
      </div>

      <article className={`orbit-card ${flash ? "is-lit" : ""}`}>
        <p className="orbit-chip">{selected.kind === "auction" ? "Aukcija" : "Usluga"}</p>
        <h3 className="serif mt-2 text-[1.7rem] leading-none text-gold">{selected.title}</h3>
        {selected.price && <p className="mt-2 num text-gold">{selected.price}</p>}
        <div className="orbit-progress" aria-hidden="true">
          {items.map((item, index) => (
            <i key={item.id} className={index === active ? "is-on" : ""} />
          ))}
        </div>
        <Link href={selected.href} className="btn btn-gold btn-sm mt-4">
          {selected.kind === "auction" ? "Otvori" : "Dalje"}
        </Link>
      </article>
    </div>
  );
}
