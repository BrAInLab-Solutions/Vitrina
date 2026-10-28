"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

type Screen = "home" | "inner" | "mobile";
type Props = { screen: Screen; interactive: boolean };

const demos: Record<string, (props: Props) => ReactNode> = {
  northline: Northline,
  brasa: Brasa,
  atelier: Atelier,
  mira: Mira,
  forma: Forma,
  luna: Luna,
  meridian: Meridian,
  kinfolk: Kinfolk,
  lumen: Lumen,
  clara: Clara,
  signal: Signal,
};

export function LiveDemo({
  previewKey,
  screen = "home",
  interactive = false,
}: {
  previewKey: string;
  screen?: Screen;
  interactive?: boolean;
}) {
  const Demo = demos[previewKey] ?? Signal;
  const narrow = screen === "mobile";
  const frame = interactive
    ? "min-h-screen"
    : narrow
      ? "h-[844px] w-[390px] overflow-hidden"
      : "h-[900px] w-[1440px] overflow-hidden";
  return (
    <div className={`${frame} ${narrow ? "mobile-shot" : ""}`}>
      <Demo screen={screen} interactive={interactive} />
    </div>
  );
}

export function PreviewFrame({
  previewKey,
  screen = "home",
  className = "",
  reel = false,
}: {
  previewKey: string;
  screen?: Screen;
  className?: string;
  reel?: boolean;
}) {
  const mobile = screen === "mobile";
  const style = mobile ? ({ "--shot-w": "390px", "--shot-h": "844px" } as CSSProperties) : undefined;
  return (
    <div className={`preview-host ${mobile ? "phone-host" : ""} ${reel ? "reel" : ""} ${className}`} style={style}>
      <div className={reel ? "reel-move" : undefined}>
        <div className="preview-canvas">
          <LiveDemo previewKey={previewKey} screen={screen} />
        </div>
      </div>
    </div>
  );
}

