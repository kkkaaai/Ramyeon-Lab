import { redirect } from "next/navigation";
import { getActiveSession, getCurrentUserProfile } from "../../lib/supabase/queries";
import { JoinQueueClient } from "./JoinQueueClient";
import { PixelCard } from "../../components/pixel/PixelCard";

export const dynamic = "force-dynamic";

export default async function JoinQueuePage() {
  const me = await getCurrentUserProfile();
  if (!me) redirect("/join");
  const session = await getActiveSession();
  if (!session) {
    return (
      <PixelCard>
        <div className="font-pixel text-rl-yellow text-sm mb-2">NO ACTIVE SESSION</div>
        <p className="font-sans text-sm text-rl-muted">Check back when the host activates the next session.</p>
      </PixelCard>
    );
  }
  return <JoinQueueClient sessionId={session.id} sessionLabel={session.label} me={{ id: me.id, name: me.name, researcher_number: me.researcher_number }} />;
}
