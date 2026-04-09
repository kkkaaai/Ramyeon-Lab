import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";

// Seed / clear fake test users for pressure-testing the queue.
// Fake accounts use email prefix "seed-test-" so cleanup is safe.
// Protected by the existing admin middleware (/api/admin/*).

const FAKE_NAMES = [
  "Rejaws", "Sherghan", "Pussin", "Jonanon", "Kai", "Mira", "Taro", "Yuki",
  "Hana", "Jin", "Soo", "Dae", "Min", "Eun", "Bora", "Hyun", "Jae", "Ji",
  "Ara", "Ryo", "Ken", "Sana", "Rei", "Ayu", "Aki", "Nori", "Kenji", "Yuma",
  "Haru", "Sora", "Rin", "Tomo", "Yui", "Kaito", "Nao", "Shin", "Taka",
  "Emi", "Mai", "Ren", "Yuta", "Saki", "Aoi", "Riku", "Iris", "Nova",
  "Atlas", "Vera", "Zane", "Orion",
];

const LOCATIONS = ["London", "Seoul", "Tokyo", "Berlin", "Remote", "NYC", "SF"];

const BUILDINGS = [
  "Pixel-art coworking queue for ramen syndicates",
  "AI voice that doesn't sound like a robot",
  "Dev tools for browser automation",
  "Solar-powered mesh routers",
  "LLM-native note-taking",
  "Hardware for indie hackers",
  "Tiny games engine",
  "Spatial computing toys",
  "Open-source payments",
  "Retro UI component library",
];

const TEST_EMAIL_PREFIX = "seed-test-";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const count: number = Math.min(Math.max(Number(body.count) || 50, 1), 200);

  const admin = createAdminClient();

  // Find the active session to seed into.
  const { data: session } = await admin
    .from("sessions")
    .select("id")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!session) {
    return NextResponse.json(
      { error: "no active session — activate one first" },
      { status: 400 }
    );
  }

  // Find max position in existing queue so we append after real users.
  const { data: last } = await admin
    .from("queue_entries")
    .select("position")
    .eq("session_id", session.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  let nextPosition = (last?.position || 0) + 1;

  const created: { id: string; name: string; position: number }[] = [];
  const errors: string[] = [];
  const runTag = Date.now().toString(36);

  for (let i = 0; i < count; i++) {
    const name = `${FAKE_NAMES[i % FAKE_NAMES.length]} ${i + 1}`;
    const email = `${TEST_EMAIL_PREFIX}${runTag}-${i + 1}@ramyeon.test`;
    const location = LOCATIONS[i % LOCATIONS.length];
    const building = BUILDINGS[i % BUILDINGS.length];

    // 1. Create auth user
    const { data: userRes, error: userErr } = await admin.auth.admin.createUser({
      email,
      password: `test-${runTag}-${i}`,
      email_confirm: true,
    });
    if (userErr || !userRes.user) {
      errors.push(`user ${i + 1}: ${userErr?.message || "no user"}`);
      continue;
    }
    const userId = userRes.user.id;

    // 2. Insert profile (researcher_number auto-assigned by serial)
    const { error: profileErr } = await admin.from("profiles").insert({
      id: userId,
      name,
      location,
      building,
      avatar_url: null,
    });
    if (profileErr) {
      errors.push(`profile ${i + 1}: ${profileErr.message}`);
      await admin.auth.admin.deleteUser(userId).catch(() => {});
      continue;
    }

    // 3. Insert queue entry
    const { error: queueErr } = await admin.from("queue_entries").insert({
      session_id: session.id,
      profile_id: userId,
      position: nextPosition,
      status: "waiting",
    });
    if (queueErr) {
      errors.push(`queue ${i + 1}: ${queueErr.message}`);
      continue;
    }

    created.push({ id: userId, name, position: nextPosition });
    nextPosition += 1;
  }

  return NextResponse.json({
    ok: true,
    created: created.length,
    errors: errors.slice(0, 10),
  });
}

export async function DELETE() {
  const admin = createAdminClient();

  // List all auth users and delete any whose email starts with our prefix.
  // supabase-js paginates at 50 per page by default.
  let page = 1;
  let deleted = 0;
  const errors: string[] = [];
  // Loop up to 20 pages (=1000 users) defensively.
  while (page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      errors.push(error.message);
      break;
    }
    const users = data.users || [];
    if (users.length === 0) break;

    const testUsers = users.filter((u) => u.email?.startsWith(TEST_EMAIL_PREFIX));
    for (const u of testUsers) {
      const { error: delErr } = await admin.auth.admin.deleteUser(u.id);
      if (delErr) errors.push(`${u.email}: ${delErr.message}`);
      else deleted += 1;
    }

    if (users.length < 200) break;
    page += 1;
  }

  return NextResponse.json({ ok: true, deleted, errors: errors.slice(0, 10) });
}
