import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import { JoinClient } from "./JoinClient";

export const dynamic = "force-dynamic";

export default async function JoinPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (existing) redirect("/members");
  }

  return <JoinClient hasUser={!!user} />;
}
