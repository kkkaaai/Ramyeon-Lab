import { ReactNode } from "react";

export function PixelCard({
  children,
  className = "",
  highlighted = false,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  highlighted?: boolean;
  onClick?: () => void;
}) {
  const base =
    "bg-rl-yellow-light border-4 border-rl-border shadow-pixel rounded-lg p-4 transition-all";
  const hover = onClick ? "hover:shadow-pixel-lg hover:-translate-y-[1px] cursor-pointer" : "";
  const tint = highlighted ? "bg-rl-yellow" : "";
  return (
    <div className={`${base} ${hover} ${tint} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
