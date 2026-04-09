"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import { QueueRow, QueueRowData } from "../components/queue/QueueRow";

type ActiveSession = {
  id: string;
  label: string | null;
  host_note: string | null;
};

type Row = QueueRowData;

// Placeholder data so the /queue page renders something visual before Supabase is wired up
const PLACEHOLDER_SESSION: ActiveSession = {
  id: "demo",
  label: "SUNDAY 13 APRIL — DEMO SESSION",
  host_note: "Host: Kai. 1 bowl every ~4 minutes. Be ready when you're up!",
};
const PLACEHOLDER_ROWS: Row[] = [
  { id: "r1", position: 1, status: "cooking", profile_id: null, name: "Rejaws",   building: "Pixel-art coworking queue for ramen syndicates",  location: "London", researcher_number: 1 },
  { id: "r2", position: 2, status: "waiting", profile_id: null, name: "Sherghan", building: "AI voice that doesn't sound like a robot",         location: "London", researcher_number: 2 },
  { id: "r3", position: 3, status: "waiting", profile_id: null, name: "Pussin",   building: "Dev tools for browser automation",                 location: "Remote", researcher_number: 3 },
  { id: "r4", position: 4, status: "waiting", profile_id: null, name: "Jonanon",  building: "Solar-powered mesh routers",                       location: "London", researcher_number: 4 },
];

