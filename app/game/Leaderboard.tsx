import { createClient, isSupabaseConfigured } from "../lib/supabase/server";
import { AvatarOrInitials } from "../components/pixel/AvatarOrInitials";

type LeaderEntry = {
  profile_id: string;
  score: number;
  name: string;
  avatar_url: string | null;
  researcher_number: number;
};

async function getLeaderboard(): Promise<LeaderEntry[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("game_scores")
      .select("score, profile_id, profiles(name, avatar_url, researcher_number)")
      .order("score", { ascending: false })
      .limit(200);

    if (error || !data) return [];

    // Keep highest score per player
    const best = new Map<string, LeaderEntry>();
    for (const row of data) {
      const p = (Array.isArray(row.profiles) ? row.profiles[0] : row.profiles) as { name: string; avatar_url: string | null; researcher_number: number } | null;
      if (!p) continue;
      const existing = best.get(row.profile_id);
      if (!existing || existing.score < row.score) {
        best.set(row.profile_id, {
          profile_id: row.profile_id,
          score: row.score,
          name: p.name,
          avatar_url: p.avatar_url,
          researcher_number: p.researcher_number,
        });
      }
    }

    return Array.from(best.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch {
    return [];
  }
}

const RANK_STYLES: Record<number, string> = {
  0: "bg-rl-yellow border-rl-border",
  1: "bg-rl-yellow-light border-rl-border",
  2: "bg-rl-yellow-light border-rl-border",
};

export async function Leaderboard() {
  const entries = await getLeaderboard();

  return (
    <div className="bg-rl-yellow-light border-4 border-rl-border rounded-xl shadow-pixel p-4 w-full">
      <h2 className="font-pixel text-[11px] text-rl-text text-center mb-4 tracking-wide">
        HALL OF EGGS
      </h2>

      {entries.length === 0 ? (
        <div className="py-8 text-center">
          <p className="font-pixel text-[8px] text-rl-text/50 leading-[2.4]">
            NO SCORES YET<br />BE THE FIRST!
          </p>
        </div>
      ) : (
        <ol className="space-y-2">
          {entries.map((entry, i) => (
            <li
              key={entry.profile_id}
              className={`flex items-center gap-2 px-2 py-2 rounded-lg border-2 ${RANK_STYLES[i] ?? "bg-white/30 border-rl-border/40"}`}
            >
              <span className="font-pixel text-[8px] text-rl-text/60 w-4 text-right shrink-0">
                {i + 1}
              </span>
              <AvatarOrInitials
                url={entry.avatar_url}
                name={entry.name}
                size={26}
              />
              <span className="font-pixel text-[8px] text-rl-text flex-1 truncate">
                {entry.name.split(" ")[0].toUpperCase()}
              </span>
              <span className="font-pixel text-[11px] text-rl-text shrink-0 tabular-nums">
                {entry.score}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
