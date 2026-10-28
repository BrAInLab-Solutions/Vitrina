import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  ["poslovni", "Poslovni sajtovi", "Firme, studiji i usluge sa jasnom ponudom."],
  ["ecommerce", "E-commerce prodavnice", "Katalog, proizvod i put do kupovine."],
  ["portfolio", "Portfolio sajtovi", "Radovi koji se pamte po kadru i tipografiji."],
  ["landing", "Landing stranice", "Jedna priča i jedan poziv na akciju."],
  ["saas", "SaaS platforme", "Proizvod, cene, dokaz i prijava."],
  ["blog", "Blogovi i magazini", "Tekst, izdanja i sporije čitanje."],
  ["ugostiteljstvo", "Sajtovi za restorane i hotele", "Meni, sobe, atmosfera i rezervacija."],
  ["influenseri", "Sajtovi za influensere", "Lični brend, brojke i saradnje."],
  ["kreativno", "Kreativni i eksperimentalni projekti", "Radovi koji ne liče na šablon."],
] as const;

async function main() {
  await prisma.dispute.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.platformSetting.deleteMany();

  await prisma.platformSetting.create({ data: { id: "default", commissionRate: 0.1 } });
  const passwordHash = await bcrypt.hash("Vitrina2026!", 10);

  const admin = await user("admin@vitrina.test", "Admin Vitrina", "ADMIN", false, true, "Vodi platformu i proveru oglasa.");
  const studio = await user("studio@vitrina.test", "Vitrina Studio", "USER", true, true, "Naša firma. Pravi originalne sajtove i zadržava punu cenu prodaje.");
  const mira = await user("mira@vitrina.test", "Mira Kovač", "USER", true, true, "Dizajnerka. Prodaje gotove portfolio sisteme.");
  const luna = await user("luna@vitrina.test", "Luna Voss", "USER", true, true, "Kreatorka. Sajt je njen medijski kit.");
  const nina = await user("nina@vitrina.test", "Nina Horvat", "USER", true, true, "Urednica putopisa i digitalnih izdanja.");
  const petar = await user("petar@vitrina.test", "Petar Nedić", "USER", true, false, "Nezavisni autor eksperimentalnih sajtova.");
  const ana = await user("ana@vitrina.test", "Ana Petrović", "USER", false, false, "");
  const jovan = await user("jovan@vitrina.test", "Jovan Kostić", "USER", false, false, "");

  async function user(email: string, name: string, role: string, isSeller: boolean, sellerVerified: boolean, bio: string) {
    return prisma.user.create({ data: { email, name, role, isSeller, sellerVerified, bio, passwordHash } });
  }

  const categoryId = new Map<string, string>();
  for (const [slug, name, blurb] of categories) {
    const row = await prisma.category.create({ data: { slug, name, blurb } });
    categoryId.set(slug, row.id);
  }

  const imageSet = [
    { label: "Naslovna", sort: 0 },
    { label: "Unutrašnja strana", sort: 1 },
    { label: "Mobilni prikaz", sort: 2 },
  ];

  async function active(input: {
    slug: string;
    title: string;
    summary: string;
    description: string;
    category: string;
    sellerId: string;
    ownership: "HOUSE" | "EXTERNAL";
    previewKey: string;
    startPrice: number;
    endsInMinutes: number;
    features: string[];
    technologies: string[];
    customization: string;
    deliverables: string;
    transferTerms: string;
    includesDomain?: boolean;
    includesHosting?: boolean;
    bids?: { userId: string; amount: number; minutesAgo: number }[];
  }) {
    const bids = input.bids ?? [];
    const current = bids.reduce((max, bid) => Math.max(max, bid.amount), 0);
    const listing = await prisma.listing.create({
      data: {
        slug: input.slug,
        title: input.title,
        summary: input.summary,
        description: input.description,
        categoryId: categoryId.get(input.category)!,
        sellerId: input.sellerId,
        ownership: input.ownership,
        status: "ACTIVE",
        startPrice: input.startPrice,
        currentBid: current,
        leadingPrice: current || input.startPrice,
        bidCount: bids.length,
        startsAt: new Date(Date.now() - 20 * 3600 * 1000),
        endsAt: new Date(Date.now() + input.endsInMinutes * 60 * 1000),
        durationHours: 72,
        demoUrl: `/demo/${input.slug}`,
        previewKey: input.previewKey,
        features: JSON.stringify(input.features),
        technologies: JSON.stringify(input.technologies),
        customization: input.customization,
        deliverables: input.deliverables,
        transferTerms: input.transferTerms,
        includesDomain: input.includesDomain ?? false,
        includesHosting: input.includesHosting ?? false,
        includesCode: true,
        isDemo: true,
        images: { create: imageSet },
      },
    });
    for (const bid of bids) {
      await prisma.bid.create({
        data: {
          listingId: listing.id,
          userId: bid.userId,
          amount: bid.amount,
          createdAt: new Date(Date.now() - bid.minutesAgo * 60 * 1000),
        },
      });
    }
    return listing;
  }

  const common = {
    customization: "Boje, tipografija, tekstovi i redosled sekcija menjaju se bez lomljenja rasporeda.",
    deliverables: "Dobijate izvorni kod, dizajn sistem i kratko uputstvo za pokretanje. Resursi su oni za koje postoji pravo prenosa.",
    transferTerms: "Kupac dobija pravo da koristi i menja projekat za sebe ili klijenta. Autor ne zadržava pravo dalje prodaje istog koda.",
  };

  const northline = await active({
    slug: "northline",
    title: "Northline",
    summary: "Premium SaaS landing za B2B analitiku, sa cenovnikom, dokazom i čistim prikazom proizvoda.",
    description: "Northline je tamna, mirna prodajna strana za softver koji meri prihod. Hero drži jednu rečenicu, pored nje je proizvodni grafikon, ispod su cene i pitanja. Namenjen je firmi koja hoće da izgleda ozbiljno pre prvog razgovora sa kupcem.",
    category: "saas",
    sellerId: studio.id,
    ownership: "HOUSE",
    previewKey: "northline",
    startPrice: 180000,
    endsInMinutes: 50,
    features: ["Hero sa proizvodnim prikazom", "Cenovnik sa mesečnim i godišnjim preklopom", "Red klijenata", "Česta pitanja", "Poziv na demo"],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    ...common,
    bids: [
      { userId: ana.id, amount: 190000, minutesAgo: 400 },
      { userId: jovan.id, amount: 210000, minutesAgo: 220 },
      { userId: ana.id, amount: 245000, minutesAgo: 40 },
    ],
  });

  await active({
    slug: "brasa",
    title: "Brasa",
    summary: "Moderan sajt restorana: vatra, meni i rezervacija stola bez suvišnog šuma.",
    description: "Brasa izgleda kao večernji meni odštampan na toplom papiru. Veliko ime, dve boje hrane i forma za sto. Gost može da filtrira jela i da pošalje upit za rezervaciju u samom demou.",
    category: "ugostiteljstvo",
    sellerId: studio.id,
    ownership: "HOUSE",
    previewKey: "brasa",
    startPrice: 95000,
    endsInMinutes: 300,
    features: ["Meni po kategorijama", "Rezervacija stola", "Radno vreme", "Priča kuhinje"],
    technologies: ["Next.js", "TypeScript"],
    ...common,
    bids: [
      { userId: jovan.id, amount: 110000, minutesAgo: 500 },
      { userId: ana.id, amount: 140000, minutesAgo: 80 },
    ],
  });

  await active({
    slug: "atelier-goods",
    title: "Atelier Goods",
    summary: "E-commerce za malu radionicu: proizvodi, cene i korpa koja se puni odmah.",
    description: "Atelier Goods je bela, urednička prodavnica. Četiri predmeta, jasna cena i korpa koja broji klik. Nema lažnog plaćanja. Kupac vidi kako katalog diše pre nego što licitira.",
    category: "ecommerce",
    sellerId: studio.id,
    ownership: "HOUSE",
    previewKey: "atelier",
    startPrice: 220000,
    endsInMinutes: 60 * 48,
    features: ["Mreža proizvoda", "Cena i naziv", "Dodavanje u korpu", "Brojač korpe"],
    technologies: ["Next.js", "React"],
    ...common,
    bids: [
      { userId: ana.id, amount: 240000, minutesAgo: 800 },
      { userId: jovan.id, amount: 275000, minutesAgo: 300 },
      { userId: ana.id, amount: 310000, minutesAgo: 90 },
    ],
  });

  await active({
    slug: "mira-kovac",
    title: "Mira Kovač",
    summary: "Portfolio dizajnerke sa krupnim radovima i izborom studije slučaja.",
    description: "Stranica počinje imenom i rečenicom, pa tri rada koja se otvaraju. Namenjena je autoru koji želi da klijent vidi ukus pre nego što vidi biografiju.",
    category: "portfolio",
    sellerId: mira.id,
    ownership: "EXTERNAL",
    previewKey: "mira",
    startPrice: 60000,
    endsInMinutes: 60 * 72,
    features: ["Izbor radova", "Studija slučaja", "Kontakt autora"],
    technologies: ["Next.js", "CSS"],
    ...common,
    bids: [
      { userId: jovan.id, amount: 70000, minutesAgo: 600 },
      { userId: ana.id, amount: 85000, minutesAgo: 120 },
    ],
  });

  await active({
    slug: "forma-club",
    title: "Forma Club",
    summary: "Sajt fitnes centra sa rasporedom treninga i članarinom.",
    description: "Forma je tamna i oštra. Raspored se menja po danu, članarina stoji kao jedan broj. Klub izgleda živo i pre nego što se upiše prvi član.",
    category: "poslovni",
    sellerId: studio.id,
    ownership: "HOUSE",
    previewKey: "forma",
    startPrice: 120000,
    endsInMinutes: 60 * 24 * 6,
    features: ["Raspored po danima", "Kartica članarine", "Poziv na dolazak"],
    technologies: ["Next.js", "TypeScript"],
    ...common,
  });

  const lunaListing = await active({
    slug: "luna-voss",
    title: "Luna Voss",
    summary: "Sajt influenserke: portret, brojke publike i upit za saradnju.",
    description: "Luna Voss je mek, urednički sajt za kreatorku. Brojke nisu skrivene, a brend ostaje tih. U demou se šalje upit za kampanju, bez slanja prave poruke.",
    category: "influenseri",
    sellerId: luna.id,
    ownership: "EXTERNAL",
    previewKey: "luna",
    startPrice: 150000,
    endsInMinutes: 60 * 36,
    features: ["Medijski kit", "Statistika publike", "Upit za saradnju"],
    technologies: ["Next.js", "React"],
    ...common,
    bids: [
      { userId: ana.id, amount: 170000, minutesAgo: 900 },
      { userId: jovan.id, amount: 210000, minutesAgo: 240 },
      { userId: ana.id, amount: 260000, minutesAgo: 30 },
    ],
  });

  await active({
    slug: "meridian",
    title: "Meridian",
    summary: "Travel blog sa kratkim pričama koje se otvaraju na istoj strani.",
    description: "Meridian je sveska sa puta. Tri beleške, peščana pozadina i dovoljno beline da se tekst čita. Nema oglasa ni iskačućih prozora.",
    category: "blog",
    sellerId: nina.id,
    ownership: "EXTERNAL",
    previewKey: "meridian",
    startPrice: 70000,
    endsInMinutes: 60 * 24 * 8,
    features: ["Lista priča", "Otvaranje zapisa", "Masthead putopisa"],
    technologies: ["Next.js"],
    ...common,
  });

  await active({
    slug: "kinfolk-press",
    title: "Kinfolk Press",
    summary: "Kreativni digitalni magazin: broj izdanja, naslovi i tekst koji se bira.",
    description: "Kinfolk Press liči na štampano izdanje prebačeno na ekran. Masthead, tri teksta i osećaj papira. Namenjen je redakciji koja hoće sporiji ritam od portala.",
    category: "blog",
    sellerId: nina.id,
    ownership: "EXTERNAL",
    previewKey: "kinfolk",
    startPrice: 110000,
    endsInMinutes: 60 * 24 * 4,
    features: ["Naslovnica izdanja", "Tri teksta", "Izbor članka"],
    technologies: ["Next.js", "CSS"],
    ...common,
    bids: [
      { userId: jovan.id, amount: 130000, minutesAgo: 700 },
      { userId: ana.id, amount: 175000, minutesAgo: 150 },
    ],
  });

  await active({
    slug: "hotel-lumen",
    title: "Hotel Lumen",
    summary: "Hotel na obali: sobe, svetlost i upit za boravak.",
    description: "Lumen je kratak hotelski sajt. Tri sobe, jedna rečenica o mestu i dugme za dostupnost. Gost vidi atmosferu pre formulara.",
    category: "ugostiteljstvo",
    sellerId: studio.id,
    ownership: "HOUSE",
    previewKey: "lumen",
    startPrice: 200000,
    endsInMinutes: 100,
    features: ["Pregled soba", "Upit za boravak", "Uvodna priča"],
    technologies: ["Next.js"],
    ...common,
    includesDomain: true,
    bids: [{ userId: jovan.id, amount: 230000, minutesAgo: 25 }],
  });

  await active({
    slug: "clara-launch",
    title: "Clara Launch",
    summary: "Landing stranica za jedan proizvod i jednu listu čekanja.",
    description: "Clara je skoro prazna, namerno. Velika rečenica, kratko objašnjenje i polje za e-poštu. Dobra proba za brend koji još nema šta da sakrije.",
    category: "landing",
    sellerId: studio.id,
    ownership: "HOUSE",
    previewKey: "clara",
    startPrice: 80000,
    endsInMinutes: 60 * 24 * 5,
    features: ["Jedan naslov", "Lista čekanja", "Kratko objašnjenje"],
    technologies: ["Next.js"],
    ...common,
  });

  await active({
    slug: "signal-room",
    title: "Signal Room",
    summary: "Eksperimentalni studio sajt koji menja raspoloženje jednim klikom.",
    description: "Signal Room je mreža boja i krupna rečenica. Nije šablon za firmu. Služi autoru koji želi da pokaže ukus pre pregovora.",
    category: "kreativno",
    sellerId: petar.id,
    ownership: "EXTERNAL",
    previewKey: "signal",
    startPrice: 45000,
    endsInMinutes: 60 * 14,
    features: ["Promena teme", "Mreža blokova", "Studio potpis"],
    technologies: ["React", "CSS"],
    ...common,
  });

  await prisma.favorite.createMany({
    data: [
      { userId: ana.id, listingId: northline.id },
      { userId: ana.id, listingId: lunaListing.id },
    ],
  });

  await prisma.listing.create({
    data: {
      slug: "bistro-nota",
      title: "Bistro Nota",
      summary: "Mali bistro sajt koji čeka administratorsku proveru pre objave.",
      description: "Nota je nacrt za bistro sa kratkim menijem i rezervacijom. Tekst je dovoljan za pregled, a aukcija još nije počela.",
      categoryId: categoryId.get("ugostiteljstvo")!,
      sellerId: petar.id,
      ownership: "EXTERNAL",
      status: "PENDING",
      startPrice: 55000,
      leadingPrice: 55000,
      durationHours: 72,
      demoUrl: "/demo/bistro-nota",
      previewKey: "brasa",
      features: JSON.stringify(["Meni", "Rezervacija"]),
      technologies: JSON.stringify(["Next.js"]),
      customization: common.customization,
      deliverables: common.deliverables,
      transferTerms: common.transferTerms,
      isDemo: true,
      images: { create: imageSet },
    },
  });

  await prisma.listing.create({
    data: {
      slug: "galerija-skica",
      title: "Galerija skica",
      summary: "Nacrt portfolio strane koji još nije poslat na odobrenje.",
      description: "Ovo je sačuvan nacrt. Autor može da ga dopuni i tek onda pošalje administratoru.",
      categoryId: categoryId.get("portfolio")!,
      sellerId: mira.id,
      ownership: "EXTERNAL",
      status: "DRAFT",
      startPrice: 40000,
      leadingPrice: 40000,
      durationHours: 48,
      previewKey: "mira",
      features: JSON.stringify(["Radovi"]),
      technologies: JSON.stringify(["CSS"]),
      customization: common.customization,
      deliverables: common.deliverables,
      transferTerms: common.transferTerms,
      isDemo: true,
      images: { create: imageSet },
    },
  });

  const archive = await prisma.listing.create({
    data: {
      slug: "arhiva-studio",
      title: "Arhiva Studio",
      summary: "Završena testna prodaja sajta naše firme.",
      description: "Ova aukcija je zatvorena u testnim podacima da bi finansijski panel imao primer pune cene koja pripada firmi.",
      categoryId: categoryId.get("poslovni")!,
      sellerId: studio.id,
      ownership: "HOUSE",
      status: "ENDED_SOLD",
      startPrice: 250000,
      currentBid: 320000,
      leadingPrice: 320000,
      bidCount: 1,
      startsAt: daysAgo(12),
      endsAt: daysAgo(10),
      winnerId: ana.id,
      durationHours: 72,
      demoUrl: "/demo/arhiva-studio",
      previewKey: "clara",
      features: JSON.stringify(["Naslovna", "Usluge"]),
      technologies: JSON.stringify(["Next.js"]),
      customization: common.customization,
      deliverables: common.deliverables,
      transferTerms: common.transferTerms,
      isDemo: true,
      images: { create: imageSet },
    },
  });
  await prisma.bid.create({ data: { listingId: archive.id, userId: ana.id, amount: 320000, createdAt: daysAgo(10) } });
  await prisma.transaction.create({
    data: {
      listingId: archive.id,
      buyerId: ana.id,
      sellerId: studio.id,
      finalPrice: 320000,
      commissionRate: 1,
      platformRevenue: 320000,
      sellerPayout: 0,
      ownership: "HOUSE",
      paymentStatus: "PAID",
      handoverStatus: "DELIVERED",
      payoutStatus: "NOT_APPLICABLE",
      paymentRef: "VIT-DEMO1",
      isDemo: true,
      createdAt: daysAgo(10),
      paidAt: daysAgo(9),
    },
  });

  const shop = await prisma.listing.create({
    data: {
      slug: "primer-radnje",
      title: "Primer radnje",
      summary: "Završena testna prodaja eksternog sajta za tačno 1.000 €.",
      description: "Primer pokazuje obračun: kupac plaća 1.000 €, kreator dobija 900 €, platforma zadržava 100 €. Sve je označeno kao test.",
      categoryId: categoryId.get("ecommerce")!,
      sellerId: nina.id,
      ownership: "EXTERNAL",
      status: "ENDED_SOLD",
      startPrice: 70000,
      currentBid: 100000,
      leadingPrice: 100000,
      bidCount: 2,
      startsAt: daysAgo(6),
      endsAt: daysAgo(4),
      winnerId: jovan.id,
      durationHours: 48,
      demoUrl: "/demo/primer-radnje",
      previewKey: "atelier",
      features: JSON.stringify(["Katalog", "Korpa"]),
      technologies: JSON.stringify(["Next.js"]),
      customization: common.customization,
      deliverables: common.deliverables,
      transferTerms: common.transferTerms,
      isDemo: true,
      images: { create: imageSet },
    },
  });
  await prisma.bid.create({ data: { listingId: shop.id, userId: ana.id, amount: 80000, createdAt: daysAgo(5) } });
  await prisma.bid.create({ data: { listingId: shop.id, userId: jovan.id, amount: 100000, createdAt: daysAgo(4) } });
  const shopTx = await prisma.transaction.create({
    data: {
      listingId: shop.id,
      buyerId: jovan.id,
      sellerId: nina.id,
      finalPrice: 100000,
      commissionRate: 0.1,
      platformRevenue: 10000,
      sellerPayout: 90000,
      ownership: "EXTERNAL",
      paymentStatus: "PAID",
      handoverStatus: "DELIVERED",
      payoutStatus: "PAID",
      paymentRef: "VIT-DEMO2",
      isDemo: true,
      createdAt: daysAgo(4),
      paidAt: daysAgo(3),
    },
  });
  await prisma.dispute.create({
    data: {
      transactionId: shopTx.id,
      userId: jovan.id,
      reason: "Testna prijava: kupac u demou proverava tok spora. Ovo nije stvaran zahtev i ne predstavlja problem sa isporukom.",
      status: "OPEN",
    },
  });

  const quiet = await prisma.listing.create({
    data: {
      slug: "tiha-aukcija",
      title: "Tiha aukcija",
      summary: "Testna aukcija koja se završila bez ponuda i ostala neprodata.",
      description: "Niko nije licitirao. Sajt je neprodat, bez transakcije i bez pobednika.",
      categoryId: categoryId.get("landing")!,
      sellerId: studio.id,
      ownership: "HOUSE",
      status: "ENDED_UNSOLD",
      startPrice: 50000,
      leadingPrice: 50000,
      startsAt: daysAgo(8),
      endsAt: daysAgo(6),
      durationHours: 48,
      demoUrl: "/demo/tiha-aukcija",
      previewKey: "clara",
      features: JSON.stringify(["Naslov"]),
      technologies: JSON.stringify(["HTML"]),
      customization: common.customization,
      deliverables: common.deliverables,
      transferTerms: common.transferTerms,
      isDemo: true,
      images: { create: imageSet },
    },
  });

  await prisma.notification.create({
    data: {
      userId: ana.id,
      type: "NEW_BID",
      title: "Testno obaveštenje",
      body: "Ovo je veštačka poruka u sandučetu Ane, da bi pregled obaveštenja imao sadržaj. Nije stvarna licitacija.",
      href: `/aukcije/${northline.slug}`,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "seed",
      entity: "system",
      meta: JSON.stringify({ note: "Učitani su testni projekti, ponude i dve testne transakcije." }),
    },
  });

  void quiet;
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 3600 * 1000);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
