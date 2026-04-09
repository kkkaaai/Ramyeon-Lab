"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Profile } from "../lib/supabase/queries";
import { PixelPanel } from "../components/pixel/PixelPanel";
import { AvatarOrInitials } from "../components/pixel/AvatarOrInitials";
import { SocialButtons } from "../components/pixel/SocialButtons";

export function MembersClient({ profiles, meId }: { profiles: Profile[]; meId: string }) {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState<string>("ALL");

  const locations = useMemo(() => {
    const set = new Set<string>();
    profiles.forEach((p) => p.location && set.add(p.location));
    return ["ALL", ...Array.from(set)];
  }, [profiles]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return profiles.filter((p) => {
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.building || "").toLowerCase().includes(q);
      const matchLoc = location === "ALL" || p.location === location;
      return matchQ && matchLoc;
    });
  }, [profiles, search, location]);

  return (
    <div className="space-y-5">
      <PixelPanel title={`Ramyeon Researchers (${profiles.length})`}>
        {/* Search + location filter */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center mb-4">
          <input
            type="text"
            placeholder="SEARCH NAME OR BUILDING..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2 flex-wrap">
            {locations.map((l) => (
              <button
                key={l}
                onClick={() => setLocation(l)}
                className={`font-pixel text-[9px] uppercase tracking-wider px-3 py-2 rounded border-[3px] ${
                  location === l
                    ? "border-rl-border bg-rl-yellow text-rl-text shadow-pixel-sm"
                    : "border-rl-border bg-white text-rl-text"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="font-pixel text-[10px] text-rl-muted py-12 text-center uppercase">
            NO RESEARCHERS MATCH... COOK SOMETHING UP 🍜
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-fr">
            {filtered.map((p) => (
              <Link
                key={p.id}
                href={`/members/${p.id}`}
                className={`relative min-w-0 bg-white border-[3px] border-rl-border rounded-lg p-4 flex flex-col items-center gap-2 hover:translate-y-[-2px] hover:shadow-pixel-sm transition-all ${
                  p.id === meId ? "bg-rl-yellow-light" : ""
                }`}
              >
                {p.id === meId && (
                  <div className="absolute -top-2 -right-2 bg-rl-yellow border-[3px] border-rl-border rounded px-2 py-1 font-pixel text-[6px] text-rl-text">
                    ✦ YOU
                  </div>
                )}
                <AvatarOrInitials url={p.avatar_url} name={p.name} size={56} />
                <div className="font-pixel text-[8px] text-rl-text uppercase text-center truncate max-w-full">
                  {p.name}
                </div>
                <div className="font-pixel text-[6px] text-rl-muted">
                  #{String(p.researcher_number).padStart(3, "0")}
                </div>
                {p.location && (
                  <div className="font-pixel text-[6px] text-rl-muted text-center truncate max-w-full">
                    📍 {p.location.toUpperCase()}
                  </div>
                )}
                {p.building && (
                  <p className="font-sans text-[11px] font-semibold text-rl-text text-center line-clamp-2 mt-1">
                    {p.building}
                  </p>
                )}
                <div onClick={(e) => e.preventDefault()} className="mt-1">
                  <SocialButtons x={p.x_handle} linkedin={p.linkedin_url} website={p.website_url} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </PixelPanel>
    </div>
  );
}
