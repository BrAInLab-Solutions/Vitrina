import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Unesite ime i prezime.").max(80),
  email: z.string().trim().email("Unesite ispravnu e-poštu.").max(120),
  password: z.string().min(8, "Lozinka mora imati najmanje 8 karaktera.").max(200),
  isSeller: z.boolean().optional().default(false),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Unesite ispravnu e-poštu.").max(120),
  password: z.string().min(1, "Unesite lozinku.").max(200),
});

export const bidSchema = z.object({
  amountEuro: z.coerce.number().int("Iznos mora biti ceo broj evra.").positive("Iznos mora biti veći od nule."),
});

export const listingSchema = z.object({
  title: z.string().trim().min(4, "Naziv je prekratak.").max(80),
  summary: z.string().trim().min(20, "Kratak opis treba da ima bar 20 karaktera.").max(200),
  description: z.string().trim().min(40, "Opis treba da ima bar 40 karaktera.").max(5000),
  categorySlug: z.string().trim().min(2).max(40),
  startPriceEuro: z.coerce.number().int().min(50, "Početna cena je najmanje 50 €.").max(1_000_000),
  durationHours: z.coerce.number().int(),
  demoUrl: z.string().trim().max(300).optional().default(""),
  coverImageUrl: z.string().trim().max(400).optional().default(""),
  features: z.array(z.string().trim().min(2).max(80)).min(1, "Navedite bar jednu funkcionalnost.").max(12),
  technologies: z.array(z.string().trim().min(1).max(40)).min(1, "Navedite bar jednu tehnologiju.").max(12),
  customization: z.string().trim().min(10, "Opišite mogućnosti prilagođavanja.").max(1500),
  deliverables: z.string().trim().min(10, "Navedite šta kupac dobija.").max(1500),
  transferTerms: z.string().trim().min(10, "Opišite prenos prava.").max(1500),
  includesDomain: z.boolean().optional().default(false),
  includesHosting: z.boolean().optional().default(false),
  includesCode: z.boolean().optional().default(true),
  previewKey: z.string().trim().max(40).optional().default("signal"),
  ownership: z.enum(["HOUSE", "EXTERNAL"]).optional(),
});

export const disputeSchema = z.object({
  transactionId: z.string().min(5),
  reason: z.string().trim().min(15, "Opišite problem malo detaljnije.").max(2000),
});

export const settingsSchema = z.object({
  commissionPercent: z.coerce.number().min(1, "Provizija je najmanje 1%.").max(30, "Provizija je najviše 30%."),
  antiSnipeWindowMinutes: z.coerce.number().int().min(1).max(15),
  antiSnipeExtendMinutes: z.coerce.number().int().min(1).max(30),
  maxExtensions: z.coerce.number().int().min(0).max(20),
});

export const categorySchema = z.object({
  name: z.string().trim().min(3).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Slug sme da sadrži samo mala slova, brojeve i crtu."),
  blurb: z.string().trim().max(180).optional().default(""),
});

export const txUpdateSchema = z
  .object({
    paymentStatus: z.enum(["AWAITING", "PAID", "FAILED", "REFUNDED", "CANCELLED"]).optional(),
    handoverStatus: z.enum(["PENDING", "IN_PROGRESS", "DELIVERED", "BLOCKED"]).optional(),
    payoutStatus: z.enum(["NOT_APPLICABLE", "PENDING", "PROCESSING", "PAID"]).optional(),
    processorFeeEuro: z.coerce.number().int().min(0).max(100_000).optional(),
    adminNote: z.string().trim().max(1000).optional(),
  })
  .strict();

export function firstZodError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Proverite unete podatke.";
}
