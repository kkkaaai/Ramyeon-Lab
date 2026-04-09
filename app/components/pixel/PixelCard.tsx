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
    "bg-rl-surface border-2 border-rl-yellow shadow-pixel rounded p-4 transition-all";
  const hover = onClick ? "hover:shadow-pixel-lg hover:-translate-y-[1px] cursor-pointer" : "";
  const tint = highlighted ? "bg-rl-border/20" : "";
  return (
    <div className={`${base} ${hover} ${tint} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
