"use client";

import { useState } from "react";

type Category = { slug: string; name: string };

export function FilterMenu({
  categories,
  values,
}: {
  categories: Category[];
  values: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button type="button" className="btn btn-ghost btn-sm" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        Filteri
      </button>
      {open && (
        <form action="/aukcije" className="filter-pop" onSubmit={() => setOpen(false)}>
          <label className="field">
            <span>Pretraga</span>
            <input name="q" defaultValue={values.q} placeholder="Naziv ili opis" />
          </label>
          <label className="field">
            <span>Kategorija</span>
            <select name="kategorija" defaultValue={values.kategorija}>
              <option value="">Sve</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="field">
              <span>Prodavac</span>
              <select name="tip" defaultValue={values.tip}>
                <option value="">Svi</option>
                <option value="nasi">Naš projekat</option>
                <option value="eksterni">Eksterni</option>
              </select>
            </label>
            <label className="field">
              <span>Status</span>
              <select name="status" defaultValue={values.status || "aktivne"}>
                <option value="aktivne">Aktivne</option>
                <option value="zavrsene">Završene</option>
                <option value="prodate">Prodate</option>
                <option value="neprodate">Nisu prodate</option>
                <option value="sve">Sve</option>
              </select>
            </label>
            <label className="field">
              <span>Rok</span>
              <select name="rok" defaultValue={values.rok || "svi"}>
                <option value="svi">Bilo kada</option>
                <option value="24h">24 časa</option>
                <option value="72h">3 dana</option>
                <option value="7d">7 dana</option>
              </select>
            </label>
            <label className="field">
              <span>Redosled</span>
              <select name="sort" defaultValue={values.sort || "kraj"}>
                <option value="kraj">Najskoriji kraj</option>
                <option value="popularno">Najviše ponuda</option>
                <option value="novo">Najnovije</option>
                <option value="cena-rast">Cena ↑</option>
                <option value="cena-pad">Cena ↓</option>
              </select>
            </label>
            <label className="field">
              <span>Od, €</span>
              <input name="cenaMin" inputMode="numeric" defaultValue={values.cenaMin} />
            </label>
            <label className="field">
              <span>Do, €</span>
              <input name="cenaMax" inputMode="numeric" defaultValue={values.cenaMax} />
            </label>
          </div>
          <button className="btn btn-gold">Prikaži</button>
        </form>
      )}
    </div>
  );
}
