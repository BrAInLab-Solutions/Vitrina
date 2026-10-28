import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookie, signSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { clientIp, jsonError, rateLimit, sameOrigin } from "@/lib/http";
import { firstZodError, registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Zahtev nije dozvoljen.", 403);
  const limit = rateLimit(`register:${clientIp(request)}`, 5, 60 * 60 * 1000);
  if (!limit.ok) return jsonError("Previše registracija sa ove adrese.", 429);

  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(firstZodError(parsed.error));
  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return jsonError("Nalog sa ovom e-poštom već postoji.");

  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      isSeller: parsed.data.isSeller,
    },
  });
  const token = await signSession({ id: user.id, email: user.email, name: user.name, role: user.role });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, sessionCookie());
  return response;
}
