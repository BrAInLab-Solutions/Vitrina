import Link from "next/link";
import { DisputeForm } from "@/components/actions";
import { PurchaseLock } from "@/components/purchase-lock";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handoverLabel, paymentLabel } from "@/lib/labels";
import { formatEuro } from "@/lib/money";

export default async function PurchasesPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const rows = await prisma.transaction.findMany({
    where: { buyerId: user.id },
    include: { listing: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h1 className="serif text-4xl">Kupovine</h1>
      <div className="mt-6 grid gap-4">
        {rows.length === 0 && <p className="text-muted">Nemate osvojenih aukcija.</p>}
        {rows.map((row) => (
          <article key={row.id} className="panel">
            <PurchaseLock title={row.listing.title} status={row.paymentStatus} paymentRef={row.paymentRef} />
            <div className="mt-4 flex flex-wrap justify-between gap-3">
              <p className="num text-gold">{formatEuro(row.finalPrice)}</p>
              <p className="text-sm text-muted">{paymentLabel[row.paymentStatus]} · {handoverLabel[row.handoverStatus]}</p>
            </div>
            {row.isDemo && <p className="mt-2 text-sm text-gold">Testna transakcija, nije stvarna kupovina.</p>}
            <Link className="mt-3 inline-block text-sm text-gold" href={`/placanje/${row.id}`}>
              Instrukcije i status
            </Link>
            <div className="mt-4">
              <DisputeForm transactionId={row.id} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
