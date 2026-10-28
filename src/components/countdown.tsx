"use client";

import { useEffect, useState } from "react";

export function Countdown({ endsAt }: { endsAt: string }) {
  const [label, setLabel] = useState("…");

  useEffect(() => {
    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setLabel("Zatvara se");
        return;
      }
      const total = Math.floor(diff / 1000);
      const days = Math.floor(total / 86400);
      const hours = Math.floor((total % 86400) / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      const seconds = total % 60;
      setLabel(days > 0 ? `${days}d ${hours}č ${minutes}m` : `${hours}č ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  return (
    <time dateTime={endsAt} className="num">
      {label}
    </time>
  );
}