function Northline({ screen, interactive }: Props) {
  const [yearly, setYearly] = useState(true);
  const price = yearly ? "49" : "59";
  return (
    <div className="h-full bg-[#07111f] text-[#edf3fb]" style={{ fontFamily: "Georgia, serif" }}>
      <div className="flex items-center justify-between px-10 py-6 text-[15px]" style={{ fontFamily: "Segoe UI, sans-serif" }}>
        <b>Northline</b>
        <div className="flex gap-6 text-[#9eb0c9]">
          <span>Proizvod</span><span>Cene</span><span>Klijenti</span>
        </div>
        <span className="rounded-full bg-white px-4 py-2 text-[13px] text-[#07111f]">Zakaži demo</span>
      </div>
      {screen === "inner" ? (
        <div className="grid grid-cols-3 gap-4 px-10">
          {["Starter", "Studio", "House"].map((name, index) => (
            <div key={name} className="rounded-3xl border border-white/10 p-6">
              <p className="text-[#9eb0c9]">{name}</p>
              <p className="mt-4 text-5xl">{index === 1 ? price : index === 0 ? "0" : "129"}€</p>
              <p className="mt-4 text-sm text-[#9eb0c9]" style={{ fontFamily: "Segoe UI, sans-serif" }}>Analitika, izveštaji i deljeni prikaz za tim.</p>
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid items-center gap-10 px-10 ${screen === "mobile" ? "" : "grid-cols-2"}`}>
          <div>
            <p className="text-sm tracking-[0.2em] text-[#d6b17a]" style={{ fontFamily: "Segoe UI, sans-serif" }}>B2B ANALITIKA</p>
            <h2 className="mt-4 text-6xl leading-[0.95]">Prihod, bez tabele.</h2>
            <p className="mt-5 max-w-md text-lg text-[#b7c6da]" style={{ fontFamily: "Segoe UI, sans-serif" }}>Jedan pregled za prodaju, zadržavanje i prognozu. Napravljen da izgleda skupo i da se čita brzo.</p>
            {interactive && (
              <button className="mt-6 rounded-full border border-white/20 px-4 py-2 text-sm" onClick={() => setYearly((v) => !v)}>
                {yearly ? "Godišnje" : "Mesečno"} · od {price}€
              </button>
            )}
          </div>
          <div className="rounded-[28px] border border-white/10 bg-[#0d1b30] p-5">
            <div className="mb-4 flex justify-between text-xs text-[#9eb0c9]"><span>MRR</span><span>128.400 €</span></div>
            <div className="flex h-40 items-end gap-2">
              {[40, 55, 48, 70, 66, 90, 84, 100].map((h) => (
                <div key={h} className="flex-1 rounded-t-lg bg-gradient-to-t from-[#d6b17a] to-[#7eb6ff]" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Brasa({ screen, interactive }: Props) {
  const [course, setCourse] = useState("Glavna jela");
  const [sent, setSent] = useState(false);
  const menu: Record<string, string[]> = {
    "Predjela": ["Tartar od tune", "Burrata, kruška"],
    "Glavna jela": ["Brancin na žaru", "Jagnjetina, ruzmarin"],
    "Vina": ["Malvazija 2022", "Pinot crni"],
  };
  return (
    <div className="h-full bg-[#f6efe4] text-[#2a2118]">
      <div className="flex items-center justify-between px-8 py-6">
        <span className="text-xs tracking-[0.35em]">RESTORAN</span>
        <b className="text-2xl tracking-[0.28em]">BRASA</b>
        <span className="text-xs tracking-[0.2em]">REZERVACIJA</span>
      </div>
      {screen === "inner" ? (
        <div className="px-8">
          <div className="mb-6 flex gap-3 text-sm">
            {Object.keys(menu).map((item) => (
              <button key={item} onClick={() => interactive && setCourse(item)} className={course === item ? "border-b border-[#2a2118]" : "text-[#8a7764]"}>
                {item}
              </button>
            ))}
          </div>
          <div className="grid gap-4">
            {menu[course].map((dish) => (
              <div key={dish} className="flex justify-between border-b border-[#2a2118]/15 py-3 text-3xl">
                <span>{dish}</span><span className="text-lg">24 €</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-8">
          <p className="text-7xl leading-none">Vatra, so i mir.</p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="col-span-2 h-64 rounded-[28px] bg-[#c4552a]" />
            <div className="h-64 rounded-[28px] bg-[#20342c]" />
          </div>
          {interactive && (
            <form className="mt-6 flex gap-3" onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
              <input className="rounded-full border px-4" placeholder="Datum" aria-label="Datum" />
              <input className="w-24 rounded-full border px-4" placeholder="Gosti" aria-label="Broj gostiju" />
              <button className="rounded-full bg-[#2a2118] px-5 py-2 text-[#f6efe4]">Rezerviši</button>
              {sent && <span>Sto je zabeležen u demou.</span>}
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function Atelier({ interactive }: Props) {
  const [cart, setCart] = useState<string[]>([]);
  const products = [
    ["Lanena košulja", "120 €", "#ddd4c6"],
    ["Keramička vaza", "86 €", "#c9b7a2"],
    ["Vuneni šal", "64 €", "#8d9a8e"],
    ["Svećnjak", "42 €", "#e6d3b3"],
  ];
  return (
    <div className="h-full bg-white text-[#1c1c1c]">
      <div className="flex items-center justify-between border-b px-8 py-5 text-sm">
        <b className="tracking-[0.25em]">ATELIER GOODS</b>
        <span>Prodavnica</span>
        <span>Korpa {cart.length}</span>
      </div>
      <div className="grid grid-cols-4 gap-4 p-8">
        {products.map(([name, price, color]) => (
          <button key={name} className="text-left" onClick={() => interactive && setCart((items) => [...items, name])}>
            <div className="mb-3 aspect-[3/4] rounded-2xl" style={{ background: color }} />
            <p>{name}</p>
            <p className="text-sm text-neutral-500">{price}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Mira({ screen, interactive }: Props) {
  const works = ["01 Atlas", "02 Hotel Noir", "03 Kin"];
  const [active, setActive] = useState(works[0]);
  return (
    <div className="h-full bg-[#100806] text-[#f4ead8]">
      <div className="flex justify-between px-8 py-6 text-xs tracking-[0.25em] text-[#d4bc78]"><span>MIRA KOVAČ</span><span>PORTFOLIO</span></div>
      <div className="px-8">
        <h2 className="text-7xl leading-[0.9]">Dizajn koji ostaje u sećanju.</h2>
        <div className="mt-8 grid grid-cols-3 gap-3">
          {works.map((work, index) => (
            <button key={work} onClick={() => interactive && setActive(work)} className="h-52 border border-[#d4bc78]/30 text-left text-[#f4ead8]" style={{ background: ["#3a241c", "#1a0e0b", "#6e4e30"][index] }}>
              <span className="block p-4 text-2xl">{work}</span>
              {screen === "inner" && active === work && <span className="block px-4">Izabrani rad</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Forma({ interactive }: Props) {
  const [day, setDay] = useState("Ponedeljak");
  const classes: Record<string, string[]> = {
    Ponedeljak: ["07:00 Snaga", "18:30 Reformer"],
    Sreda: ["12:15 Mobilnost", "19:00 Kondicija"],
    Petak: ["08:00 Trčanje", "17:45 Joga"],
  };
  return (
    <div className="h-full bg-[#140f0c] text-[#f4ead8]">
      <div className="flex justify-between px-8 py-6"><b>FORMA</b><span className="tracking-[0.14em] text-[#d4bc78]">Članstvo</span></div>
      <div className="grid grid-cols-[1.2fr_0.8fr] gap-8 px-8">
        <div>
          <h2 className="text-6xl leading-none">Klub za ljude koji se vraćaju.</h2>
          <div className="mt-6 flex gap-3 text-sm">
            {Object.keys(classes).map((item) => (
              <button key={item} className={day === item ? "text-[#d4bc78]" : "text-[#f4ead8]/45"} onClick={() => interactive && setDay(item)}>{item}</button>
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            {classes[day].map((item) => <div key={item} className="border-b border-[#d4bc78]/20 py-3 text-2xl">{item}</div>)}
          </div>
        </div>
        <div className="rounded-[32px] border border-[#c9a56a]/45 bg-[linear-gradient(165deg,#3a2418_0%,#24150f_58%,#1a100c_100%)] p-6 text-[#f4ead8] shadow-[inset_0_1px_0_rgba(240,226,192,0.22)]">
          <p className="text-sm tracking-[0.16em] text-[#d4bc78]">Neograničeno</p>
          <p className="mt-6 text-6xl text-[#e6d09a]">79€</p>
          <p className="mt-4 text-[#f4ead8]/75">mesečno, bez ugovora u ovom demou</p>
        </div>
      </div>
    </div>
  );
}

function Luna({ interactive }: Props) {
  const [sent, setSent] = useState(false);
  return (
    <div className="h-full bg-[#f7e9e4] text-[#3a2430]">
      <div className="flex justify-between px-8 py-6 text-sm"><span>LUNA VOSS</span><span>Media kit</span></div>
      <div className="grid grid-cols-2 gap-8 px-8">
        <div className="h-[520px] rounded-[40px] bg-gradient-to-b from-[#e7b7c6] to-[#7d4e63]" />
        <div>
          <h2 className="text-6xl leading-[0.95]">Kultura, putovanja i tihi luksuz.</h2>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[["240k", "pratilaca"], ["4.8%", "angažovanje"], ["32", "kampanje"]].map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-white/60 p-4"><b className="block text-2xl">{n}</b><span className="text-xs">{l}</span></div>
            ))}
          </div>
          {interactive && (
            <button className="mt-6 rounded-full bg-[#3a2430] px-5 py-3 text-[#f7e9e4]" onClick={() => setSent(true)}>
              {sent ? "Upit je zabeležen" : "Zatraži saradnju"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Meridian({ screen, interactive }: Props) {
  const stories = [
    ["Kotor u februaru", "Grad je tiši, more tamnije, kafa bolja."],
    ["Voz do Trsta", "Četiri sata prozora i jedna sveska."],
    ["Pijaca u Lisabonu", "Boje koje ne stanu u paletu."],
  ];
  const [open, setOpen] = useState(0);
  return (
    <div className="h-full bg-[#f3ecdf] text-[#1e2a33]">
      <div className="flex justify-between border-b border-[#1e2a33]/10 px-8 py-5"><b>MERIDIAN</b><span>Putopis</span></div>
      <div className="grid grid-cols-[0.8fr_1.2fr] gap-8 px-8 py-8">
        <div>
          <p className="text-xs tracking-[0.25em] text-[#8a5a44]">TRAVEL JOURNAL</p>
          <h2 className="mt-3 text-5xl">Beleške sa puta, bez buke.</h2>
        </div>
        <div className="grid gap-3">
          {stories.map(([title, body], index) => (
            <button key={title} className="rounded-2xl bg-white p-5 text-left" onClick={() => interactive && setOpen(index)}>
              <b className="text-2xl">{title}</b>
              {(screen === "inner" || open === index) && <p className="mt-2 text-[#5d6b75]">{body}</p>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Kinfolk({ interactive }: Props) {
  const pieces = ["Nova tišina dizajna", "Papir i dalje vredi", "Portret jedne štamparije"];
  const [piece, setPiece] = useState(pieces[0]);
  return (
    <div className="h-full bg-[#f7f4ee] text-[#221c16]">
      <div className="border-b border-black/10 px-8 py-6 text-center">
        <p className="text-xs tracking-[0.4em]">ISSUE 18</p>
        <h2 className="text-5xl">Kinfolk Press</h2>
      </div>
      <div className="grid grid-cols-3 gap-6 px-8 py-8">
        {pieces.map((title) => (
          <button key={title} className="text-left" onClick={() => interactive && setPiece(title)}>
            <div className="mb-3 h-40 bg-[#ddd4c4]" />
            <p className="text-2xl leading-tight">{title}</p>
            {piece === title && <p className="mt-2 text-sm text-black/60">Otvoren tekst u ovom izdanju.</p>}
          </button>
        ))}
      </div>
    </div>
  );
}

function Lumen({ interactive }: Props) {
  const [booked, setBooked] = useState(false);
  return (
    <div className="h-full bg-[#14222b] text-[#f6f1e7]">
      <div className="flex justify-between px-8 py-6"><b className="tracking-[0.2em]">HOTEL LUMEN</b><span>Sobe</span></div>
      <div className="px-8">
        <h2 className="max-w-3xl text-6xl leading-[0.95]">Svetlost na kamenoj obali.</h2>
        <div className="mt-8 grid grid-cols-3 gap-3">
          {["Soba sa morem", "Apartman", "Suite"].map((room, index) => (
            <div key={room} className="h-48 rounded-3xl p-4" style={{ background: ["#c98452", "#d9c7a5", "#315c6e"][index], color: "#14222b" }}>
              <b>{room}</b>
            </div>
          ))}
        </div>
        {interactive && (
          <button className="mt-6 rounded-full bg-[#f6f1e7] px-5 py-3 text-[#14222b]" onClick={() => setBooked(true)}>
            {booked ? "Upit za boravak je sačuvan" : "Proveri dostupnost"}
          </button>
        )}
      </div>
    </div>
  );
}

function Clara({ interactive }: Props) {
  const [joined, setJoined] = useState(false);
  return (
    <div className="grid h-full place-items-center bg-[#f2f2f0] text-[#111] text-center">
      <div>
        <p className="text-xs tracking-[0.35em]">CLARA LAUNCH</p>
        <h2 className="mt-4 text-7xl">Jedna stvar. Dobro.</h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-black/60">Landing za proizvod koji još nema šum. Lista čekanja, jedna priča, jedan poziv.</p>
        {interactive && (
          <form className="mt-6 flex justify-center gap-2" onSubmit={(event) => { event.preventDefault(); setJoined(true); }}>
            <input className="rounded-full border px-4 py-2" placeholder="E-pošta" aria-label="E-pošta" />
            <button className="rounded-full bg-black px-4 py-2 text-white">{joined ? "Prijavljeni ste" : "Uđi na listu"}</button>
          </form>
        )}
      </div>
    </div>
  );
}

function Signal({ interactive }: Props) {
  const [alt, setAlt] = useState(false);
  return (
    <div className="h-full p-8" style={{ background: alt ? "#111" : "#efe7d2", color: alt ? "#efe7d2" : "#111" }}>
      <div className="flex justify-between text-xs tracking-[0.3em]"><span>SIGNAL ROOM</span><span>STUDIO</span></div>
      <h2 className="mt-10 max-w-4xl text-7xl leading-[0.88]">Eksperiment koji se da koristiti.</h2>
      <div className="mt-8 grid grid-cols-6 gap-2">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="h-20" style={{ background: index % 3 === 0 ? "#e85d04" : index % 3 === 1 ? "#111" : "#f4f1ea", opacity: alt ? 0.85 : 1 }} />
        ))}
      </div>
      {interactive && (
        <button className="mt-6 border px-4 py-2" onClick={() => setAlt((value) => !value)}>Promeni raspoloženje</button>
      )}
    </div>
  );
}
