"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AvatarOrInitials } from "../pixel/AvatarOrInitials";
import { createClient } from "../../lib/supabase/client";

const leftLinks = [
  { href: "/", label: "HOME", mobileHide: false },
  { href: "/members", label: "MEMBERS", mobileHide: true },
  { href: "/game", label: "GAME", mobileHide: true },
];
const rightLinks = [
  { href: "/queue", label: "QUEUE", mobileHide: true },
];

export function TopNav({
  loggedIn,
  researcherName,
  researcherAvatar,
}: {
  loggedIn: boolean;
  researcherName?: string;
  researcherAvatar?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const linkClass = (href: string) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return active
      ? "bg-rl-orange border-[3px] border-rl-border px-3 py-2 rounded-lg font-pixel text-[11px] text-rl-text cursor-pointer"
      : "font-pixel text-[11px] text-rl-text px-3 py-2 cursor-pointer hover:text-white";
  };

  return (
    <header className="relative bg-rl-yellow border-4 border-rl-border rounded-[15px] flex items-center justify-between px-4 pt-4 pb-3 mb-8 mt-14">
      <ul className="flex gap-2 list-none p-0 m-0">
        {leftLinks.map((l) => (
          <li key={l.href} className={l.mobileHide ? "hidden sm:block" : ""}>
            <Link href={l.href} className={linkClass(l.href)}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Centered logo — floats mostly above the nav bar so it never
          overlaps the page content below. */}
      <Link
        href="/"
        aria-label="Ramyeon Labs"
        className="absolute left-1/2 -translate-x-1/2 -top-[58px] w-[108px] h-[108px] md:w-[120px] md:h-[120px] md:-top-[64px] flex items-center justify-center z-10"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-badge.png"
          alt="RL"
          className="w-full h-full object-contain"
          style={{ imageRendering: "auto" }}
        />
      </Link>

      <ul className="flex gap-2 list-none p-0 m-0 items-center">
        {rightLinks.map((l) => (
          <li key={l.href} className={l.mobileHide ? "hidden sm:block" : ""}>
            <Link href={l.href} className={linkClass(l.href)}>
              {l.label}
            </Link>
          </li>
        ))}
        {loggedIn ? (
          <li ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Profile menu"
              className="block"
            >
              <AvatarOrInitials url={researcherAvatar} name={researcherName || "??"} size={32} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 min-w-[180px] bg-rl-yellow-light border-4 border-rl-border rounded-lg shadow-pixel-dark z-20 overflow-hidden">
                <Link
                  href="/profile/edit"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 font-pixel text-[9px] text-rl-text uppercase hover:bg-rl-yellow"
                >
                  EDIT PROFILE
                </Link>
                <Link
                  href="/members"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 font-pixel text-[9px] text-rl-text uppercase hover:bg-rl-yellow border-t-2 border-rl-border"
                >
                  MEMBERS
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-3 font-pixel text-[9px] text-rl-text uppercase hover:bg-rl-yellow border-t-2 border-rl-border"
                >
                  LOG OUT →
                </button>
              </div>
            )}
          </li>
        ) : (
          <li>
            <Link
              href="/join"
              className="font-pixel text-[9px] text-rl-text bg-rl-yellow-light border-4 border-rl-border shadow-pixel px-3 py-2 rounded-lg whitespace-nowrap"
            >
              JOIN →
            </Link>
          </li>
        )}
      </ul>
    </header>
  );
}
