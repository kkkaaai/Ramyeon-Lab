/* eslint-disable @next/next/no-img-element */
export function AvatarOrInitials({
  url,
  name,
  size = 32,
}: {
  url: string | null | undefined;
  name: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        className="border-[3px] border-rl-border object-cover rounded"
        style={{ width: size, height: size, imageRendering: "pixelated" }}
      />
    );
  }

  return (
    <div
      className="border-[3px] border-rl-border bg-rl-yellow text-rl-text font-pixel flex items-center justify-center rounded"
      style={{ width: size, height: size, fontSize: Math.max(6, size / 4) }}
    >
      {initials || "??"}
    </div>
  );
}
