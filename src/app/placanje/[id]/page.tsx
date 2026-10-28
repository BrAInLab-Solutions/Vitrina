import { notFound } from "next/navigation";
import { DisputeForm, PaymentNote } from "@/components/actions";
import { PurchaseLock } from "@/components/purchase-lock";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handoverLabel, paymentLabel, payoutLabel } from "@/lib/labels";
import { formatEuro, formatPercent } from "@/lib/money";

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { id } = await params;
  const row = await prisma.transaction.findUnique({ where: { id }, include: { listing: true, buyer: true, seller: true } });
  if (!row) notFound();
  const allowed = user.id === row.buyerId || user.id === row.sellerId || user.role === "ADMIN";
  if (!allowed) notFound();
  const buyerView = user.id === row.buyerId || user.role === "ADMIN";

  return (
    <div className="wrap py-12">
      <p className="kicker">Plaćanje</p>
      <h1 className="serif mt-2 text-5xl">{row.listing.title}</h1>
      {row.isDemo && <p className="mt-4 text-gold">Testna transakcija. Ne predstavlja stvarnu uplatu.</p>}

      {buyerView && (
        <div className="mt-6">
          <PurchaseLock title={row.listing.title} status={row.paymentStatus} paymentRef={row.paymentRef} />
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel">
          <h2 className="serif text-3xl">Obračun</h2>
          <dl className="mt-4 grid gap-2 text-sm">
            <div>Konačna cena: <b className="num">{formatEuro(row.finalPrice)}</b></div>
            <div>Referenca: <b>{row.paymentRef}</b></div>
            <div>Status uplate: {paymentLabel[row.paymentStatus]}</div>
            <div>Predaja: {handoverLabel[row.handoverStatus]}</div>
            <div>Isplata kreatoru: {payoutLabel[row.payoutStatus]}</div>
            {row.ownership === "EXTERNAL" && (
              <>
                <div>Provizija platforme ({formatPercent(row.commissionRate)}): <b className="num">{formatEuro(row.platformRevenue)}</b></div>
                <div>Neto za kreatora: <b className="num">{formatEuro(row.sellerPayout)}</b></div>
              </>
            )}
            {row.ownership === "HOUSE" && <p>Cela cena pripada Vitrina Studio. Provizija se ne dodaje kupcu.</p>}
          </dl>
          <p className="mt-4 leading-7 text-muted">
            Podaci o platnoj kartici se ne unose u Vitrinu. U ovoj verziji nema povezanog platnog procesora ni automatske marketplace isplate.
            Uplatu vezanu za referencu potvrđuje administrator, a zatim se predaja i isplata vode kao kontrolisan nalog.
          </p>
          {row.buyerNote && <p className="mt-3 text-sm">Napomena kupca: {row.buyerNote}</p>}
        </section>
        <section className="grid gap-4">
          {buyerView && row.paymentStatus === "AWAITING" && <div className="panel"><PaymentNote id={row.id} /></div>}
          <div className="panel">
            <h2 className="serif text-3xl">Prijava</h2>
            <p className="mt-2 text-sm text-muted">Ako predaja, prava ili opis ne odgovaraju oglasu, ostavite prijavu. Ona ne menja istoriju ponuda.</p>
            <div className="mt-4"><DisputeForm transactionId={row.id} /></div>
          </div>
        </section>
      </div>
    </div>
  );
}
