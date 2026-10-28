"use client";

import { useState } from "react";

export function RuleCard({ title, text }: { title: string; text: string }) {
  const [on, setOn] = useState(false);

  return (
    <article
      className={`rule-card ${on ? "is-on" : ""}`}
      onPointerEnter={() => setOn(true)}
      onPointerLeave={() => setOn(false)}
      onFocus={() => setOn(true)}
      onBlur={() => setOn(false)}
      tabIndex={0}
    >
      <svg className="rule-card-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path className="rule-card-base" d="M10 1.5 H90 L98.5 10 V90 L90 98.5 H10 L1.5 90 V10 Z" />
        <path className="rule-card-stroke" d="M10 1.5 H90 L98.5 10 V90 L90 98.5 H10 L1.5 90 V10 Z" pathLength="100" />
      </svg>
      <div className="rule-card-body">
        <h2 className="serif text-2xl">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
      </div>
    </article>
  );
}
