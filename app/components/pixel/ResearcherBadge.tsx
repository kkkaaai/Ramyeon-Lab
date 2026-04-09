export function ResearcherBadge({ number }: { number: number }) {
  const padded = String(number).padStart(3, "0");
  return (
    <span className="inline-block bg-rl-yellow text-rl-base font-pixel text-[8px] px-2 py-1 rounded border-2 border-rl-border">
      #{padded}
    </span>
  );
}
