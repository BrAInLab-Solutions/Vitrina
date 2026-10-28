"use client";

import { useState } from "react";
import { PreviewFrame } from "@/components/live-demo";

export function Gallery({
  previewKey,
  title,
  images,
}: {
  previewKey: string;
  title: string;
  images: { label: string; url: string }[];
}) {
  const screens = [
    { id: "home" as const, label: images[0]?.label || "Naslovna" },
    { id: "inner" as const, label: images[1]?.label || "Unutrašnja strana" },
    { id: "mobile" as const, label: images[2]?.label || "Mobilni prikaz" },
  ];
  const [screen, setScreen] = useState<(typeof screens)[number]["id"]>("home");
  const external = images.find((image) => image.url)?.url;

  return (
    <div>
      <div className="overflow-hidden rounded-[1.8rem] border border-line bg-black">
        {external && screen === "home" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={external} alt={title} className="aspect-[16/10] w-full object-cover" referrerPolicy="no-referrer" />
        ) : screen === "mobile" ? (
          <div className="grid place-items-center bg-[var(--bg)] py-8">
            <div className="w-[min(280px,80%)] rounded-[2rem] border border-line bg-black p-2 shadow-2xl">
              <PreviewFrame previewKey={previewKey} screen="mobile" />
            </div>
          </div>
        ) : (
          <PreviewFrame previewKey={previewKey} screen={screen} />
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {screens.map((item) => (
          <button key={item.id} className={`btn btn-sm ${screen === item.id ? "btn-gold" : "btn-ghost"}`} onClick={() => setScreen(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
