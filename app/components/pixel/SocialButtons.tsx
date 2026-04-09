export function SocialButtons({
  x,
  linkedin,
  website,
}: {
  x?: string | null;
  linkedin?: string | null;
  website?: string | null;
}) {
  // If no social links at all, render nothing so we don't leave an empty gap in cards.
  if (!x && !linkedin && !website) return null;

  const withProtocol = (url: string) =>
    url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;

  const btn =
    "inline-flex items-center justify-center w-7 h-7 shrink-0 border-[2px] border-rl-border bg-white text-rl-text rounded hover:bg-rl-yellow transition-colors font-bold text-[11px] leading-none";

  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {x && (
        <a
          href={`https://x.com/${x.replace(/^@/, "")}`}
          target="_blank"
          rel="noreferrer"
          className={btn}
          aria-label="X / Twitter"
        >
          𝕏
        </a>
      )}
      {linkedin && (
        <a href={withProtocol(linkedin)} target="_blank" rel="noreferrer" className={btn} aria-label="LinkedIn">
          in
        </a>
      )}
      {website && (
        <a href={withProtocol(website)} target="_blank" rel="noreferrer" className={btn} aria-label="Website">
          www
        </a>
      )}
    </div>
  );
}
