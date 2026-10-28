"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { formatEuro } from "@/lib/money";

type Bid = { id: string; amount: number; createdAt: string; alias: string; yours: boolean };

type Snapshot = {
  status: string;
  startPrice: number;
  currentBid: number;
  bidCount: number;
  nextBid: number;
  endsAt: string | null;
  extensions: number;
  bids: Bid[];
};

export function BidPanel({
  slug,
  loggedIn,
  isSeller,
  ownership,
  commissionLabel,
  isDemo,
  initial,
}: {
  slug: string;
  loggedIn: boolean;
  isSeller: boolean;
  ownership: string;
  commissionLabel: string;
  isDemo: boolean;
  initial: Snapshot;
}) {
  const router = useRouter();
  const [snap, setSnap] = useState(initial);
  const [amount, setAmount] = useState(String(Math.round(initial.nextBid / 100)));
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const source = new EventSource(`/api/auctions/${slug}/stream`);
    source.onmessage = (event) => {
      const data = JSON.parse(event.data) as Snapshot;
      setSnap(data);
    };
    return () => source.close();
  }, [slug]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setInfo("");
    setPending(true);
    const response = await fetch(`/api/auctions/${slug}/bids`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountEuro: Number(amount) }),
    });
    const data = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Ponuda nije prihvaćena.");
      return;
    }
    setInfo(data.extended ? "Ponuda je prihvaćena i aukcija je produžena." : "Ponuda je prihvaćena.");
    setAmount(String(Math.round((data.nextBid ?? snap.nextBid) / 100)));
    router.refresh();
  }

  const hasBid = snap.bidCount > 0;

  return (
    <div id="ponuda" className="panel">
      <p className="kicker">Licitacija</p>
      <p className="serif num mt-3 text-5xl">{hasBid ? formatEuro(snap.currentBid) : formatEuro(snap.startPrice)}</p>
      <p className="mt-1 text-sm text-muted">{hasBid ? "Trenutna najviša ponuda" : "Početna cena, još nema ponuda"}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <p>
          <span className="block text-muted">Ponude</span>
          <b className="num">{snap.bidCount}</b>
        </p>
        <p>
          <span className="block text-muted">Sledeći minimum</span>
          <b className="num">{formatEuro(snap.nextBid)}</b>
        </p>
      </div>
      {snap.status === "ACTIVE" && snap.endsAt && <CountdownLine endsAt={snap.endsAt} />}
      {snap.extensions > 0 && (
        <p className="mt-3 text-sm text-gold">Aukcija je produžavana {snap.extensions} puta zbog ponuda pred kraj.</p>
      )}
      <p className="mt-4 text-sm leading-6 text-muted">
        {ownership === "HOUSE"
          ? "Kupac plaća konačnu cenu. Cela suma pripada Vitrina Studio."
          : `Kupac plaća konačnu cenu. Provizija od ${commissionLabel} se ne dodaje na račun, već se odbija od iznosa za kreatora.`}
      </p>
      {isDemo && <p className="mt-2 text-sm text-gold">Testni projekat. Ponuda ovde ne stvara stvarnu obavezu plaćanja.</p>}
      {snap.status !== "ACTIVE" ? (
        <p className="mt-4 text-sm">Ova aukcija više ne prima ponude.</p>
      ) : isSeller ? (
        <p className="mt-4 text-sm">Ne možete da licitirate na sopstveni sajt.</p>
      ) : !loggedIn ? (
        <a className="btn btn-gold mt-4 w-full" href={`/prijava?next=/aukcije/${slug}%23ponuda`}>
          Prijavite se da licitirate
        </a>
      ) : (
        <form className="mt-4 grid gap-3" onSubmit={submit}>
          <label className="field">
            <span>Vaša ponuda u evrima</span>
            <input inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} aria-label="Iznos ponude u evrima" />
          </label>
          {error && <p className="text-sm text-danger">{error}</p>}
          {info && <p className="text-sm text-ok">{info}</p>}
          <button className="btn btn-gold" disabled={pending}>
            {pending ? "Šaljem…" : "Licitiraj"}
          </button>
        </form>
      )}
      <div className="mt-6">
        <p className="text-sm text-muted">Istorija ponuda</p>
        <ul className="mt-2 grid gap-2">
          {snap.bids.length === 0 && <li className="text-sm text-muted">Još niko nije licitirao.</li>}
          {snap.bids.map((bid) => (
            <li key={bid.id} className="grid grid-cols-[1fr_auto_auto] gap-3 text-sm">
              <span>{bid.alias}</span>
              <span className="num">{formatEuro(bid.amount)}</span>
              <time className="text-muted">
                {new Date(bid.createdAt).toLocaleString("sr-Latn-RS", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
              </time>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CountdownLine({ endsAt }: { endsAt: string }) {
  const [label, setLabel] = useState("…");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setLabel("Vreme je isteklo");
        return;
      }
      const total = Math.floor(diff / 1000);
      const hours = Math.floor(total / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      const seconds = total % 60;
      setLabel(`${hours}č ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);
  return <p className="num mt-4 text-lg">Preostalo: {label}</p>;
}
