import { createClient, isSupabaseConfigured } from "./server";

export type Profile = {
  id: string;
  name: string;
  avatar_url: string | null;
  location: string | null;
  building: string | null;
  x_handle: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  researcher_number: number;
  created_at: string;
};

export type Project = {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  screenshot_url: string | null;
  project_url: string | null;
  tags: string[] | null;
  is_published: boolean;
  created_at: string;
};

export type Session = {
  id: string;
  is_active: boolean;
  label: string | null;
  host_note: string | null;
  event_date: string | null;
  created_at: string;
};

export type QueueEntry = {
  id: string;
  profile_id: string;
  session_id: string;
  position: number;
  status: "waiting" | "cooking" | "done";
  created_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  created_at: string;
};

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isSupabaseConfigured()) return fallback;
  try { return await fn(); } catch { return fallback; }
}

export async function getCurrentUserProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return data as Profile | null;
}

export async function getAllProfiles(): Promise<Profile[]> {
  return safe(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("researcher_number", { ascending: true });
    return (data || []) as Profile[];
  }, []);
}

export async function getRecentProfiles(limit = 6): Promise<Profile[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data || []) as Profile[];
}

export async function getProfileById(id: string): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  return (data as Profile) || null;
}

export async function getProfileCount(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const supabase = createClient();
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });
  return count || 0;
}

export async function getPublishedProjects(limit?: number): Promise<Project[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  let q = supabase
    .from("projects")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data || []) as Project[];
}

export async function getUpcomingSessions(limit = 3): Promise<Session[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("sessions")
    .select("*")
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(limit);
  return (data || []) as Session[];
}

export async function getAllSessions(): Promise<Session[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("sessions")
    .select("*")
    .order("event_date", { ascending: false });
  return (data || []) as Session[];
}

export async function getActiveSession(): Promise<Session | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const { data } = await supabase
    .from("sessions")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as Session | null;
}

export async function getAnnouncements(limit = 2): Promise<Announcement[]> {
  if (!isSupabaseConfigured()) {
    // Dev fallback so the UI isn't empty before Supabase is wired up.
    return [
      { id: "1", title: "WELCOME TO RAMYEON LABS", body: "A Sunday coworking syndicate for London builders. One ramyeon machine. Many founders.", created_at: new Date().toISOString() },
      { id: "2", title: "FIRST SUNDAY SESSION LIVE", body: "Our inaugural session is live — grab an invite link, create your profile, and join the queue.", created_at: new Date().toISOString() },
    ];
  }
  const supabase = createClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data || []) as Announcement[];
}

export async function getQueueForSession(sessionId: string): Promise<QueueEntry[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("queue_entries")
    .select("*")
    .eq("session_id", sessionId)
    .order("position", { ascending: true });
  return (data || []) as QueueEntry[];
}
