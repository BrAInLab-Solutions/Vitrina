import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { sameOrigin, jsonError } from "@/lib/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Zahtev nije dozvoljen.", 403);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
