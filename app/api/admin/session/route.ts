import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";

export async function POST(req: Request) {
  const body = await req.json();
  const admin = createAdminClient();
  if (body.is_active) {
    await admin.from("sessions").update({ is_active: false }).eq("is_active", true);
  }
  const { data, error } = await admin.from("sessions").insert({
    label: body.label || null,
    event_date: body.event_date || null,
    host_note: body.host_note || null,
    is_active: !!body.is_active,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, session: data });
}

export async function PATCH(req: Request) {
  const { id, ...fields } = await req.json();
  const admin = createAdminClient();
  if (fields.is_active === true) {
    await admin.from("sessions").update({ is_active: false }).neq("id", id);
  }
  const { error } = await admin.from("sessions").update(fields).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
