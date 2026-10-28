import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("vitrina_session")?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/prijava";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch {
    const url = request.nextUrl.clone();
    url.pathname = "/prijava";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/nalog/:path*", "/prodaj", "/placanje/:path*"],
};
