import { getCurrentUserProfile, getPublishedProjects } from "../lib/supabase/queries";
import { ProjectsClient } from "./ProjectsClient";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, me] = await Promise.all([
    getPublishedProjects(),
    getCurrentUserProfile(),
  ]);
  return <ProjectsClient projects={projects} canPost={!!me} />;
}
