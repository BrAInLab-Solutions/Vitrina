import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError, sameOrigin } from "@/lib/http";
import { audit } from "@/lib/notify";
import { categorySchema, firstZodError } from "@/lib/validators";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Zahtev nije dozvoljen.", 403);
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return jsonError("Nemate ovlašćenje.", 403);
  }
  const parsed = categorySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(firstZodError(parsed.error));
  try {
    const category = await prisma.category.create({ data: parsed.data });
    await audit(admin.id, "category.create", "category", category.id, parsed.data);
    return NextResponse.json({ id: category.id });
  } catch {
    return jsonError("Kategorija nije sačuvana. Proverite da slug već ne postoji.");
  }
}
