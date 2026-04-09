import { Suspense } from "react";
import { EggFlopGame } from "./EggFlopGame";
import { Leaderboard } from "./Leaderboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Egg Flop | Ramyeon Lab",
  description: "Keep the egg flying — dodge chopsticks, avoid the ramen bowl.",
};

export default function GamePage() {
  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="font-pixel text-rl-text text-xl uppercase mb-1">Egg Flop</h1>
        <p className="font-sans text-sm text-rl-text/60">
          Don&apos;t land in the ramen. Don&apos;t get chopsticked.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <EggFlopGame />
        <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-8">
          <Suspense
            fallback={
              <div className="bg-rl-yellow-light border-4 border-rl-border rounded-xl shadow-pixel p-4 text-center">
                <p className="font-pixel text-[8px] text-rl-text/40">LOADING...</p>
              </div>
            }
          >
            <Leaderboard />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
