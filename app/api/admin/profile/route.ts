import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";

export async function PATCH(req: Request) {
  const { id, ...fields } = await req.json();
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update(fields).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Also delete the auth user
  await admin.auth.admin.deleteUser(id).catch(() => {});
  return NextResponse.json({ ok: true });
}
