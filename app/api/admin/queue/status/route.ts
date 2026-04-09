import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";

export async function POST(req: Request) {
  const { id, status } = await req.json();
  const admin = createAdminClient();
  const { error } = await admin.from("queue_entries").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
