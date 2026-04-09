import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileById, Profile } from "../../lib/supabase/queries";
import { isSupabaseConfigured } from "../../lib/supabase/server";
import { PixelPanel } from "../../components/pixel/PixelPanel";
import { AvatarOrInitials } from "../../components/pixel/AvatarOrInitials";

export const dynamic = "force-dynamic";

function normalizeXHandle(val: string): string {
  const match = val.match(/(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\/@?([\w]+)/i);
  if (match) return match[1];
  return val.replace(/^@/, "");
}

// Dev-preview placeholder data (mirrors /members/page.tsx) — used when Supabase isn't configured yet.
const PLACEHOLDER: Record<string, Profile> = {
  p1: { id: "p1", name: "Rejaws", avatar_url: null, location: "London", building: "A pixel-art coworking queue for Sunday ramen syndicates.", x_handle: "rejaws", linkedin_url: null, website_url: null, researcher_number: 1, created_at: new Date().toISOString() },
  p2: { id: "p2", name: "Sherghan", avatar_url: null, location: "London", building: "AI voice assistants that don't sound like robots.", x_handle: null, linkedin_url: "https://linkedin.com/in/sherghan", website_url: null, researcher_number: 2, created_at: new Date().toISOString() },
  p3: { id: "p3", name: "Pussin", avatar_url: null, location: "Remote", building: "Developer tools for browser automation.", x_handle: "pussin", linkedin_url: null, website_url: "https://pussin.dev", researcher_number: 3, created_at: new Date().toISOString() },
  p4: { id: "p4", name: "Jonanon", avatar_url: null, location: "London", building: "Hardware prototype for solar-powered routers.", x_handle: null, linkedin_url: null, website_url: null, researcher_number: 4, created_at: new Date().toISOString() },
  p5: { id: "p5", name: "Kai", avatar_url: null, location: "London", building: "Ramyeon Labs — a Sunday coworking syndicate.", x_handle: "kai", linkedin_url: null, website_url: null, researcher_number: 5, created_at: new Date().toISOString() },
};

export default async function ResearcherProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = isSupabaseConfigured() ? await getProfileById(id) : PLACEHOLDER[id] || null;
  if (!r) notFound();

  return (
    <div className="space-y-5">
      <Link href="/" className="font-pixel text-[8px] text-rl-text uppercase">
        ← BACK
      </Link>
      <PixelPanel title={`Researcher #${String(r.researcher_number).padStart(3, "0")}`}>
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <AvatarOrInitials url={r.avatar_url} name={r.name} size={128} />
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <h1 className="font-pixel text-[16px] text-rl-text uppercase">{r.name}</h1>
            {r.location && (
              <div className="font-pixel text-[8px] text-rl-muted uppercase">📍 {r.location}</div>
            )}
            {r.building && (
              <div className="font-sans text-[14px] font-semibold text-rl-text">
                <span className="font-pixel text-[7px] uppercase text-rl-muted mr-2">BUILDING:</span>
                {r.building}
              </div>
            )}
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start pt-2">
              {r.x_handle && (
                <a
                  href={`https://x.com/${normalizeXHandle(r.x_handle)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-pixel text-[8px] text-rl-text bg-rl-yellow border-[3px] border-rl-border rounded px-3 py-2"
                >
                  X / @{normalizeXHandle(r.x_handle)}
                </a>
              )}
              {r.linkedin_url && (
                <a
                  href={r.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-pixel text-[8px] text-rl-text bg-rl-yellow border-[3px] border-rl-border rounded px-3 py-2"
                >
                  LINKEDIN
                </a>
              )}
              {r.website_url && (
                <a
                  href={r.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-pixel text-[8px] text-rl-text bg-rl-yellow border-[3px] border-rl-border rounded px-3 py-2"
                >
                  WEBSITE
                </a>
              )}
            </div>
          </div>
        </div>
      </PixelPanel>
    </div>
  );
}
