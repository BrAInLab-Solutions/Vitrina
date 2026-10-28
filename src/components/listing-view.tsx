import Link from "next/link";
import { BidPanel } from "@/components/bid-panel";
import { DemoBanner } from "@/components/demo-banner";
import { FavoriteButton } from "@/components/favorite-button";
import { Gallery } from "@/components/gallery";
import { ownershipLabel, statusLabel } from "@/lib/labels";

type Detail = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  ownership: string;
  status: string;
  startPrice: number;
  currentBid: number;
  bidCount: number;
  endsAt: string | null;
  previewKey: string;
  isDemo: boolean;
  demoUrl: string;
  features: string[];
  technologies: string[];
  customization: string;
  deliverables: string;
  transferTerms: string;
  includesDomain: boolean;
  includesHosting: boolean;
  includesCode: boolean;
  extensions: number;
  nextBid: number;
  seller: { name: string; bio: string; verified: boolean };
  images: { label: string; url: string }[];
  bids: { id: string; amount: number; createdAt: string; alias: string; yours: boolean }[];
  viewerIsSeller: boolean;
};

export function ListingView({
  detail,
  commissionLabel,
  loggedIn,
  favorite,
  allowBid,
}: {
  detail: Detail;
  commissionLabel: string;
  loggedIn: boolean;
  favorite: boolean;
  allowBid: boolean;
}) {
  const demoHref = detail.demoUrl || `/demo/${detail.slug}`;
  const external = demoHref.startsWith("http");
  const included = [
    detail.includesCode ? "Izvorni kod" : null,
    detail.includesDomain ? "Prenos domena" : null,
    detail.includesHosting ? "Pristup hostingu" : null,
    "Dizajn i resursi za koje postoji pravo prenosa",
    "Dokumentacija za pokretanje",
  ].filter(Boolean);

  return (
    <div className="wrap py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">{detail.category}</p>
          <h1 className="serif mt-2 text-5xl md:text-6xl">{detail.title}</h1>
          <p className="mt-3 max-w-2xl text-muted">{detail.summary}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`badge ${detail.ownership === "HOUSE" ? "badge-gold" : ""}`}>{ownershipLabel[detail.ownership]}</span>
          <span className="badge">{statusLabel[detail.status]}</span>
          {detail.isDemo && <span className="badge badge-demo">Testni projekat</span>}
        </div>
      </div>
      {detail.isDemo && <DemoBanner />}
      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.72fr)]">
        <div>
          <Gallery previewKey={detail.previewKey} title={detail.title} images={detail.images} />
          <div className="mt-4 flex flex-wrap gap-2">
            <a className="btn btn-line" href={demoHref} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
              Otvori demo sajt
            </a>
            <FavoriteButton slug={detail.slug} initial={favorite} />
            <Link className="btn btn-ghost" href="/aukcije">
              Nazad na katalog
            </Link>
          </div>
          {external && (
            <p className="mt-3 text-sm text-muted">Demo vodi na spoljašnji sajt. Otvara se u novom prozoru i nije ugrađen u stranicu.</p>
          )}
          <div className="mt-10 grid gap-8">
            <Section title="O projektu" text={detail.description} />
            <div>
              <h2 className="serif text-3xl">Funkcionalnosti</h2>
              <ul className="mt-4 grid gap-2">
                {detail.features.map((feature) => (
                  <li key={feature} className="rounded-2xl border border-line px-4 py-3">{feature}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="serif text-3xl">Tehnologije</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {detail.technologies.map((tech) => (
                  <span key={tech} className="badge">{tech}</span>
                ))}
              </div>
            </div>
            <Section title="Prilagođavanje" text={detail.customization} />
            <div>
              <h2 className="serif text-3xl">Šta kupac dobija</h2>
              <ul className="mt-4 grid gap-2">
                {included.map((item) => (
                  <li key={item} className="rounded-2xl border border-line px-4 py-3">{item}</li>
                ))}
              </ul>
              <p className="mt-4 leading-7 text-muted">{detail.deliverables}</p>
            </div>
            <Section title="Vlasništvo i prenos prava" text={detail.transferTerms} />
            <div className="panel">
              <h2 className="serif text-3xl">Prodavac</h2>
              <p className="mt-3 text-xl">{detail.seller.name}</p>
              <p className="text-sm text-gold">{detail.seller.verified ? "Verifikovan" : "Nije verifikovan"}</p>
              {detail.seller.bio && <p className="mt-3 leading-7 text-muted">{detail.seller.bio}</p>}
              <p className="mt-3 text-sm leading-6 text-muted">
                {detail.ownership === "HOUSE"
                  ? "Ovo je projekat naše firme. Posle plaćanja, cela kupoprodajna cena pripada Vitrina Studio."
                  : `Eksterni kreator. Posle plaćanja, platforma zadržava ${commissionLabel}, a ostatak je namenjen kreatoru.`}
              </p>
            </div>
          </div>
        </div>
        {allowBid ? (
          <div className="lg:sticky lg:top-24">
            <BidPanel
              slug={detail.slug}
              loggedIn={loggedIn}
              isSeller={detail.viewerIsSeller}
              ownership={detail.ownership}
              commissionLabel={commissionLabel}
              isDemo={detail.isDemo}
              initial={{
                status: detail.status,
                startPrice: detail.startPrice,
                currentBid: detail.currentBid,
                bidCount: detail.bidCount,
                nextBid: detail.nextBid,
                endsAt: detail.endsAt,
                extensions: detail.extensions,
                bids: detail.bids,
              }}
            />
          </div>
        ) : (
          <div className="panel lg:sticky lg:top-24">
            <p className="kicker">Pregled</p>
            <p className="mt-3 leading-7">Oglas još nije javna aukcija. Licitiranje počinje tek posle odobrenja.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <section>
      <h2 className="serif text-3xl">{title}</h2>
      <p className="mt-4 whitespace-pre-wrap leading-8 text-muted">{text}</p>
    </section>
  );
}
