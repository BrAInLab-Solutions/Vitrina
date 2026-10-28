import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Kako funkcioniše" };

export default function HowPage() {
  return (
    <div className="wrap py-14">
      <h1 className="serif text-5xl">Tri koraka</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["01", "Pronađi", "Pogledaj demo i dizajn."],
          ["02", "Licitiraj", "Daj veću ponudu dok traje aukcija."],
          ["03", "Preuzmi", "Posle uplate stiže kod i prava."],
        ].map(([n, title, text]) => (
          <article key={n} className="panel">
            <p className="serif text-4xl text-gold">{n}</p>
            <h2 className="serif mt-2 text-3xl">{title}</h2>
            <p className="mt-2 text-muted">{text}</p>
          </article>
        ))}
      </div>
      <Link href="/aukcije" className="btn btn-gold mt-8">
        Istraži aukcije
      </Link>
    </div>
  );
}
