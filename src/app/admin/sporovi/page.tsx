import { DisputeResolve } from "@/components/actions";
import { prisma } from "@/lib/db";
import { disputeLabel } from "@/lib/labels";

export default async function DisputesPage() {
  const disputes = await prisma.dispute.findMany({
    include: { user: true, transaction: { include: { listing: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h1 className="serif text-4xl">Prijave</h1>
      <div className="mt-6 grid gap-4">
        {disputes.length === 0 && <p className="text-muted">Nema prijava.</p>}
        {disputes.map((dispute) => (
          <article key={dispute.id} className="panel">
            <p className="text-sm text-gold">{disputeLabel[dispute.status]} {dispute.transaction.isDemo ? "· testna prijava" : ""}</p>
            <h2 className="serif mt-2 text-2xl">{dispute.transaction.listing.title}</h2>
            <p className="mt-2 text-sm text-muted">{dispute.user.name} · {dispute.user.email}</p>
            <p className="mt-3 leading-7">{dispute.reason}</p>
            {dispute.resolution && <p className="mt-2 text-sm">Odluka: {dispute.resolution}</p>}
            {dispute.status === "OPEN" || dispute.status === "REVIEW" ? <div className="mt-4"><DisputeResolve id={dispute.id} /></div> : null}
          </article>
        ))}
      </div>
    </div>
  );
}
