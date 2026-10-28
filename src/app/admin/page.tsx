import { prisma } from "@/lib/db";
import { formatEuro } from "@/lib/money";
import { settleExpiredAuctions } from "@/lib/auctions";

export default async function AdminHome() {
  await settleExpiredAuctions();
  const [users, active, ended, pending, transactions] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: { in: ["ENDED_SOLD", "ENDED_UNSOLD"] } } }),
    prisma.listing.count({ where: { status: "PENDING" } }),
    prisma.transaction.findMany(),
  ]);
  const awaitingPay = transactions.filter((row) => row.paymentStatus === "AWAITING");
  const awaitingPayout = transactions.filter((row) => row.payoutStatus === "PENDING");
  const real = rollup(transactions.filter((row) => !row.isDemo));
  const demo = rollup(transactions.filter((row) => row.isDemo));
  const days = lastDays(14).map((day) => {
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const slice = transactions.filter((row) => row.paymentStatus === "PAID" && row.createdAt >= day && row.createdAt < next);
    return {
      label: `${day.getDate()}.${day.getMonth() + 1}.`,
      real: slice.filter((row) => !row.isDemo).reduce((sum, row) => sum + row.finalPrice, 0),
      demo: slice.filter((row) => row.isDemo).reduce((sum, row) => sum + row.finalPrice, 0),
    };
  });
  const max = Math.max(1, ...days.map((day) => day.real + day.demo));

  return (
    <div>
      <p className="kicker">Kontrola</p>
      <h1 className="serif text-4xl">Pregled platforme</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Stat label="Korisnici" value={String(users)} />
        <Stat label="Aktivne aukcije" value={String(active)} />
        <Stat label="Završene aukcije" value={String(ended)} />
        <Stat label="Oglasi na čekanju" value={String(pending)} />
        <Stat label="Čeka uplatu" value={String(awaitingPay.length)} />
        <Stat label="Isplate na čekanju" value={String(awaitingPayout.length)} />
      </div>

      <section className="panel mt-6">
        <h2 className="serif text-3xl">Stvarni novac</h2>
        <p className="mt-2 text-sm text-muted">Samo transakcije koje nisu označene kao testne. Dok nema prave prodaje, iznosi su nula.</p>
        <MoneyGrid data={real} />
      </section>
      <section className="panel mt-4">
        <h2 className="serif text-3xl">Testni podaci</h2>
        <p className="mt-2 text-sm text-gold">Ovi iznosi služe za proveru obračuna. Nisu prihod firme.</p>
        <MoneyGrid data={demo} />
      </section>

      <section className="panel mt-4">
        <h2 className="serif text-3xl">Prodaja po danima</h2>
        <p className="mt-2 text-sm text-muted">Visina stuba je bruto vrednost potvrđenih uplata. Tamnija traka je test, zlatna bi bila stvarna prodaja.</p>
        <div className="mt-4 flex h-44 items-end gap-2">
          {days.map((day) => (
            <div key={day.label} className="flex h-full flex-1 flex-col justify-end gap-1">
              <div className="flex flex-col justify-end" style={{ height: `${((day.real + day.demo) / max) * 100}%` }}>
                {day.demo > 0 && <div className="min-h-1 flex-1 rounded-t bg-[#8a6432]/70" />}
                {day.real > 0 && <div className="min-h-1 rounded-t bg-[var(--gold-btn)]" style={{ flex: day.real }} />}
              </div>
              <span className="text-center text-[10px] text-muted">{day.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel mt-4 text-sm leading-6 text-muted">
        <h2 className="serif text-2xl text-ink">Šta je zaista povezano</h2>
        <p className="mt-2">Baza u ovom okruženju je SQLite fajl. Šema je prenosiva na PostgreSQL, ali PostgreSQL server ovde nije podignut.</p>
        <p>Ponude se osvežavaju preko serverskog toka. Nema zasebnog WebSocket servisa.</p>
        <p>Kartice se ne čuvaju. Platni procesor i automatske isplate nisu povezani. Status vodi administrator.</p>
        <p>Obaveštenja ostaju u aplikaciji. E-pošta nije povezana.</p>
        <p>Slike demo projekata su ugrađeni prikazi, ne cloud storage.</p>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="panel">
      <p className="text-sm text-muted">{label}</p>
      <p className="serif num mt-2 text-4xl">{value}</p>
    </article>
  );
}

function MoneyGrid({ data }: { data: ReturnType<typeof rollup> }) {
  return (
    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
      <div>Bruto vrednost prodaje: <b className="num">{formatEuro(data.gross)}</b></div>
      <div>Prihod od naših projekata: <b className="num">{formatEuro(data.house)}</b></div>
      <div>Prihod od provizija: <b className="num">{formatEuro(data.commission)}</b></div>
      <div>Iznos namenjen kreatorima: <b className="num">{formatEuro(data.sellers)}</b></div>
      <div>Troškovi platnog procesora: <b className="num">{formatEuro(data.fees)}</b></div>
      <div>Prihod platforme posle tih troškova: <b className="num">{formatEuro(data.platform - data.fees)}</b></div>
    </dl>
  );
}

function rollup(rows: { finalPrice: number; platformRevenue: number; sellerPayout: number; processorFee: number; ownership: string; paymentStatus: string }[]) {
  const paid = rows.filter((row) => row.paymentStatus === "PAID");
  return {
    gross: paid.reduce((sum, row) => sum + row.finalPrice, 0),
    house: paid.filter((row) => row.ownership === "HOUSE").reduce((sum, row) => sum + row.platformRevenue, 0),
    commission: paid.filter((row) => row.ownership === "EXTERNAL").reduce((sum, row) => sum + row.platformRevenue, 0),
    sellers: paid.reduce((sum, row) => sum + row.sellerPayout, 0),
    fees: paid.reduce((sum, row) => sum + row.processorFee, 0),
    platform: paid.reduce((sum, row) => sum + row.platformRevenue, 0),
  };
}

function lastDays(count: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (count - 1 - index));
    return day;
  });
}
