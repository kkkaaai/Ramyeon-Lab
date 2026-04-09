"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { PixelPanel } from "../../components/pixel/PixelPanel";
import { PixelButton } from "../../components/pixel/PixelButton";

type Me = { id: string; name: string; researcher_number: number };

type Entry = { id: string; position: number; status: "waiting" | "cooking" | "done" };

export function JoinQueueClient({
  sessionId,
  sessionLabel,
  me,
}: {
  sessionId: string;
  sessionLabel: string | null;
  me: Me;
}) {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    const supabase = createClient();
    const { data } = await supabase
      .from("queue_entries")
      .select("id,position,status")
      .eq("session_id", sessionId)
      .eq("profile_id", me.id)
      .maybeSingle();
    setEntry(data as Entry | null);
  }

  useEffect(() => {
    refresh();
    const supabase = createClient();
    const channel = supabase
      .channel(`queue-me-${me.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "queue_entries" }, refresh)
      .subscribe();
    const iv = setInterval(refresh, 5000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(iv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function join() {
    setLoading(true);
    setErr(null);
    try {
      // If there's a stale "done" entry, clear it before re-joining.
      if (entry && entry.status === "done") {
        const supabase = createClient();
        await supabase.from("queue_entries").delete().eq("id", entry.id);
      }
      const res = await fetch("/api/queue/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          // Already in queue — refresh state so UI reflects the existing entry.
          await refresh();
          throw new Error("You're already in the queue.");
        }
        throw new Error(data.error || "Could not join the queue.");
      }
      await refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not join the queue.");
    } finally {
      setLoading(false);
    }
  }

  async function leave() {
    if (!confirm("LEAVE THE QUEUE?")) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/queue/leave", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: entry!.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not leave the queue.");
      }
      await refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not leave the queue.");
    } finally {
      setLoading(false);
    }
  }

  const statusLabel = entry?.status === "cooking" ? "🍜 COOKING NOW" : "⏱ WAITING";
  // Once an entry is marked done, treat the user as no longer in the queue.
  const activeEntry = entry && entry.status !== "done" ? entry : null;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <PixelPanel title={`Ramyeon Queue${sessionLabel ? " — " + sessionLabel : ""}`}>
        <div className="flex items-center justify-center gap-3 py-2 mb-4 border-b-[3px] border-rl-border/30">
          <div className="font-pixel text-rl-text text-base uppercase">{me.name}</div>
          <div className="font-pixel text-[8px] text-rl-text bg-rl-yellow border-[3px] border-rl-border rounded px-2 py-1">
            #{String(me.researcher_number).padStart(3, "0")}
          </div>
        </div>

        {activeEntry ? (
          <div className="space-y-5">
            <div className="bg-white border-4 border-rl-border rounded-lg p-6 text-center">
              <div className="font-pixel text-[9px] text-rl-muted uppercase mb-2">YOU ARE</div>
              <div className="font-pixel text-6xl text-rl-text leading-none">#{activeEntry.position}</div>
              <div className="font-pixel text-[9px] text-rl-muted uppercase mt-2">IN THE QUEUE</div>
              <div className="inline-block mt-4 bg-rl-yellow border-[3px] border-rl-border rounded px-3 py-2 font-pixel text-[9px] text-rl-text uppercase">
                {statusLabel}
              </div>
            </div>
            <PixelButton variant="danger" className="w-full" onClick={leave} disabled={loading}>
              LEAVE QUEUE
            </PixelButton>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-white border-[3px] border-rl-border rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">🍜</div>
              <p className="font-pixel text-[10px] text-rl-text uppercase">Ready for some noodles?</p>
            </div>
            <PixelButton className="w-full text-base py-5" onClick={join} disabled={loading}>
              {loading ? "JOINING..." : "JOIN THE QUEUE 🍜"}
            </PixelButton>
          </div>
        )}
        {err && (
          <div className="mt-3 bg-rl-danger/10 border-[3px] border-rl-danger rounded-lg px-3 py-2 font-sans text-sm text-rl-danger text-center">
            ⚠ {err}
          </div>
        )}
      </PixelPanel>
    </div>
  );
}
