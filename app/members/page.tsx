import { redirect } from "next/navigation";
import { getAllProfiles, getCurrentUserProfile, Profile } from "../lib/supabase/queries";
import { isSupabaseConfigured } from "../lib/supabase/server";
import { MembersClient } from "./MembersClient";

export const dynamic = "force-dynamic";

// Placeholder data for dev/preview before Supabase is wired up
const PLACEHOLDER: Profile[] = [
  { id: "p1", name: "Rejaws", avatar_url: null, location: "London", building: "A pixel-art coworking queue for Sunday ramen syndicates.", x_handle: "rejaws", linkedin_url: null, website_url: null, researcher_number: 1, created_at: new Date().toISOString() },
  { id: "p2", name: "Sherghan", avatar_url: null, location: "London", building: "AI voice assistants that don't sound like robots.", x_handle: null, linkedin_url: "https://linkedin.com/in/sherghan", website_url: null, researcher_number: 2, created_at: new Date().toISOString() },
  { id: "p3", name: "Pussin", avatar_url: null, location: "Remote", building: "Developer tools for browser automation.", x_handle: "pussin", linkedin_url: null, website_url: "https://pussin.dev", researcher_number: 3, created_at: new Date().toISOString() },
  { id: "p4", name: "Jonanon", avatar_url: null, location: "London", building: "Hardware prototype for solar-powered routers.", x_handle: null, linkedin_url: null, website_url: null, researcher_number: 4, created_at: new Date().toISOString() },
  { id: "p5", name: "Kai", avatar_url: null, location: "London", building: "Ramyeon Labs — a Sunday coworking syndicate.", x_handle: "kai", linkedin_url: null, website_url: null, researcher_number: 5, created_at: new Date().toISOString() },
];

export default async function MembersPage() {
  // Dev fallback: if Supabase isn't configured, show placeholder members.
  if (!isSupabaseConfigured()) {
    return <MembersClient profiles={PLACEHOLDER} meId="p5" />;
  }

  const me = await getCurrentUserProfile();
  if (!me) redirect("/join");
  const profiles = await getAllProfiles();
  return <MembersClient profiles={profiles} meId={me.id} />;
}
