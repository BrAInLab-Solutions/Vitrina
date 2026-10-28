"use client";

import { useEffect } from "react";

export function ClickGlow() {
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest("a,button,.lot-row,.stage-node,.stage-nudge,.orbit-node,.drop-link,.btn");
      if (!interactive) return;

      const host = interactive as HTMLElement;
      host.classList.add("glow-hit");
      window.setTimeout(() => host.classList.remove("glow-hit"), 700);

      const focus = host.closest(".lot-row, .stage-node, .stage-card") as HTMLElement | null;
      if (focus) {
        focus.classList.add("is-lit");
        window.setTimeout(() => {
          if (!focus.matches(":hover") && !focus.contains(document.activeElement)) {
            focus.classList.remove("is-lit");
          }
        }, 1400);
      }

      const burst = document.createElement("span");
      burst.className = "glow-burst";
      burst.style.left = `${event.clientX}px`;
      burst.style.top = `${event.clientY}px`;
      document.body.appendChild(burst);
      window.setTimeout(() => burst.remove(), 700);
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return null;
}
