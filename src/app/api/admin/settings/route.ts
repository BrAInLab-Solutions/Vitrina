import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError, sameOrigin } from "@/lib/http";
import { audit } from "@/lib/notify";
import { firstZodError, settingsSchema } from "@/lib/validators";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Zahtev nije dozvoljen.", 403);
  try {
    const admin = await requireAdmin();
    const parsed = settingsSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError(firstZodError(parsed.error));
    await prisma.platformSetting.upsert({
      where: { id: "default" },
      update: {
        commissionRate: parsed.data.commissionPercent / 100,
        antiSnipeWindowMinutes: parsed.data.antiSnipeWindowMinutes,
        antiSnipeExtendMinutes: parsed.data.antiSnipeExtendMinutes,
        maxExtensions: parsed.data.maxExtensions,
      },
      create: { id: "default", commissionRate: parsed.data.commissionPercent / 100 },
    });
    await audit(admin.id, "settings.update", "settings", "default", parsed.data);
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Nemate ovlašćenje.", 403);
  }
}
