"use client";
import { useMemo, useState } from "react";
import { Project } from "../lib/supabase/queries";
import { PixelCard } from "../components/pixel/PixelCard";
import { PixelButton } from "../components/pixel/PixelButton";
import { createClient } from "../lib/supabase/client";

const TAG_OPTIONS = ["AI", "Dev Tools", "Robotics", "Web3", "Climate", "Hardware", "Other"];

export function ProjectsClient({ projects, canPost }: { projects: Project[]; canPost: boolean }) {
  const [tag, setTag] = useState<string>("ALL");
  const [open, setOpen] = useState(false);

  const tags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.tags?.forEach((t) => set.add(t)));
    return ["ALL", ...Array.from(set)];
  }, [projects]);

  const filtered = tag === "ALL" ? projects : projects.filter((p) => p.tags?.includes(tag));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <h1 className="font-pixel text-rl-yellow text-xl uppercase">Community Projects</h1>
        {canPost && (
          <PixelButton onClick={() => setOpen(true)}>POST A PROJECT +</PixelButton>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setTag(t)}
            className={`font-sans text-xs uppercase tracking-[1px] px-3 py-2 rounded border-2 ${
              tag === t ? "border-rl-yellow bg-rl-yellow text-rl-base" : "border-rl-muted text-rl-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="font-sans text-rl-muted text-sm py-12 text-center">
          NO PROJECTS YET... COOK SOMETHING UP 🍜
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PixelCard key={p.id}>
              {p.screenshot_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.screenshot_url}
                  alt={p.title}
                  className="w-full aspect-video object-cover border border-rl-border rounded mb-3"
                  style={{ imageRendering: "pixelated" }}
                />
              ) : (
                <div className="w-full aspect-video bg-rl-surface-2 border border-rl-border rounded mb-3 flex items-center justify-center font-pixel text-[10px] text-rl-muted">
                  NO SCREENSHOT
                </div>
              )}
              <h3 className="font-sans font-bold text-base text-rl-text">{p.title}</h3>
              {p.description && (
                <p className="font-sans text-xs text-rl-muted mt-2 line-clamp-3">{p.description}</p>
              )}
              {p.tags && p.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap mt-3">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="font-pixel text-[8px] text-rl-yellow border border-rl-yellow px-2 py-1 rounded uppercase"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {p.project_url && (
                <a
                  href={p.project_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block font-sans text-xs text-rl-yellow uppercase tracking-[1px]"
                >
                  VIEW PROJECT →
                </a>
              )}
            </PixelCard>
          ))}
        </div>
      )}

      {open && canPost && <PostProjectModal onClose={() => setOpen(false)} />}
    </div>
  );
}

function PostProjectModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!title) return setErr("TITLE REQUIRED");
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("NOT LOGGED IN");

      let screenshot_url: string | null = null;
      if (file) {
        if (file.size > 5 * 1024 * 1024) throw new Error("IMAGE MUST BE UNDER 5MB");
        const ext = file.name.split(".").pop() || "png";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("projects").upload(path, file);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("projects").getPublicUrl(path);
        screenshot_url = pub.publicUrl;
      }

      const { error } = await supabase.from("projects").insert({
        profile_id: user.id,
        title,
        description: description || null,
        project_url: projectUrl || null,
        tags: selectedTags.length ? selectedTags : null,
        screenshot_url,
      });
      if (error) throw error;
      onClose();
      window.location.reload();
    } catch (e: any) {
      setErr(e.message || "FAILED");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-rl-base/80 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-rl-surface border-2 border-rl-yellow shadow-pixel-lg rounded p-6 max-w-lg w-full space-y-3"
      >
        <h2 className="font-pixel text-rl-yellow text-sm uppercase mb-2">Post a Project</h2>
        <input placeholder="TITLE" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full" />
        <div>
          <textarea
            placeholder="DESCRIPTION (MAX 500)"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
            className="w-full"
            rows={4}
          />
          <div className="font-sans text-xs text-rl-muted text-right">{description.length}/500</div>
        </div>
        <input placeholder="PROJECT URL (OPTIONAL)" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} className="w-full" />
        <div>
          <div className="font-pixel text-[8px] text-rl-yellow uppercase mb-2">Tags</div>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((t) => {
              const on = selectedTags.includes(t);
              return (
                <button
                  type="button"
                  key={t}
                  onClick={() =>
                    setSelectedTags(on ? selectedTags.filter((x) => x !== t) : [...selectedTags, t])
                  }
                  className={`font-sans text-[10px] uppercase px-2 py-1 rounded border-2 ${
                    on ? "border-rl-yellow bg-rl-yellow text-rl-base" : "border-rl-muted text-rl-muted"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <div className="font-pixel text-[8px] text-rl-yellow uppercase mb-2">Screenshot (max 5MB)</div>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        {err && <div className="font-sans text-xs text-rl-danger">{err}</div>}
        <div className="flex gap-2 justify-end pt-2">
          <PixelButton type="button" variant="outline" onClick={onClose}>
            CANCEL
          </PixelButton>
          <PixelButton type="submit" disabled={loading}>
            {loading ? "POSTING..." : "POST →"}
          </PixelButton>
        </div>
      </form>
    </div>
  );
}
