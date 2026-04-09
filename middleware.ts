import { NextResponse, type NextRequest } from "next/server";

// Gate /admin and /api/admin routes with a signed cookie.
// The cookie is set by /api/admin/auth after the user enters ADMIN_SECRET.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsGate =
    (pathname.startsWith("/admin") && pathname !== "/admin/login") ||
    (pathname.startsWith("/api/admin") && pathname !== "/api/admin/auth");

  if (!needsGate) return NextResponse.next();

  const cookie = req.cookies.get("rl_admin")?.value;
  if (cookie && cookie === process.env.ADMIN_SECRET) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
