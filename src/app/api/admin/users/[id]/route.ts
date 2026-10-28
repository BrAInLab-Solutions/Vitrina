import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError, sameOrigin } from "@/lib/http";
import { audit } from "@/lib/notify";

const schema = z
  .object({
    sellerVerified: z.boolean().optional(),
    isSeller: z.boolean().optional(),
    disabled: z.boolean().optional(),
  })
  .strict();

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return jsonError("Zahtev nije dozvoljen.", 403);
  try {
    const admin = await requireAdmin();
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("Podaci nisu ispravni.");
    const { id } = await context.params;
    if (id === admin.id && parsed.data.disabled) return jsonError("Ne možete da onemogućite sopstveni nalog.");
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return jsonError("Korisnik nije pronađen.", 404);
    await prisma.user.update({ where: { id }, data: parsed.data });
    await audit(admin.id, "user.update", "user", id, parsed.data);
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Nemate ovlašćenje.", 403);
  }
}