export function QueueDisplay() {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function callQueueAction(path: string, body: Record<string, unknown>, failMessage: string) {
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || failMessage);
      }
      setActionError(null);
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message.toUpperCase() : failMessage);
    }
    refresh();
  }

  function updateMyStatus(id: string, status: "cooking" | "done") {
    return callQueueAction("/api/queue/status", { id, status }, "COULD NOT UPDATE STATUS");
  }

  function leaveQueue(id: string) {
    return callQueueAction("/api/queue/leave", { id }, "COULD NOT LEAVE QUEUE");
  }

  async function refresh() {
    // If Supabase env vars aren't set, show placeholder data instead of crashing.
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setSession(PLACEHOLDER_SESSION);
      setRows(PLACEHOLDER_ROWS);
      setLoggedIn(false);
      return;
    }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setLoggedIn(!!user);
    setUserId(user?.id ?? null);

    const { data: s } = await supabase
      .from("sessions")
      .select("id,label,host_note")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!s) {
      setSession(null);
      setRows([]);
      return;
    }
    setSession(s as ActiveSession);

    const { data: entries } = await supabase
      .from("queue_entries")
      .select("id,position,status,profile_id,profiles!inner(name,building,location,researcher_number,avatar_url)")
      .eq("session_id", s.id)
      .order("position", { ascending: true });

    const mapped: Row[] = (entries || []).map((e: any) => ({
      id: e.id,
      position: e.position,
      status: e.status,
      profile_id: e.profile_id,
      name: e.profiles?.name || "???",
      building: e.profiles?.building || null,
      location: e.profiles?.location || null,
      researcher_number: e.profiles?.researcher_number || 0,
      avatar_url: e.profiles?.avatar_url || null,
    }));
    setRows(mapped);
  }

  useEffect(() => {
    refresh();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createClient();
    const channel = supabase
      .channel("queue-display")
      .on("postgres_changes", { event: "*", schema: "public", table: "queue_entries" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "sessions" }, refresh)
      .subscribe();
    const iv = setInterval(refresh, 10000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(iv);
    };
  }, []);

  function goFullscreen() {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-[#24211E]">
      <div className="max-w-5xl mx-auto p-3 md:p-8 pb-28 md:pb-24">
        {/* Header */}
        <div className="bg-rl-yellow-light border-4 border-rl-border rounded-[15px] p-3 md:p-5 mb-4 md:mb-6 flex items-center justify-between gap-3 shadow-pixel-dark">
          <div className="min-w-0 flex-1">
            <h1 className="font-pixel text-rl-text text-base md:text-3xl leading-tight">RAMYEON LABS</h1>
            <p className="hidden md:block font-pixel text-rl-muted text-[9px] uppercase tracking-[2px] mt-2">
              Sunday Coworking Syndicate
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="flex items-center gap-1.5 md:gap-2 bg-rl-yellow border-[3px] md:border-4 border-rl-border shadow-pixel-sm rounded-lg px-2 py-1.5 md:px-3 md:py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ramyeon-soup.jpeg"
                alt="Ramyeon pack"
                className="w-6 h-6 md:w-8 md:h-8 object-contain"
                style={{ imageRendering: "pixelated" }}
              />
              <span className="font-pixel text-rl-text text-[12px] md:text-[16px] leading-none">
                {rows.filter((r) => r.status === "done").length.toString().padStart(2, "0")}
              </span>
            </div>
            <button
              onClick={goFullscreen}
              aria-label="Fullscreen"
              className="font-pixel text-[14px] md:text-[9px] md:tracking-wider md:uppercase bg-rl-yellow text-rl-text border-[3px] md:border-4 border-rl-border shadow-pixel-sm rounded-lg px-2.5 py-1.5 md:px-4 md:py-3 hover:translate-y-[1px]"
            >
              <span className="md:hidden">⛶</span>
              <span className="hidden md:inline">FULLSCREEN ⛶</span>
            </button>
          </div>
        </div>

        {actionError && (
          <div className="bg-rl-danger border-4 border-rl-border rounded-lg px-4 py-3 mb-4 font-pixel text-white text-[10px] uppercase tracking-wider text-center shadow-pixel-sm">
            ⚠ {actionError}
          </div>
        )}

        {!session ? (
          <div className="bg-rl-yellow-light border-4 border-rl-border rounded-[15px] p-6 md:p-12 text-center shadow-pixel-dark">
            <div className="text-5xl md:text-6xl mb-4">🍜</div>
            <div className="font-pixel text-rl-text text-lg md:text-3xl uppercase animate-pulse-amber">
              NO ACTIVE SESSION
            </div>
            <div className="font-pixel text-rl-muted text-[10px] uppercase mt-6 tracking-wider">
              CHECK BACK SOON
            </div>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-5">
            {session.label && (
              <div className="bg-rl-yellow border-4 border-rl-border rounded-lg px-3 py-2 md:px-4 md:py-3 font-pixel text-rl-text text-[11px] md:text-sm uppercase tracking-wider text-center shadow-pixel-sm">
                {session.label}
              </div>
            )}
            {rows.filter((r) => r.status !== "done").length === 0 ? (
              <div className="bg-rl-yellow-light border-4 border-rl-border rounded-[15px] p-8 md:p-16 text-center shadow-pixel-dark">
                <div className="text-4xl md:text-5xl mb-4">🍜</div>
                <div className="font-pixel text-rl-text text-base md:text-lg uppercase">
                  QUEUE EMPTY
                </div>
                <div className="font-pixel text-rl-muted text-[10px] uppercase mt-3">
                  BE THE FIRST TO COOK
                </div>
              </div>
            ) : (
              <div className="bg-rl-yellow-light border-4 border-rl-border rounded-[15px] p-3 md:p-5 space-y-2 md:space-y-3 shadow-pixel-dark">
                {rows.filter((r) => r.status !== "done").map((r, i, visible) => {
                  // The "front" is the first non-done row. Anyone cooking is also at the front.
                  const isFront = i === 0;
                  return (
                    <QueueRow
                      key={r.id}
                      entry={r}
                      highlight={i === 0 ? "cooking" : i === 1 ? "next" : undefined}
                      isMine={!!userId && r.profile_id === userId}
                      isFront={isFront}
                      onStartCooking={() => updateMyStatus(r.id, "cooking")}
                      onMarkDone={() => updateMyStatus(r.id, "done")}
                      onLeave={() => leaveQueue(r.id)}
                    />
                  );
                })}
              </div>
            )}
            {session.host_note && (
              <div className="bg-white border-4 border-rl-border rounded-lg px-4 py-3 font-sans text-rl-text text-sm italic text-center">
                💬 {session.host_note}
              </div>
            )}
          </div>
        )}

        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6">
          <Link
            href={loggedIn ? "/queue/join" : "/join"}
            className="font-pixel text-[9px] md:text-[10px] uppercase tracking-wider bg-rl-yellow text-rl-text px-4 py-3 md:px-5 md:py-4 border-[3px] md:border-4 border-rl-border shadow-pixel rounded-lg hover:translate-y-[2px] hover:shadow-pixel-sm transition-all inline-block"
          >
            JOIN QUEUE →
          </Link>
        </div>
      </div>
    </div>
  );
}
