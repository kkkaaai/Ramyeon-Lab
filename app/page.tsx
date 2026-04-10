import Link from "next/link";
import {
  getCurrentUserProfile,
  getProfileCount,
  getRecentProfiles,
} from "./lib/supabase/queries";
import { PixelPanel } from "./components/pixel/PixelPanel";
import { AvatarOrInitials } from "./components/pixel/AvatarOrInitials";
import { TutorialCarousel } from "./components/TutorialCarousel";

const TUTORIALS = [
  {
    name: "SOUP NOODLE",
    image: "/ramyeon-soup.jpeg",
    alt: "Ansung Tangmyun soup noodle pack",
    altImages: ["/ramyeon-soup.png"],
    tagline: "The classic brothy bowl. (e.g. Ansung Tangmyun, Shin Ramyun)",
    steps: [
      "Check the package — confirm it's a soup noodle.",
      "Put the noodles AND all sauce packets into the bowl.",
      "Press the START button on the machine (water comes out from the machine).",
      "When 1:30 is left on the timer, crack an egg on top.",
      "Wait until it finishes, then top with cheese and enjoy!",
    ],
  },
  {
    name: "DRY NOODLE",
    image: "/ramyeon-dry.jpeg",
    alt: "Shin Toomba Stir Fry dry noodle pack",
    altImages: ["/ramyeon-dry.png"],
    tagline: "Saucy, spicy, no broth. (e.g. Shin Toomba Stir Fry, Buldak Carbonara)",
    steps: [
      "Check the package — confirm it's a dry noodle.",
      "Put the noodles into the bowl (sauce packet stays OUT for now).",
      "Press the START button on the machine (water comes out from the machine).",
      "When 1:30 is left on the timer, crack an egg on top.",
      "When cooking finishes, drain the water into the sink.",
      "Add the sauce packet, mix well, top with cheese and enjoy!",
    ],
  },
];

const PLACEHOLDER_SESSIONS = [
  { day: 28, month: "OCT" },
  { day: 11, month: "NOV" },
  { day: 25, month: "NOV" },
];

const PLACEHOLDER_MEMBERS = ["REJAWS", "SHERGHAN", "PUSSIN", "JONANON"];

const PLACEHOLDER_ACTIVITY = [
  { title: "RAMYEON LABS NEW SESSION", time: "1 HOUR AGO" },
  { title: "NEW RESEARCHER JOINED", time: "1 HOUR AGO" },
  { title: "PROJECT POSTED", time: "1 HOUR AGO" },
];

export default async function HomePage() {
  const [profile, researchers, researcherCount] = await Promise.all([
    getCurrentUserProfile(),
    getRecentProfiles(10),
    getProfileCount(),
  ]);

  return (
    <div className="space-y-5">
      {/* Hero — cream outer frame around the illustrated scene (matches reference) */}
      <section className="bg-rl-yellow-light border-4 border-rl-border rounded-[15px] p-[10px] shadow-pixel-dark">
        <div className="relative border-4 border-rl-border rounded-lg overflow-hidden h-[340px] md:h-[390px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero.png"
            alt="Welcome to Ramyeon Labs — your Sunday coworking syndicate"
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ imageRendering: "pixelated" }}
          />
          <div className="relative z-10 h-full flex flex-col items-center justify-center gap-6 px-6 text-center">
            <h1
              className="font-pixel text-white uppercase leading-[1.5] text-[18px] md:text-[28px]"
              style={{ textShadow: "3px 3px 0 #2e1a11, -2px -2px 0 #2e1a11, 2px -2px 0 #2e1a11, -2px 2px 0 #2e1a11" }}
            >
              Welcome to Ramyeon Labs:
              <br />
              Your Sunday Coworking
              <br />
              Syndicate
            </h1>
            <Link
              href={profile ? "/members" : "/join"}
              className="inline-block bg-rl-yellow border-4 border-rl-border shadow-pixel px-6 py-4 font-pixel text-[10px] text-rl-text rounded-lg hover:translate-y-[2px] hover:shadow-pixel-sm transition-all"
            >
              {profile ? "GO TO COMMUNITY" : "JOIN THE SYNDICATE"}
            </Link>
          </div>
        </div>
      </section>

      {/* Queue banner — prominent link to live queue */}
      <Link
        href="/queue"
        className="group block bg-rl-yellow border-4 border-rl-border rounded-[15px] px-6 py-5 shadow-pixel-dark hover:translate-y-[2px] hover:shadow-pixel transition-all"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🍜</span>
            <div>
              <div className="font-pixel text-[12px] md:text-[14px] text-rl-text uppercase leading-[1.6]">
                See the Queue Here
              </div>
              <div className="font-sans text-[13px] md:text-[14px] text-rl-text/80">
                Live ramyeon cooking queue — who's up next?
              </div>
            </div>
          </div>
          <span className="font-pixel text-[16px] md:text-[20px] text-rl-text group-hover:translate-x-1 transition-transform">▶</span>
        </div>
      </Link>

      {/* Ramyeon Researchers — full-width grid of profile cards */}
      <PixelPanel title="Ramyeon Researchers">
        {researchers.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-fr">
            {PLACEHOLDER_MEMBERS.map((name, i) => (
              <div
                key={i}
                className="bg-white border-[3px] border-rl-border rounded-lg p-4 flex flex-col items-center gap-2"
              >
                <AvatarOrInitials url={null} name={name} size={56} />
                <div className="font-pixel text-[8px] text-rl-text uppercase text-center">{name}</div>
                <div className="font-pixel text-[6px] text-rl-muted">#{String(i + 1).padStart(3, "0")}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-fr">
            {researchers.map((r) => (
              <Link
                key={r.id}
                href={`/members/${r.id}`}
                className="bg-white border-[3px] border-rl-border rounded-lg p-4 flex flex-col items-center gap-2 hover:translate-y-[-2px] hover:shadow-pixel-sm transition-all"
              >
                <AvatarOrInitials url={r.avatar_url} name={r.name} size={64} />
                <div className="font-pixel text-[10px] text-rl-text uppercase text-center truncate max-w-full">
                  {r.name}
                </div>
                <div className="font-pixel text-[7px] text-rl-muted">
                  #{String(r.researcher_number).padStart(3, "0")}
                </div>
                {r.location && (
                  <div className="font-sans text-[13px] font-semibold text-rl-text text-center truncate max-w-full">
                    📍 {r.location}
                  </div>
                )}
                {r.building && (
                  <div className="font-sans text-[13px] font-semibold text-rl-text text-center leading-snug line-clamp-3">
                    {r.building}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
        <div className="mt-4 text-center">
          <Link href="/members" className="font-pixel text-[8px] text-rl-text uppercase tracking-wider">
            VIEW ALL RESEARCHERS →
          </Link>
        </div>
      </PixelPanel>

      {/* Bottom: How to Cook Ramyeon tutorials */}
      <PixelPanel title="How to Cook Ramyeon">
        <TutorialCarousel tutorials={TUTORIALS} />
      </PixelPanel>
    </div>
  );
}
