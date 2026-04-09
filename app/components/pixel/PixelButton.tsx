import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-rl-yellow text-rl-text border-4 border-rl-border shadow-pixel hover:translate-y-[2px] hover:shadow-pixel-sm",
  outline: "bg-rl-yellow-light text-rl-text border-4 border-rl-border shadow-pixel hover:translate-y-[2px] hover:shadow-pixel-sm",
  danger: "bg-rl-danger text-white border-4 border-rl-border shadow-pixel hover:translate-y-[2px] hover:shadow-pixel-sm",
};

const base =
  "inline-flex items-center justify-center px-5 py-3 font-pixel text-[10px] uppercase tracking-wider rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed";

export function PixelButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function PixelLink({
  children,
  href,
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  href: string;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
