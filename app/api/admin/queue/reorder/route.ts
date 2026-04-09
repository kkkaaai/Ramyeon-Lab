import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";

export async function POST(req: Request) {
  const { id, direction } = await req.json();
  const admin = createAdminClient();
  const { data: entry } = await admin.from("queue_entries").select("*").eq("id", id).maybeSingle();
  if (!entry) return NextResponse.json({ error: "not found" }, { status: 404 });
  const neighborPos = direction === "up" ? entry.position - 1 : entry.position + 1;
  const { data: neighbor } = await admin
    .from("queue_entries")
    .select("*")
    .eq("session_id", entry.session_id)
    .eq("position", neighborPos)
    .maybeSingle();
  if (!neighbor) return NextResponse.json({ ok: true });
  // Swap positions: use temp value to avoid unique collisions if you add a unique index later
  await admin.from("queue_entries").update({ position: -1 }).eq("id", entry.id);
  await admin.from("queue_entries").update({ position: entry.position }).eq("id", neighbor.id);
  await admin.from("queue_entries").update({ position: neighborPos }).eq("id", entry.id);
  return NextResponse.json({ ok: true });
}
