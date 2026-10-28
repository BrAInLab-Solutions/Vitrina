import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookie, signSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { clientIp, jsonError, rateLimit, sameOrigin } from "@/lib/http";
import { firstZodError, loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Zahtev nije dozvoljen.", 403);
  const limit = rateLimit(`login:${clientIp(request)}`, 8, 10 * 60 * 1000);
  if (!limit.ok) return jsonError("Previše pokušaja. Sačekajte pa pokušajte ponovo.", 429);

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(firstZodError(parsed.error));

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  const valid = user ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid) return jsonError("Pogrešna e-pošta ili lozinka.", 401);
  if (user.disabled) return jsonError("Nalog je privremeno onemogućen.", 403);

  const token = await signSession({ id: user.id, email: user.email, name: user.name, role: user.role });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, sessionCookie());
  return response;
}