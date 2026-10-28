import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE = "vitrina_session";

export type SessionPayload = {
  id: string;
  email: string;
  name: string;
  role: string;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET nije podešen.");
  return new TextEncoder().encode(value);
}

export async function signSession(user: SessionPayload) {
  return new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function readSession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.name !== "string") return null;
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: typeof payload.role === "string" ? payload.role : "USER",
    };
  } catch {
    return null;
  }
}

export async function getSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readSession(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user || user.disabled) return null;
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const error = new Error("AUTH");
    throw error;
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    const error = new Error("FORBIDDEN");
    throw error;
  }
  return user;
}

export function sessionCookie() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
