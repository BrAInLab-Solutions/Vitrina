"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AuthForm({ mode, nextPath }: { mode: "login" | "register"; nextPath: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const showHints = process.env.NEXT_PUBLIC_DEMO_HINTS === "1";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      isSeller: form.get("isSeller") === "on",
    };
    const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Prijava nije uspela.");
      return;
    }
    router.push(nextPath);
    router.refresh();
  }

  return (
    <div className="wrap grid max-w-xl gap-6 py-16">
      <div>
        <p className="kicker">{mode === "login" ? "Prijava" : "Novi nalog"}</p>
        <h1 className="serif mt-2 text-5xl">{mode === "login" ? "Dobro došli nazad." : "Otvorite nalog."}</h1>
      </div>
      <form className="panel grid gap-4" onSubmit={submit}>
        {mode === "register" && (
          <label className="field"><span>Ime i prezime</span><input name="name" required autoComplete="name" /></label>
        )}
        <label className="field"><span>E-pošta</span><input name="email" type="email" required autoComplete="email" /></label>
        <label className="field"><span>Lozinka</span><input name="password" type="password" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
        {mode === "register" && (
          <label className="flex items-center gap-2 text-sm">
            <input name="isSeller" type="checkbox" />
            Želim i da prodajem sajtove
          </label>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        <button className="btn btn-gold" disabled={pending}>{pending ? "Sačekajte…" : mode === "login" ? "Prijavi se" : "Registruj se"}</button>
        {mode === "login" ? (
          <a href="/registracija" className="text-sm text-gold">Napravite nalog</a>
        ) : (
          <a href="/prijava" className="text-sm text-gold">Već imate nalog</a>
        )}
      </form>
      {mode === "login" && showHints && (
        <div className="panel text-sm leading-6 text-muted">
          <p className="text-ink">Lokalni test nalozi, lozinka za sve: Vitrina2026!</p>
          <p>admin@vitrina.test · ana@vitrina.test · mira@vitrina.test</p>
          <p>Ovi nalozi postoje samo u lokalnoj bazi i služe za proveru uloga.</p>
        </div>
      )}
    </div>
  );
}

export function BecomeSeller() {
  const [pending, setPending] = useState(false);
  async function enable() {
    setPending(true);
    await fetch("/api/account/seller", { method: "POST" });
    window.location.reload();
  }
  return <button className="btn btn-gold" onClick={enable} disabled={pending}>Postani kreator</button>;
}
