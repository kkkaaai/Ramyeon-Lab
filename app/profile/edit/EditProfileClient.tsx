"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { PixelPanel } from "../../components/pixel/PixelPanel";
import { PixelButton } from "../../components/pixel/PixelButton";
import { AvatarOrInitials } from "../../components/pixel/AvatarOrInitials";
import type { Profile } from "../../lib/supabase/queries";

function normalizeXHandle(val: string): string {
  const trimmed = val.trim();
  const match = trimmed.match(/(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\/@?([\w]+)/i);
  if (match) return match[1];
  return trimmed.replace(/^@/, "");
}

function normalizeUrl(val: string): string {
  const trimmed = val.trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function EditProfileClient({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [name, setName] = useState(profile.name || "");
  const [location, setLocation] = useState(profile.location || "");
  const [building, setBuilding] = useState(profile.building || "");
  const [xHandle, setXHandle] = useState(profile.x_handle || "");
  const [linkedin, setLinkedin] = useState(profile.linkedin_url || "");
  const [website, setWebsite] = useState(profile.website_url || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(profile.avatar_url);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(false);
    if (!name.trim() || !location.trim() || !building.trim()) {
      setErr("Name, location, and building are required.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      let avatar_url: string | null = currentAvatar;
      if (avatar) {
        const ext = avatar.name.split(".").pop() || "png";
        const path = `${user.id}/avatar.${ext}`;
        const { error: upErr } = await supabase.storage.from("avatars").upload(path, avatar, { upsert: true });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
        avatar_url = `${pub.publicUrl}?v=${Date.now()}`;
        setCurrentAvatar(avatar_url);
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          name: name.trim(),
          location: location.trim(),
          building: building.trim(),
          x_handle: xHandle.trim() || null,
          linkedin_url: linkedin.trim() || null,
          website_url: website.trim() || null,
          avatar_url,
        })
        .eq("id", user.id);
      if (error) throw error;
      setOk(true);
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-lg mx-auto">
      <PixelPanel title={`Edit Profile — #${String(profile.researcher_number).padStart(3, "0")}`}>
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center gap-4">
            <AvatarOrInitials url={currentAvatar} name={name || profile.name} size={72} />
            <div className="flex-1">
              <div className="font-pixel text-[8px] text-rl-text uppercase mb-2">Change Avatar</div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div>
            <label className="font-pixel text-[8px] text-rl-text uppercase block mb-1">Name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="font-pixel text-[8px] text-rl-text uppercase block mb-1">Location *</label>
            <input
              required
              placeholder="e.g. London"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="font-pixel text-[8px] text-rl-text uppercase block mb-1">What are you building? *</label>
            <textarea
              required
              value={building}
              onChange={(e) => setBuilding(e.target.value.slice(0, 280))}
              className="w-full"
              rows={3}
            />
            <div className="font-sans text-xs text-rl-muted text-right">{building.length}/280</div>
          </div>

          <div>
            <label className="font-pixel text-[8px] text-rl-text uppercase block mb-1">X / Twitter</label>
            <input
              placeholder="@handle or https://x.com/handle"
              value={xHandle}
              onChange={(e) => setXHandle(e.target.value)}
              onBlur={(e) => setXHandle(normalizeXHandle(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="font-pixel text-[8px] text-rl-text uppercase block mb-1">LinkedIn URL</label>
            <input
              placeholder="https://linkedin.com/in/..."
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              onBlur={(e) => setLinkedin(normalizeUrl(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="font-pixel text-[8px] text-rl-text uppercase block mb-1">Website</label>
            <input
              placeholder="https://..."
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              onBlur={(e) => setWebsite(normalizeUrl(e.target.value))}
              className="w-full"
            />
          </div>

          {err && (
            <div className="bg-rl-danger/10 border-[3px] border-rl-danger rounded-lg px-3 py-2 font-sans text-sm text-rl-danger text-center">
              ⚠ {err}
            </div>
          )}
          {ok && (
            <div className="bg-rl-yellow border-[3px] border-rl-border rounded-lg px-3 py-2 font-sans text-sm text-rl-text text-center font-semibold">
              ✓ Profile updated
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <PixelButton type="submit" className="flex-1" disabled={loading}>
              {loading ? "SAVING..." : "SAVE CHANGES"}
            </PixelButton>
            <PixelButton
              type="button"
              variant="outline"
              onClick={() => router.push(`/members/${profile.id}`)}
            >
              VIEW PROFILE
            </PixelButton>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t-[3px] border-rl-border/30">
          <button
            onClick={logout}
            className="font-pixel text-[9px] uppercase tracking-wider text-rl-danger hover:underline"
          >
            LOG OUT →
          </button>
        </div>
      </PixelPanel>
    </div>
  );
}
