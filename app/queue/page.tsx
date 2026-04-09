import { QueueDisplay } from "./QueueDisplay";

export const dynamic = "force-dynamic";

// Full-screen queue display — no nav, no padding.
// Overrides the default layout chrome by rendering full-bleed.
export default function QueuePage() {
  return <QueueDisplay />;
}
