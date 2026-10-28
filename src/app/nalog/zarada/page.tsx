import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { paymentLabel, payoutLabel } from "@/lib/labels";
import { formatEuro, formatPercent } from "@/lib/money";

export default async function EarningsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const rows = await prisma.transaction.findMany({
    where: { sellerId: user.id },
    include: { listing: true },
    orderBy: { createdAt: "desc" },
  });
  const paid = rows.filter((row) => row.paymentStatus === "PAID" && !row.isDemo);
  const net = paid.reduce((sum, row) => sum + row.sellerPayout, 0);
  return (
    <div>
      <h1 className="serif text-4xl">Zarada</h1>
      <p className="mt-2 text-muted">Stvarni neto iznos od potvrđenih uplata, bez testnih transakcija: {formatEuro(net)}.</p>
      <div className="mt-6 grid gap-3">
        {rows.length === 0 && <p className="text-muted">Još nema završenih prodaja.</p>}
        {rows.map((row) => (
          <article key={row.id} className="panel">
            <div className="flex flex-wrap justify-between gap-3">
              <h2 className="serif text-2xl">{row.listing.title}</h2>
              {row.isDemo && <span className="badge badge-demo">Testni podatak</span>}
            </div>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div>Konačna cena: <b className="num">{formatEuro(row.finalPrice)}</b></div>
              <div>Stopa: <b>{formatPercent(row.commissionRate)}</b></div>
              <div>Provizija platforme: <b className="num">{formatEuro(row.platformRevenue)}</b></div>
              <div>Neto za prodavca: <b className="num">{formatEuro(row.sellerPayout)}</b></div>
              <div>{paymentLabel[row.paymentStatus]}</div>
              <div>{payoutLabel[row.payoutStatus]}</div>
            </dl>
            {row.ownership === "HOUSE" && <p className="mt-3 text-sm text-muted">Ovo je projekat firme. Cela cena ostaje Vitrina Studio, zato nema isplate kreatoru.</p>}
          </article>
        ))}
      </div>
    </div>
  );
}
