import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "../../lib/supabase/queries";
import { EditProfileClient } from "./EditProfileClient";

export const dynamic = "force-dynamic";

export default async function EditProfilePage() {
  const me = await getCurrentUserProfile();
  if (!me) redirect("/join");
  return <EditProfileClient profile={me} />;
}
