import type { ReactNode } from "react";

/** Shared geometric frame — square case + traveling line. Used across Vitrina. */
export function GeoFrame({
  children,
  className = "",
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div className={`geo-frame ${className}`}>
      <svg className="geo-frame-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <rect className="geo-stroke" x="1.5" y="8" width="97" height="90" pathLength="100" />
        <path className="geo-marks" d="M1.5 12 H4.5 M1.5 8 V11 M95.5 8 H98.5 V11 M98.5 94 V98 H95.5 M4.5 98 H1.5 V94" />
      </svg>
      {label ? <span className="geo-frame-label">{label}</span> : null}
      <div className="geo-frame-body">{children}</div>
    </div>
  );
}
