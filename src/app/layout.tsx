import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { Cormorant_Garamond, Great_Vibes, Outfit } from "next/font/google";
import { ClickGlow } from "@/components/click-glow";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import "./globals.css";

const antique = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-antique",
  display: "swap",
});

const script = Great_Vibes({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-great-vibes",
  display: "swap",
});

const sans = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vitrina — aukcije web sajtova",
    template: "%s · Vitrina",
  },
  description: "Dizajn koji osvaja. Vrednost koja raste. Otkrij originalne web projekte, licitiraj i osvoji dizajn koji želiš.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const jar = await cookies();
  const theme = jar.get("vitrina-theme")?.value;
  const dark = theme === "dark";

  const user = await getCurrentUser();
  const [unread, categories] = await Promise.all([
    user ? prisma.notification.count({ where: { userId: user.id, read: false } }) : Promise.resolve(0),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true } }),
  ]);

  return (
    <html
      lang="sr"
      className={`${dark ? "dark" : ""} ${antique.variable} ${script.variable} ${sans.variable}`.trim()}
      suppressHydrationWarning
    >
      <body>
        <ClickGlow />
        <SiteHeader
          user={user ? { name: user.name, role: user.role, isSeller: user.isSeller } : null}
          unread={unread}
          categories={categories}
        />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
