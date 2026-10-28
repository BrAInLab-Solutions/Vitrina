import { TransactionControls } from "@/components/actions";
import { prisma } from "@/lib/db";
import { paymentLabel, payoutLabel } from "@/lib/labels";
import { formatEuro } from "@/lib/money";

export default async function TransactionsPage() {
  const rows = await prisma.transaction.findMany({ include: { listing: true, buyer: true, seller: true }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="serif text-4xl">Transakcije</h1>
      <p className="mt-2 text-sm text-muted">Konačna cena, pobednik i provizija se ovde ne menjaju. Menja se samo status uplate, predaje i isplate.</p>
      <div className="mt-6 grid gap-4">
        {rows.map((row) => (
          <article key={row.id} className="panel">
            <div className="flex flex-wrap justify-between gap-2">
              <h2 className="serif text-2xl">{row.listing.title}</h2>
              {row.isDemo && <span className="badge badge-demo">Test</span>}
            </div>
            <p className="mt-2 text-sm">Kupac {row.buyer.email} · prodavac {row.seller.email}</p>
            <p className="mt-1 text-sm num">Cena {formatEuro(row.finalPrice)} · platforma {formatEuro(row.platformRevenue)} · kreator {formatEuro(row.sellerPayout)} · procesor {formatEuro(row.processorFee)}</p>
            <p className="mt-1 text-sm text-muted">{paymentLabel[row.paymentStatus]} · {payoutLabel[row.payoutStatus]} · {row.paymentRef}</p>
            {row.buyerNote && <p className="mt-2 text-sm">Napomena kupca: {row.buyerNote}</p>}
            <div className="mt-3"><TransactionControls id={row.id} /></div>
          </article>
        ))}
        {rows.length === 0 && <p className="text-muted">Nema transakcija.</p>}
      </div>
    </div>
  );
}
