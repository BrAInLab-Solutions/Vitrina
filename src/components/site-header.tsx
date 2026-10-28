"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { BrandLogo, Sparks } from "@/components/brand";

type HeaderUser = {
  name: string;
  role: string;
  isSeller: boolean;
} | null;

type Category = { slug: string; name: string };

const auctions = [
  { href: "/aukcije", label: "Sve" },
  { href: "/aukcije?sort=kraj", label: "Uskoro kraj" },
  { href: "/aukcije?tip=nasi", label: "Naši" },
  { href: "/aukcije?tip=eksterni", label: "Kreatori" },
];

export function SiteHeader({
  user,
  unread,
  categories,
}: {
  user: HeaderUser;
  unread: number;
  categories: Category[];
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const router = useRouter();

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get("q") || "").trim();
    router.push(q ? `/aukcije?q=${encodeURIComponent(q)}` : "/aukcije");
    setMenu(false);
    setOpen(null);
  }

  const sheet = menu || open !== null;

  function close() {
    setMenu(false);
    setOpen(null);
  }

  return (
    <header className="site-bar sticky top-0 z-40" onMouseLeave={() => setOpen(null)}>
      <Sparks>
        <div className="wrap-wide flex min-h-[4.25rem] items-center justify-between gap-4 py-2">
          <BrandLogo onClick={close} />

          <nav className="hidden items-center gap-1 lg:flex">
            <button type="button" className={`nav-link px-3 py-2 ${open === "aukcije" ? "is-on" : ""}`} aria-expanded={open === "aukcije"} onMouseEnter={() => setOpen("aukcije")} onClick={() => setOpen(open === "aukcije" ? null : "aukcije")}>
              Aukcije
            </button>
            <button type="button" className={`nav-link px-3 py-2 ${open === "kategorije" ? "is-on" : ""}`} aria-expanded={open === "kategorije"} onMouseEnter={() => setOpen("kategorije")} onClick={() => setOpen(open === "kategorije" ? null : "kategorije")}>
              Kategorije
            </button>
            <Link href="/kako-funkcionise" className="nav-link px-3" onClick={close}>
              Kako
            </Link>
            <Link href="/prodaj" className="nav-link px-3" onClick={close}>
              Prodaj
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <form onSubmit={onSearch} className="header-search hidden md:flex">
              <label className="sr-only" htmlFor="header-search">
                Pretraži
              </label>
              <input id="header-search" name="q" placeholder="Pretraži" className="header-search-input" />
            </form>
            <ThemeToggle />
            {user ? (
              <Link href={user.role === "ADMIN" ? "/admin" : "/nalog"} className="btn btn-line btn-sm">
                {user.role === "ADMIN" ? "Admin" : "Nalog"}
                {unread > 0 ? ` ${unread}` : ""}
              </Link>
            ) : (
              <Link href="/prijava" className="btn btn-line btn-sm">
                Prijava
              </Link>
            )}
            <button className="btn btn-ghost btn-sm lg:hidden" aria-expanded={menu} aria-label="Meni" onClick={() => setMenu((value) => !value)}>
              Meni
            </button>
          </div>
        </div>
      </Sparks>

      {sheet && (
        <div className="nav-sheet">
          <div className="wrap-wide nav-sheet-grid">
            <form onSubmit={onSearch} className="header-search nav-sheet-search md:hidden">
              <label className="sr-only" htmlFor="header-search-mobile">
                Pretraži
              </label>
              <input id="header-search-mobile" name="q" placeholder="Pretraži" className="header-search-input w-full" />
            </form>
            <section>
              <p className="kicker">Aukcije</p>
              <div className="nav-sheet-links">
                {auctions.map((item) => (
                  <Link key={item.href} href={item.href} onClick={close}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </section>
            <section>
              <p className="kicker">Kategorije</p>
              <div className="nav-sheet-links nav-sheet-links--wide">
                {categories.map((category) => (
                  <Link key={category.slug} href={`/aukcije?kategorija=${category.slug}`} onClick={close}>
                    {category.name}
                  </Link>
                ))}
              </div>
            </section>
            <div className="nav-sheet-extra lg:hidden">
              <Link href="/kako-funkcionise" onClick={close}>
                Kako
              </Link>
              <Link href="/prodaj" onClick={close}>
                Prodaj
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function ThemeToggle() {
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vitrina-theme");
      if (!saved || (saved !== "light" && saved !== "dark")) return;
      if (!document.cookie.split("; ").some((row) => row.startsWith("vitrina-theme="))) {
        document.cookie = `vitrina-theme=${saved}; path=/; max-age=31536000; samesite=lax`;
      }
      document.documentElement.classList.toggle("dark", saved !== "light");
    } catch {
      /* ignore */
    }
  }, []);

  function toggle() {
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";
    root.classList.toggle("dark", next === "dark");
    localStorage.setItem("vitrina-theme", next);
    document.cookie = `vitrina-theme=${next}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <button className="btn btn-ghost btn-sm" onClick={toggle} aria-label="Promeni temu">
      ◐
    </button>
  );
}

export function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }
  return (
    <button className="btn btn-ghost btn-sm" onClick={logout}>
      Odjava
    </button>
  );
}
