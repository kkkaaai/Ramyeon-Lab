import type { Metadata } from "next";
import { Press_Start_2P, Space_Mono, VT323 } from "next/font/google";
import "./globals.css";
import { TopNav } from "./components/nav/TopNav";
import { getCurrentUserProfile } from "./lib/supabase/queries";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});
const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press-start",
  // "block" hides pixel-font text briefly while loading instead of
  // swapping from a fallback — prevents the ghost double-render we saw
  // on the COOKING NOW row during the initial paint.
  display: "block",
  adjustFontFallback: false,
});
const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt323",
  display: "block",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Ramyeon Labs — Sunday Coworking Syndicate",
  description: "A pixel-art coworking community for London builders.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentUserProfile();
  return (
    <html lang="en" className={`${spaceMono.variable} ${pressStart.variable} ${vt323.variable}`}>
      <body className="font-sans">
        <div className="steam-layer" aria-hidden>
          <span className="steam-puff shape-a" style={{ left: "6%", animationDuration: "13s", animationDelay: "0s" }} />
          <span className="steam-puff shape-b" style={{ left: "14%", animationDuration: "17s", animationDelay: "4s" }} />
          <span className="steam-puff shape-c" style={{ left: "22%", animationDuration: "20s", animationDelay: "2s" }} />
          <span className="steam-puff shape-d" style={{ left: "30%", animationDuration: "15s", animationDelay: "7s" }} />
          <span className="steam-puff shape-a" style={{ left: "38%", animationDuration: "18s", animationDelay: "1s" }} />
          <span className="steam-puff shape-c" style={{ left: "46%", animationDuration: "16s", animationDelay: "9s" }} />
          <span className="steam-puff shape-b" style={{ left: "54%", animationDuration: "19s", animationDelay: "3s" }} />
          <span className="steam-puff shape-d" style={{ left: "62%", animationDuration: "14s", animationDelay: "6s" }} />
          <span className="steam-puff shape-a" style={{ left: "70%", animationDuration: "21s", animationDelay: "10s" }} />
          <span className="steam-puff shape-c" style={{ left: "78%", animationDuration: "17s", animationDelay: "5s" }} />
          <span className="steam-puff shape-b" style={{ left: "86%", animationDuration: "15s", animationDelay: "8s" }} />
          <span className="steam-puff shape-d" style={{ left: "94%", animationDuration: "19s", animationDelay: "12s" }} />
        </div>
        <div className="w-full max-w-[1100px] mx-auto px-5 pt-5 pb-8 relative z-[1]">
          <TopNav
            loggedIn={!!profile}
            researcherName={profile?.name}
            researcherAvatar={profile?.avatar_url}
          />
          {children}
        </div>
      </body>
    </html>
  );
}
