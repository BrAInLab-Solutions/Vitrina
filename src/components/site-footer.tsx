import Link from "next/link";
import { BrandLogo } from "@/components/brand";

export function SiteFooter() {
  return (
    <footer className="site-bar mt-16 border-t border-line">
      <div className="wrap flex flex-wrap items-center justify-between gap-4 py-5">
        <BrandLogo size="sm" />
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
          <Link href="/aukcije">Aukcije</Link>
          <Link href="/prodaj">Prodaj</Link>
          <Link href="/pravila">Pravila</Link>
        </nav>
      </div>
    </footer>
  );
}
