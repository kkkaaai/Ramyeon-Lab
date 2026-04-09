import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";

export async function POST(req: Request) {
  const { email, password, inviteCode } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const required = process.env.INVITE_CODE;
  if (required) {
    if (!inviteCode || inviteCode !== required) {
      return NextResponse.json({ error: "Invalid invite code." }, { status: 401 });
    }
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, user_id: data.user?.id });
}
