import { EggFlopGame } from "./EggFlopGame";

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
      <EggFlopGame />
    </div>
  );
}
