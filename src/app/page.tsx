import Link from "next/link";
import { ActiveAuctions } from "@/components/auction-sections";
import { HeroStage } from "@/components/hero-stage";
import { homeRails, settleExpiredAuctions } from "@/lib/auctions";
import { buildOrbitItems } from "@/lib/orbit";

export default async function HomePage() {
  await settleExpiredAuctions();
  const data = await homeRails();
  const orbitItems = buildOrbitItems(data.popular);

  return (
    <>
      <HeroStage items={orbitItems} />

      <div className="wrap-wide pb-20">
        <ActiveAuctions items={data.popular} />

        <section className="home-flow mt-16">
          <h2 className="serif home-flow-title">Kako ide</h2>
          <ol className="home-flow-list">
            <li>
              <span>01</span>
              <div>
                <strong>Izaberi sajt</strong>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Licitiraj</strong>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Preuzmi</strong>
              </div>
            </li>
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/kako-funkcionise" className="btn btn-ghost">
              Detaljnije
            </Link>
            <Link href="/prodaj" className="btn btn-line">
              Prodaj sajt
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
