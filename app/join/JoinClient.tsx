"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import { PixelCard } from "../components/pixel/PixelCard";
import { PixelButton } from "../components/pixel/PixelButton";

export function JoinClient({ hasUser }: { hasUser: boolean }) {
  const [stage, setStage] = useState<"auth" | "profile">(hasUser ? "profile" : "auth");
  const router = useRouter();

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-pixel text-rl-text text-xl uppercase mb-6">Join Ramyeon Labs</h1>
      {stage === "auth" ? (
        <AuthForm onSuccess={() => setStage("profile")} />
      ) : (
        <ProfileForm onDone={() => router.push("/members")} />
      )}
    </div>
  );
}

function AuthForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      // If email confirmation disabled, user is logged in. Otherwise try signIn.
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const { error: siErr } = await supabase.auth.signInWithPassword({ email, password });
        if (siErr) throw siErr;
      }
      onSuccess();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PixelCard>
      <form onSubmit={submit} className="space-y-3">
        <h2 className="font-pixel text-rl-text text-sm uppercase mb-2">Create Account</h2>
        <input type="email" required placeholder="EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" />
        <input type="password" required placeholder="PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full" />
        {err && <div className="font-sans text-xs text-rl-danger">{err}</div>}
        <PixelButton type="submit" className="w-full" disabled={loading}>
          {loading ? "CREATING..." : "SIGN UP →"}
        </PixelButton>
      </form>
    </PixelCard>
  );
}

function ProfileForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [building, setBuilding] = useState("");
  const [x, setX] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!name || !location || !building) return setErr("NAME, LOCATION, AND BUILDING REQUIRED");
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("NOT LOGGED IN");

      let avatar_url: string | null = null;
      if (avatar) {
        const ext = avatar.name.split(".").pop() || "png";
        const path = `${user.id}/avatar.${ext}`;
        const { error: upErr } = await supabase.storage.from("avatars").upload(path, avatar, { upsert: true });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
        avatar_url = pub.publicUrl;
      }

      // Compute the next researcher_number as MAX + 1 instead of relying on
      // the Postgres serial sequence (which can drift when test users are
      // seeded and cleared — we've seen it jump to #105 after cleanup).
      const { data: maxRow } = await supabase
        .from("profiles")
        .select("researcher_number")
        .order("researcher_number", { ascending: false })
        .limit(1)
        .maybeSingle();
      const nextNumber = (maxRow?.researcher_number || 0) + 1;

      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        name,
        location,
        building,
        x_handle: x || null,
        linkedin_url: linkedin || null,
        website_url: website || null,
        avatar_url,
        researcher_number: nextNumber,
      });
      if (error) throw error;
      onDone();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PixelCard>
      <form onSubmit={submit} className="space-y-3">
        <h2 className="font-pixel text-rl-text text-sm uppercase mb-2">Create Profile</h2>
        <input required placeholder="NAME *" value={name} onChange={(e) => setName(e.target.value)} className="w-full" />
        <input required placeholder="LOCATION (e.g. LONDON) *" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full" />
        <div>
          <textarea
            required
            placeholder="WHAT ARE YOU BUILDING? (MAX 280) *"
            value={building}
            onChange={(e) => setBuilding(e.target.value.slice(0, 280))}
            className="w-full"
            rows={3}
          />
          <div className="font-sans text-xs text-rl-muted text-right">{building.length}/280</div>
        </div>
        <input placeholder="@X HANDLE (OPTIONAL)" value={x} onChange={(e) => setX(e.target.value)} className="w-full" />
        <input placeholder="LINKEDIN URL (OPTIONAL)" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="w-full" />
        <input placeholder="WEBSITE URL (OPTIONAL)" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full" />
        <div>
          <div className="font-pixel text-[8px] text-rl-text uppercase mb-2">Avatar (Optional)</div>
          <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files?.[0] || null)} />
        </div>
        {err && <div className="font-sans text-xs text-rl-danger">{err}</div>}
        <PixelButton type="submit" className="w-full" disabled={loading}>
          {loading ? "CREATING..." : "CREATE PROFILE →"}
        </PixelButton>
      </form>
    </PixelCard>
  );
}
