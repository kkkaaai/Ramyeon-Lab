import { ReactNode } from "react";

// Rounded cream panel with yellow header strip — matches the reference design.
export function PixelPanel({
  title,
  children,
  className = "",
  headerRight,
  contentClassName = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
  contentClassName?: string;
}) {
  return (
    <div
      className={`bg-rl-yellow-light border-4 border-rl-border rounded-lg overflow-hidden text-rl-text ${className}`}
    >
      {title && (
        <div className="bg-rl-yellow border-b-4 border-rl-border px-4 py-3 flex items-center justify-between">
          <h3 className="font-pixel text-[10px] uppercase text-rl-text tracking-wider">{title}</h3>
          {headerRight}
        </div>
      )}
      <div className={`p-4 ${contentClassName}`}>{children}</div>
    </div>
  );
}
