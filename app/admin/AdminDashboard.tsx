"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PixelCard } from "../components/pixel/PixelCard";
import { PixelButton } from "../components/pixel/PixelButton";
import { StatusBadge } from "../components/pixel/StatusBadge";

type Tab = "session" | "queue" | "researchers" | "projects" | "sessions";

export function AdminDashboard(props: {
  sessions: any[];
  profiles: any[];
  projects: any[];
  activeSessionId: string | null;
  queue: any[];
}) {
  const [tab, setTab] = useState<Tab>("session");
  const router = useRouter();

  async function call(path: string, body: any, method = "POST") {
    const res = await fetch(path, {
      method,
      headers: { "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) alert((await res.json()).error || "FAILED");
    router.refresh();
  }

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "session", label: "SESSION" },
    { id: "queue", label: "QUEUE" },
    { id: "researchers", label: "RESEARCHERS" },
    { id: "projects", label: "PROJECTS" },
    { id: "sessions", label: "HISTORY" },
  ];

  const activeSession = props.sessions.find((s) => s.id === props.activeSessionId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-pixel text-rl-yellow text-xl uppercase">Host Dashboard</h1>
        <button onClick={logout} className="font-sans text-xs uppercase text-rl-muted">
          LOGOUT
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b-2 border-rl-border pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`font-pixel text-[10px] uppercase px-3 py-2 rounded border-2 ${
              tab === t.id ? "border-rl-yellow bg-rl-yellow text-rl-base" : "border-transparent text-rl-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "session" && <SessionTab activeSession={activeSession} call={call} />}

      {tab === "session" && <PressureTestCard activeSession={activeSession} />}

      {tab === "queue" && (
        <div className="space-y-3">
          {!props.activeSessionId ? (
            <div className="font-sans text-rl-muted text-sm">NO ACTIVE SESSION — ACTIVATE ONE IN THE SESSION TAB</div>
          ) : props.queue.length === 0 ? (
            <div className="font-sans text-rl-muted text-sm">QUEUE EMPTY</div>
          ) : (
            props.queue.map((q, i) => (
              <PixelCard key={q.id}>
                <div className="flex items-center gap-4">
                  <div className="font-display text-4xl text-rl-yellow leading-none">#{q.position}</div>
                  <div className="flex-1">
                    <div className="font-sans font-bold text-rl-text">
                      {q.profiles?.name} <span className="text-rl-muted text-xs">#{String(q.profiles?.researcher_number || 0).padStart(3, "0")}</span>
                    </div>
                    {q.profiles?.building && (
                      <div className="font-sans text-xs text-rl-muted">{q.profiles.building}</div>
                    )}
                    <div className="mt-1"><StatusBadge status={q.status} /></div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => call("/api/admin/queue/reorder", { id: q.id, direction: "up" })} disabled={i === 0} className="text-rl-yellow disabled:opacity-30">▲</button>
                    <button onClick={() => call("/api/admin/queue/reorder", { id: q.id, direction: "down" })} disabled={i === props.queue.length - 1} className="text-rl-yellow disabled:opacity-30">▼</button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <PixelButton onClick={() => call("/api/admin/queue/status", { id: q.id, status: "cooking" })}>
                      COOKING
                    </PixelButton>
                    <PixelButton variant="outline" onClick={() => call("/api/admin/queue/status", { id: q.id, status: "done" })}>
                      DONE
                    </PixelButton>
                    <PixelButton variant="danger" onClick={() => call("/api/admin/queue/remove", { id: q.id })}>
                      REMOVE
                    </PixelButton>
                  </div>
                </div>
              </PixelCard>
            ))
          )}
        </div>
      )}

      {tab === "researchers" && (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-pixel text-[8px] text-rl-yellow uppercase">
                <th className="p-2">#</th>
                <th className="p-2">NAME</th>
                <th className="p-2">LOCATION</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {props.profiles.map((p) => (
                <tr key={p.id} className="border-t border-rl-muted/30">
                  <td className="p-2 font-pixel text-[10px] text-rl-yellow">#{String(p.researcher_number).padStart(3, "0")}</td>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2 text-rl-muted">{p.location}</td>
                  <td className="p-2">
                    <button
                      className="text-rl-danger text-xs"
                      onClick={() => {
                        if (confirm("DELETE PROFILE?")) call("/api/admin/profile", { id: p.id }, "DELETE");
                      }}
                    >
                      DELETE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "projects" && (
        <div className="space-y-2">
          {props.projects.map((p) => (
            <PixelCard key={p.id}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-sans font-bold">{p.title}</div>
                  <div className="font-sans text-xs text-rl-muted">Published: {String(p.is_published)}</div>
                </div>
                <div className="flex gap-2">
                  <PixelButton variant="outline" onClick={() => call("/api/admin/project", { id: p.id, is_published: !p.is_published }, "PATCH")}>
                    {p.is_published ? "UNPUBLISH" : "PUBLISH"}
                  </PixelButton>
                  <PixelButton variant="danger" onClick={() => { if (confirm("DELETE?")) call("/api/admin/project", { id: p.id }, "DELETE"); }}>
                    DELETE
                  </PixelButton>
                </div>
              </div>
            </PixelCard>
          ))}
        </div>
      )}

      {tab === "sessions" && (
        <div className="space-y-2">
          {props.sessions.map((s) => (
            <div key={s.id} className="border border-rl-muted/40 rounded p-3 font-sans text-sm">
              <div className="flex items-center gap-2">
                {s.is_active && <StatusBadge status="active" />}
                <span className="font-bold">{s.event_date || "TBA"}</span>
                <span className="text-rl-muted">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PressureTestCard({ activeSession }: { activeSession: any }) {
  const router = useRouter();
  const [count, setCount] = useState(50);
  const [loading, setLoading] = useState<"seed" | "clear" | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function seed() {
    if (!activeSession) {
      alert("ACTIVATE A SESSION FIRST");
      return;
    }
    setLoading("seed");
    setResult(null);
    try {
      const res = await fetch("/api/admin/seed-test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ count }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "FAILED");
      setResult(`✓ Created ${data.created} test users${data.errors?.length ? ` (${data.errors.length} errors)` : ""}`);
      router.refresh();
    } catch (e: any) {
      setResult(`⚠ ${e.message}`);
    } finally {
      setLoading(null);
    }
  }

  async function clear() {
    if (!confirm("DELETE ALL TEST USERS? This removes every seed-test-* account.")) return;
    setLoading("clear");
    setResult(null);
    try {
      const res = await fetch("/api/admin/seed-test", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "FAILED");
      setResult(`✓ Deleted ${data.deleted} test users`);
      router.refresh();
    } catch (e: any) {
      setResult(`⚠ ${e.message}`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <PixelCard>
      <h2 className="font-pixel text-rl-yellow text-sm uppercase mb-2">Pressure Test</h2>
      <p className="font-sans text-xs text-rl-muted mb-4">
        Seed fake users into the active queue to stress-test tomorrow&apos;s session. Cleanup removes every{" "}
        <code className="text-rl-yellow">seed-test-*</code> account.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="font-sans text-xs text-rl-muted">COUNT</label>
        <input
          type="number"
          min={1}
          max={200}
          value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(200, Number(e.target.value) || 1)))}
          className="w-24"
        />
        <PixelButton onClick={seed} disabled={loading !== null}>
          {loading === "seed" ? "SEEDING..." : "SEED FAKE USERS"}
        </PixelButton>
        <PixelButton variant="danger" onClick={clear} disabled={loading !== null}>
          {loading === "clear" ? "CLEARING..." : "CLEAR TEST USERS"}
        </PixelButton>
      </div>
      {result && <div className="font-sans text-xs text-rl-muted mt-3">{result}</div>}
    </PixelCard>
  );
}

function SessionTab({ activeSession, call }: { activeSession: any; call: (p: string, b: any, m?: string) => void }) {
  const [label, setLabel] = useState(activeSession?.label || "");
  const [eventDate, setEventDate] = useState(activeSession?.event_date || "");
  const [hostNote, setHostNote] = useState(activeSession?.host_note || "");

  return (
    <div className="space-y-4">
      {activeSession ? (
        <PixelCard>
          <div className="flex items-center gap-2 mb-4">
            <StatusBadge status="active" />
            <div className="font-sans font-bold">{activeSession.label || "(no label)"}</div>
          </div>
          <PixelButton
            variant="danger"
            onClick={() => {
              if (confirm("DEACTIVATE SESSION?")) call("/api/admin/session", { id: activeSession.id, is_active: false }, "PATCH");
            }}
          >
            DEACTIVATE SESSION
          </PixelButton>
        </PixelCard>
      ) : (
        <div className="font-sans text-rl-muted text-sm">NO ACTIVE SESSION</div>
      )}

      <PixelCard>
        <h2 className="font-pixel text-rl-yellow text-sm uppercase mb-4">Create New Session</h2>
        <div className="space-y-3">
          <input placeholder="LABEL (e.g. SUNDAY 13 APRIL)" value={label} onChange={(e) => setLabel(e.target.value)} className="w-full" />
          <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full" />
          <textarea placeholder="HOST NOTE (OPTIONAL)" value={hostNote} onChange={(e) => setHostNote(e.target.value)} className="w-full" rows={2} />
          <PixelButton
            onClick={() =>
              call("/api/admin/session", { label, event_date: eventDate || null, host_note: hostNote || null, is_active: true })
            }
          >
            CREATE & ACTIVATE →
          </PixelButton>
        </div>
      </PixelCard>
    </div>
  );
}
