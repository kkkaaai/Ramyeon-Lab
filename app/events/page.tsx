import Link from "next/link";
import { getAllSessions, getCurrentUserProfile } from "../lib/supabase/queries";
import { PixelCard } from "../components/pixel/PixelCard";
import { StatusBadge } from "../components/pixel/StatusBadge";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const [sessions, me] = await Promise.all([getAllSessions(), getCurrentUserProfile()]);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = sessions.filter((s) => !s.event_date || s.event_date >= today);
  const past = sessions.filter((s) => s.event_date && s.event_date < today);

  return (
    <div className="space-y-6">
      <h1 className="font-pixel text-rl-text text-xl uppercase">Upcoming Sessions</h1>

      {upcoming.length === 0 ? (
        <div className="font-sans text-rl-muted text-sm">NO UPCOMING SESSIONS... STAY TUNED</div>
      ) : (
        <div className="space-y-4">
          {upcoming.map((s) => (
            <PixelCard key={s.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="font-pixel text-rl-text text-sm">
                      {s.event_date ? new Date(s.event_date).toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long" }) : "TBA"}
                    </div>
                    <StatusBadge status={s.is_active ? "active" : "inactive"} />
                  </div>
                  {s.label && <div className="font-sans text-rl-text">{s.label}</div>}
                  {s.host_note && <div className="font-sans text-xs text-rl-muted italic mt-2">{s.host_note}</div>}
                </div>
                {s.is_active && me && (
                  <Link
                    href="/queue/join"
                    className="font-sans text-xs uppercase tracking-[1px] bg-rl-yellow text-rl-text px-4 py-2 border-2 border-rl-border shadow-pixel rounded"
                  >
                    JOIN THE QUEUE →
                  </Link>
                )}
              </div>
            </PixelCard>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <details className="mt-8">
          <summary className="font-pixel text-rl-muted text-xs uppercase cursor-pointer">Past Sessions ({past.length})</summary>
          <div className="mt-4 space-y-2">
            {past.map((s) => (
              <div key={s.id} className="bg-white border-[3px] border-rl-border/40 rounded p-3 font-sans text-sm text-rl-muted">
                {s.event_date} — {s.label || "(untitled)"}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
