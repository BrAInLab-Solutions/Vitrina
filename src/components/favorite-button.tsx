"use client";

import { useState } from "react";

export function FavoriteButton({ slug, initial }: { slug: string; initial: boolean }) {
  const [saved, setSaved] = useState(initial);
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    const response = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    setPending(false);
    if (response.status === 401) {
      window.location.href = `/prijava?next=/aukcije/${slug}`;
      return;
    }
    const data = await response.json();
    if (response.ok) setSaved(Boolean(data.saved));
  }

  return (
    <button className="btn btn-ghost" onClick={toggle} disabled={pending}>
      {saved ? "U omiljenima" : "Sačuvaj"}
    </button>
  );
}
