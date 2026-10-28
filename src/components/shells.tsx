"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/site-header";

const accountLinks = [
  ["/nalog", "Pregled"],
  ["/nalog/ponude", "Moje ponude"],
  ["/nalog/omiljeni", "Omiljeni"],
  ["/nalog/kupovine", "Kupovine"],
  ["/nalog/oglasi", "Oglasi"],
  ["/nalog/zarada", "Zarada"],
  ["/nalog/obavestenja", "Obaveštenja"],
];

const adminLinks = [
  ["/admin", "Pregled"],
  ["/admin/oglasi", "Oglasi"],
  ["/admin/aukcije", "Aukcije"],
  ["/admin/korisnici", "Korisnici"],
  ["/admin/transakcije", "Transakcije"],
  ["/admin/podesavanja", "Podešavanja"],
  ["/admin/sporovi", "Sporovi"],
  ["/admin/revizija", "Revizija"],
];

export function AccountShell({ children }: { children: ReactNode }) {
  return <Shell links={accountLinks} home="/nalog">{children}</Shell>;
}

export function AdminShell({ children }: { children: ReactNode }) {
  return <Shell links={adminLinks} home="/admin">{children}</Shell>;
}

function Shell({ links, home, children }: { links: string[][]; home: string; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="wrap grid gap-8 py-10 lg:grid-cols-[230px_minmax(0,1fr)]">
      <aside className="flex h-fit flex-col gap-1">
        {links.map(([href, label]) => {
          const active = href === home ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`rounded-full px-4 py-2 text-sm ${active ? "bg-[var(--gold-btn)] text-[var(--gold-ink)]" : "text-muted hover:text-ink"}`}>
              {label}
            </Link>
          );
        })}
        <div className="mt-4">
          <LogoutButton />
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
