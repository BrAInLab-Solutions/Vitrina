"use client";

import { useState } from "react";
import { PreviewFrame } from "@/components/live-demo";

type Category = { slug: string; name: string };
type Initial = {
  id?: string;
  title: string;
  summary: string;
  description: string;
  categorySlug: string;
  startPriceEuro: number;
  durationHours: number;
  demoUrl: string;
  coverImageUrl: string;
  features: string;
  technologies: string;
  customization: string;
  deliverables: string;
  transferTerms: string;
  includesDomain: boolean;
  includesHosting: boolean;
  includesCode: boolean;
  previewKey: string;
  ownership: "HOUSE" | "EXTERNAL";
};

const steps = [
  "Osnovno",
  "Kategorija",
  "Prikaz",
  "Mogućnosti",
  "Cena",
  "Prava",
  "Pregled",
];

const styles = ["northline", "brasa", "atelier", "mira", "forma", "luna", "meridian", "kinfolk", "lumen", "clara", "signal"];

export function Wizard({
  categories,
  durations,
  isAdmin,
  initial,
}: {
  categories: Category[];
  durations: number[];
  isAdmin: boolean;
  initial: Initial;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [pending, setPending] = useState(false);

  function set<K extends keyof Initial>(key: K, value: Initial[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function payload() {
    return {
      ...form,
      features: form.features.split("\n").map((line) => line.trim()).filter(Boolean),
      technologies: form.technologies.split("\n").map((line) => line.trim()).filter(Boolean),
    };
  }

  async function save() {
    setPending(true);
    setError("");
    const response = await fetch(form.id ? `/api/listings/${form.id}` : "/api/listings", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload()),
    });
    const data = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Nacrt nije sačuvan.");
      return null;
    }
    setForm((current) => ({ ...current, id: data.id }));
    setInfo("Nacrt je sačuvan.");
    return data.id as string;
  }

  async function submit() {
    const id = form.id ?? (await save());
    if (!id) return;
    setPending(true);
    const response = await fetch(`/api/listings/${id}/submit`, { method: "POST" });
    const data = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Oglas nije poslat.");
      return;
    }
    window.location.href = "/nalog/oglasi";
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-2">
        {steps.map((label, index) => (
          <button key={label} className={`badge ${index === step ? "badge-gold" : ""}`} onClick={() => setStep(index)}>
            {index + 1}. {label}
          </button>
        ))}
      </div>
      <div className="panel grid gap-4">
        {step === 0 && (
          <>
            <label className="field"><span>Naziv projekta</span><input value={form.title} onChange={(event) => set("title", event.target.value)} /></label>
            <label className="field"><span>Kratak opis</span><textarea value={form.summary} onChange={(event) => set("summary", event.target.value)} /></label>
          </>
        )}
        {step === 1 && (
          <>
            <label className="field">
              <span>Kategorija</span>
              <select value={form.categorySlug} onChange={(event) => set("categorySlug", event.target.value)}>
                {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
              </select>
            </label>
            <label className="field"><span>Detaljan opis</span><textarea value={form.description} onChange={(event) => set("description", event.target.value)} /></label>
          </>
        )}
        {step === 2 && (
          <>
            <label className="field"><span>Demo link, https ili /demo/...</span><input value={form.demoUrl} onChange={(event) => set("demoUrl", event.target.value)} /></label>
            <label className="field"><span>Adresa naslovne slike, samo https</span><input value={form.coverImageUrl} onChange={(event) => set("coverImageUrl", event.target.value)} /></label>
            <label className="field">
              <span>Stil prikaza ako nema slike</span>
              <select value={form.previewKey} onChange={(event) => set("previewKey", event.target.value)}>
                {styles.map((style) => <option key={style} value={style}>{style}</option>)}
              </select>
            </label>
            <div className="overflow-hidden rounded-2xl border border-line"><PreviewFrame previewKey={form.previewKey} /></div>
          </>
        )}
        {step === 3 && (
          <>
            <label className="field"><span>Funkcionalnosti, jedna po liniji</span><textarea value={form.features} onChange={(event) => set("features", event.target.value)} /></label>
            <label className="field"><span>Tehnologije, jedna po liniji</span><textarea value={form.technologies} onChange={(event) => set("technologies", event.target.value)} /></label>
          </>
        )}
        {step === 4 && (
          <>
            <label className="field"><span>Početna cena u evrima</span><input inputMode="numeric" value={form.startPriceEuro} onChange={(event) => set("startPriceEuro", Number(event.target.value || 0))} /></label>
            <label className="field">
              <span>Trajanje aukcije</span>
              <select value={form.durationHours} onChange={(event) => set("durationHours", Number(event.target.value))}>
                {durations.map((hours) => <option key={hours} value={hours}>{hours / 24} dana</option>)}
              </select>
            </label>
          </>
        )}
        {step === 5 && (
          <>
            <label className="field"><span>Prilagođavanje</span><textarea value={form.customization} onChange={(event) => set("customization", event.target.value)} /></label>
            <label className="field"><span>Šta kupac dobija</span><textarea value={form.deliverables} onChange={(event) => set("deliverables", event.target.value)} /></label>
            <label className="field"><span>Prenos vlasništva i prava</span><textarea value={form.transferTerms} onChange={(event) => set("transferTerms", event.target.value)} /></label>
            <label className="flex gap-2 text-sm"><input type="checkbox" checked={form.includesCode} onChange={(event) => set("includesCode", event.target.checked)} />Izvorni kod</label>
            <label className="flex gap-2 text-sm"><input type="checkbox" checked={form.includesDomain} onChange={(event) => set("includesDomain", event.target.checked)} />Domen</label>
            <label className="flex gap-2 text-sm"><input type="checkbox" checked={form.includesHosting} onChange={(event) => set("includesHosting", event.target.checked)} />Hosting nalog</label>
            {isAdmin && (
              <label className="flex gap-2 text-sm">
                <input type="checkbox" checked={form.ownership === "HOUSE"} onChange={(event) => set("ownership", event.target.checked ? "HOUSE" : "EXTERNAL")} />
                Ovo je projekat naše firme i može odmah na aukciju
              </label>
            )}
          </>
        )}
        {step === 6 && (
          <div className="grid gap-3 text-sm leading-6">
            <div className="overflow-hidden rounded-2xl border border-line"><PreviewFrame previewKey={form.previewKey} /></div>
            <p className="serif text-3xl">{form.title || "Bez naziva"}</p>
            <p>{form.summary}</p>
            <p className="text-muted">{form.description}</p>
            <p>Početna cena: {form.startPriceEuro} € · Trajanje: {form.durationHours / 24} dana</p>
            <p>Eksterni oglas ide na administratorsku proveru pre objave.</p>
          </div>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        {info && <p className="text-sm text-ok">{info}</p>}
        <div className="flex flex-wrap gap-2">
          {step > 0 && <button className="btn btn-ghost" onClick={() => setStep((value) => value - 1)}>Nazad</button>}
          {step < steps.length - 1 && <button className="btn btn-gold" onClick={() => setStep((value) => value + 1)}>Dalje</button>}
          <button className="btn btn-ghost" onClick={save} disabled={pending}>Sačuvaj nacrt</button>
          {step === steps.length - 1 && <button className="btn btn-gold" onClick={submit} disabled={pending}>Pošalji na odobrenje</button>}
        </div>
      </div>
    </div>
  );
}
