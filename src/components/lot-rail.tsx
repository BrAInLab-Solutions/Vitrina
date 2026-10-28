import type { ReactNode } from "react";
import { GeoFrame } from "@/components/geo-frame";

/** Connected auction strip — one glass case, sites on a shared thread. */
export function LotRail({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <GeoFrame className={`lot-rail ${className}`} label="Sajtovi na aukciji">
      <div className="lot-thread" aria-hidden="true">
        <span className="lot-thread-line" />
        <span className="lot-thread-pulse" />
      </div>
      <div className="lot-stack">{children}</div>
    </GeoFrame>
  );
}
