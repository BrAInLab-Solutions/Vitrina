import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError, sameOrigin } from "@/lib/http";
import { audit } from "@/lib/notify";

const rename = z.object({ name: z.string().trim().min(3).max(80) });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return jsonError("Zahtev nije dozvoljen.", 403);
  try {
    const admin = await requireAdmin();
    const parsed = rename.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("Naziv nije ispravan.");
    const { id } = await context.params;
    await prisma.category.update({ where: { id }, data: { name: parsed.data.name } });
    await audit(admin.id, "category.rename", "category", id, parsed.data);
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Nemate ovlašćenje.", 403);
  }
}
