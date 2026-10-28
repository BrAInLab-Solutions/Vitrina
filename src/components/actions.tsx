"use client";

import { useState } from "react";

async function post(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Radnja nije uspela.");
  window.location.reload();
}

export function ModerateButtons({ id }: { id: string }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  async function act(action: string) {
    setError("");
    try {
      await post(`/api/admin/listings/${id}`, { action, reason });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška");
    }
  }
  return (
    <div className="grid gap-2">
      <input className="rounded-xl border border-line bg-transparent px-3 py-2" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Razlog, obavezan za odbijanje" aria-label="Razlog" />
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-gold btn-sm" onClick={() => act("approve")}>Odobri</button>
        <button className="btn btn-ghost btn-sm" onClick={() => act("reject")}>Odbij</button>
        <button className="btn btn-danger btn-sm" onClick={() => act("remove")}>Ukloni</button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

export function TransactionControls({ id }: { id: string }) {
  const [error, setError] = useState("");
  async function update(body: object) {
    setError("");
    try {
      await post(`/api/admin/transactions/${id}`, body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška");
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      <button className="btn btn-gold btn-sm" onClick={() => update({ paymentStatus: "PAID" })}>Potvrdi uplatu</button>
      <button className="btn btn-ghost btn-sm" onClick={() => update({ paymentStatus: "FAILED" })}>Neuspešno</button>
      <button className="btn btn-ghost btn-sm" onClick={() => update({ handoverStatus: "DELIVERED" })}>Predato</button>
      <button className="btn btn-ghost btn-sm" onClick={() => update({ payoutStatus: "PAID" })}>Isplaćeno</button>
      <button className="btn btn-danger btn-sm" onClick={() => update({ paymentStatus: "REFUNDED", handoverStatus: "BLOCKED" })}>Povrat</button>
      <button className="btn btn-danger btn-sm" onClick={() => update({ paymentStatus: "CANCELLED", handoverStatus: "BLOCKED" })}>Otkaži</button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

export function UserControls({ id, verified, disabled, seller }: { id: string; verified: boolean; disabled: boolean; seller: boolean }) {
  const [error, setError] = useState("");
  async function update(body: object) {
    setError("");
    try {
      await post(`/api/admin/users/${id}`, body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška");
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      <button className="btn btn-ghost btn-sm" onClick={() => update({ sellerVerified: !verified })}>{verified ? "Skini verifikaciju" : "Verifikuj"}</button>
      <button className="btn btn-ghost btn-sm" onClick={() => update({ isSeller: !seller })}>{seller ? "Nije prodavac" : "Učini prodavcem"}</button>
      <button className="btn btn-danger btn-sm" onClick={() => update({ disabled: !disabled })}>{disabled ? "Aktiviraj" : "Onemogući"}</button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

export function DisputeResolve({ id }: { id: string }) {
  const [resolution, setResolution] = useState("");
  const [error, setError] = useState("");
  async function resolve(status: string) {
    setError("");
    try {
      await post(`/api/admin/disputes/${id}`, { status, resolution });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška");
    }
  }
  return (
    <div className="grid gap-2">
      <textarea className="rounded-xl border border-line bg-transparent px-3 py-2" value={resolution} onChange={(event) => setResolution(event.target.value)} placeholder="Odluka" aria-label="Odluka" />
      <div className="flex gap-2">
        <button className="btn btn-gold btn-sm" onClick={() => resolve("RESOLVED")}>Reši</button>
        <button className="btn btn-ghost btn-sm" onClick={() => resolve("REJECTED")}>Odbij prijavu</button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

export function SettingsForm({
  commissionPercent,
  antiSnipeWindowMinutes,
  antiSnipeExtendMinutes,
  maxExtensions,
}: {
  commissionPercent: number;
  antiSnipeWindowMinutes: number;
  antiSnipeExtendMinutes: number;
  maxExtensions: number;
}) {
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    try {
      await post("/api/admin/settings", {
        commissionPercent: Number(form.get("commissionPercent")),
        antiSnipeWindowMinutes: Number(form.get("antiSnipeWindowMinutes")),
        antiSnipeExtendMinutes: Number(form.get("antiSnipeExtendMinutes")),
        maxExtensions: Number(form.get("maxExtensions")),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška");
    }
  }
  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={submit}>
      <label className="field"><span>Provizija za eksterne kreatore, %</span><input name="commissionPercent" type="number" min={1} max={30} step="0.1" defaultValue={commissionPercent} /></label>
      <label className="field"><span>Prozor protiv poslednje sekunde, minuti</span><input name="antiSnipeWindowMinutes" type="number" min={1} max={15} defaultValue={antiSnipeWindowMinutes} /></label>
      <label className="field"><span>Produženje, minuti</span><input name="antiSnipeExtendMinutes" type="number" min={1} max={30} defaultValue={antiSnipeExtendMinutes} /></label>
      <label className="field"><span>Najviše produženja</span><input name="maxExtensions" type="number" min={0} max={20} defaultValue={maxExtensions} /></label>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button className="btn btn-gold w-fit">Sačuvaj podešavanja</button>
    </form>
  );
}

export function CategoryForm() {
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    try {
      await post("/api/admin/categories", {
        name: String(form.get("name") ?? ""),
        slug: String(form.get("slug") ?? ""),
        blurb: String(form.get("blurb") ?? ""),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška");
    }
  }
  return (
    <form className="grid gap-3" onSubmit={submit}>
      <label className="field"><span>Naziv</span><input name="name" required /></label>
      <label className="field"><span>Slug</span><input name="slug" required /></label>
      <label className="field"><span>Kratak opis</span><input name="blurb" /></label>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button className="btn btn-gold w-fit">Dodaj kategoriju</button>
    </form>
  );
}

export function RenameCategory({ id, name }: { id: string; name: string }) {
  const [value, setValue] = useState(name);
  const [error, setError] = useState("");
  async function save() {
    setError("");
    const response = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: value }),
    });
    const data = await response.json();
    if (!response.ok) setError(data.error || "Nije sačuvano.");
    else window.location.reload();
  }
  return (
    <div className="flex flex-wrap gap-2">
      <input className="rounded-xl border border-line bg-transparent px-3 py-2" value={value} onChange={(event) => setValue(event.target.value)} aria-label="Naziv kategorije" />
      <button className="btn btn-ghost btn-sm" onClick={save}>Sačuvaj</button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

export function MarkRead() {
  return (
    <button
      className="btn btn-ghost btn-sm"
      onClick={async () => {
        await fetch("/api/notifications/read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
        window.location.reload();
      }}
    >
      Označi sve kao pročitano
    </button>
  );
}

export function PaymentNote({ id }: { id: string }) {
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  async function send(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch(`/api/payments/${id}/note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    const data = await response.json();
    setMessage(response.ok ? "Napomena je sačuvana. Uplata još nije potvrđena." : data.error);
  }
  return (
    <form className="grid gap-3" onSubmit={send}>
      <label className="field"><span>Napomena uz uplatu, bez podataka kartice</span><textarea value={note} onChange={(event) => setNote(event.target.value)} /></label>
      <button className="btn btn-ghost w-fit">Pošalji napomenu</button>
      {message && <p className="text-sm">{message}</p>}
    </form>
  );
}

export function DisputeForm({ transactionId }: { transactionId: string }) {
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  async function send(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/disputes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId, reason }),
    });
    const data = await response.json();
    setMessage(response.ok ? "Prijava je evidentirana." : data.error);
    if (response.ok) setReason("");
  }
  return (
    <form className="grid gap-3" onSubmit={send}>
      <label className="field"><span>Opišite problem</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} /></label>
      <button className="btn btn-ghost w-fit">Otvori prijavu</button>
      {message && <p className="text-sm">{message}</p>}
    </form>
  );
}
