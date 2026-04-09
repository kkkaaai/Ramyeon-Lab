// One-shot seed script — creates fake users and adds them to the active queue.
// Run with: node --env-file=.env.local scripts/seed-test-queue.mjs [count]
import { createClient } from "@supabase/supabase-js";

const COUNT = Math.min(Math.max(Number(process.argv[2]) || 50, 1), 200);
const TEST_EMAIL_PREFIX = "seed-test-";

const FAKE_NAMES = [
  "Rejaws","Sherghan","Pussin","Jonanon","Kai","Mira","Taro","Yuki","Hana","Jin",
  "Soo","Dae","Min","Eun","Bora","Hyun","Jae","Ji","Ara","Ryo",
  "Ken","Sana","Rei","Ayu","Aki","Nori","Kenji","Yuma","Haru","Sora",
  "Rin","Tomo","Yui","Kaito","Nao","Shin","Taka","Emi","Mai","Ren",
  "Yuta","Saki","Aoi","Riku","Iris","Nova","Atlas","Vera","Zane","Orion",
];
const LOCATIONS = ["London","Seoul","Tokyo","Berlin","Remote","NYC","SF"];
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: session } = await admin
  .from("sessions")
  .select("id,label")
  .eq("is_active", true)
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();

if (!session) {
  console.error("No active session — activate one in /admin first");
  process.exit(1);
}
console.log(`Seeding ${COUNT} users into session: ${session.label || session.id}`);

const { data: last } = await admin
  .from("queue_entries")
  .select("position")
  .eq("session_id", session.id)
  .order("position", { ascending: false })
  .limit(1)
  .maybeSingle();
let nextPosition = (last?.position || 0) + 1;

const runTag = Date.now().toString(36);
let created = 0;
const errors = [];

for (let i = 0; i < COUNT; i++) {
  const name = `${FAKE_NAMES[i % FAKE_NAMES.length]} ${i + 1}`;
  const email = `${TEST_EMAIL_PREFIX}${runTag}-${i + 1}@ramyeon.test`;

  const { data: u, error: uErr } = await admin.auth.admin.createUser({
    email,
    password: `test-${runTag}-${i}`,
    email_confirm: true,
  });
  if (uErr || !u.user) {
    errors.push(`user ${i + 1}: ${uErr?.message}`);
    continue;
  }

  const { error: pErr } = await admin.from("profiles").insert({
    id: u.user.id,
    name,
    location: LOCATIONS[i % LOCATIONS.length],
    building: BUILDINGS[i % BUILDINGS.length],
  });
  if (pErr) {
    errors.push(`profile ${i + 1}: ${pErr.message}`);
    await admin.auth.admin.deleteUser(u.user.id).catch(() => {});
    continue;
  }

  const { error: qErr } = await admin.from("queue_entries").insert({
    session_id: session.id,
    profile_id: u.user.id,
    position: nextPosition,
    status: "waiting",
  });
  if (qErr) {
    errors.push(`queue ${i + 1}: ${qErr.message}`);
    continue;
  }

  created += 1;
  nextPosition += 1;
  process.stdout.write(`\r  created ${created}/${COUNT}`);
}

console.log(`\n✓ Done. Created ${created} test users.`);
if (errors.length) {
  console.log(`⚠ ${errors.length} errors:`);
  errors.slice(0, 5).forEach((e) => console.log("  " + e));
}
