import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";

const ALLOWED = new Set(["waiting", "cooking", "done"]);

export async function POST(req: Request) {
  const { id, status } = await req.json();
  if (!id || !ALLOWED.has(status)) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // Only the owner of the entry can update their own status.
  const { data: entry } = await admin
    .from("queue_entries")
    .select("id,profile_id")
    .eq("id", id)
    .maybeSingle();
  if (!entry) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (entry.profile_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { error } = await admin.from("queue_entries").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
