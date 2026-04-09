import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";

export async function POST(req: Request) {
  const { session_id } = await req.json();
  if (!session_id) return NextResponse.json({ error: "missing session_id" }, { status: 400 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // Verify profile exists
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) {
    return NextResponse.json({ error: "profile not found" }, { status: 403 });
  }

  // Check if already in queue for this session.
  // - waiting/cooking  → block, user is still active in the queue
  // - done             → clear it so the user can re-queue after finishing
  const { data: existing } = await admin
    .from("queue_entries")
    .select("id,status")
    .eq("session_id", session_id)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (existing) {
    if (existing.status === "done") {
      await admin.from("queue_entries").delete().eq("id", existing.id);
    } else {
      return NextResponse.json(
        { error: "already in queue", id: existing.id },
        { status: 409 }
      );
    }
  }

  // Find max position
  const { data: last } = await admin
    .from("queue_entries")
    .select("position")
    .eq("session_id", session_id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPosition = (last?.position || 0) + 1;

  const { data, error } = await admin
    .from("queue_entries")
    .insert({
      session_id,
      profile_id: user.id,
      position: nextPosition,
      status: "waiting",
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, entry: data });
}
