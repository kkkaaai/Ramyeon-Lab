import { createAdminClient } from "../lib/supabase/admin";
import { AdminDashboard } from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = createAdminClient();
  const [sessionsRes, profilesRes, projectsRes] = await Promise.all([
    admin.from("sessions").select("*").order("event_date", { ascending: false }),
    admin.from("profiles").select("*").order("researcher_number", { ascending: true }),
    admin.from("projects").select("*").order("created_at", { ascending: false }),
  ]);

  const activeSession = (sessionsRes.data || []).find((s: any) => s.is_active) || null;
  let queue: any[] = [];
  if (activeSession) {
    const { data } = await admin
      .from("queue_entries")
      .select("id,position,status,created_at,profile_id,profiles(name,building,researcher_number)")
      .eq("session_id", activeSession.id)
      .neq("status", "done")
      .order("position", { ascending: true });
    queue = data || [];
  }

  return (
    <AdminDashboard
      sessions={sessionsRes.data || []}
      profiles={profilesRes.data || []}
      projects={projectsRes.data || []}
      activeSessionId={activeSession?.id || null}
      queue={queue}
    />
  );
}
