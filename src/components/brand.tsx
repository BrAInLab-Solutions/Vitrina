import Link from "next/link";
import type { ReactNode } from "react";

/** Closed treasure chest — modern geometric mark. */
export function ChestMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={`chest-mark ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id="chest-shine" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <rect x="9" y="20" width="30" height="18" rx="3.5" fill="url(#chest-shine)" opacity="0.16" />
      <path
        d="M12 21.5V17c0-2.4 1.5-4.5 3.7-5.3L24 9l8.3 2.7c2.2.8 3.7 2.9 3.7 5.3v4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M11 21.5h26v15.5a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V21.5z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M11 27.5h26" stroke="currentColor" strokeWidth="1.5" />
      <rect x="20.5" y="24.8" width="7" height="5.4" rx="1.1" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="27.5" r="0.9" fill="currentColor" />
      <path d="M15 21.5h18" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
    </svg>
  );
}

export function BrandLogo({
  href = "/",
  size = "md",
  onClick,
}: {
  href?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}) {
  const mark = size === "lg" ? "h-11 w-11" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  return (
    <Link href={href} className={`brand-logo brand-logo--${size}`} onClick={onClick} aria-label="Vitrina">
      <ChestMark className={mark} />
      <span className="brand-word" aria-hidden="true">
        <span className="brand-word-main">Vitrina</span>
        <span className="brand-word-flourish" />
      </span>
    </Link>
  );
}

export function RevealText({ text, className = "", delay = 80 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={className}>
      {Array.from(text).map((char, index) => (
        <span key={`${char}-${index}`} className="reveal-char" style={{ animationDelay: `${delay + index * 42}ms` }}>
          {char === " " ? "\u00a0" : char}
        </span>
      ))}
    </span>
  );
}

export function Sparks({ children }: { children?: ReactNode }) {
  return (
    <div className="spark-field">
      <i className="spark spark-a" />
      <i className="spark spark-b" />
      <i className="spark spark-c" />
      <i className="spark spark-d" />
      {children}
    </div>
  );
}
