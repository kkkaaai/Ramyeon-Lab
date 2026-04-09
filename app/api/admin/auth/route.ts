import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();
  if (!password || password !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("rl_admin", process.env.ADMIN_SECRET!, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8h
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("rl_admin", "", { path: "/", maxAge: 0 });
  return res;
}
