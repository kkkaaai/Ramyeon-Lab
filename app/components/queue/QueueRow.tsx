import { AvatarOrInitials } from "../pixel/AvatarOrInitials";

export type QueueRowData = {
  id: string;
  position: number;
  status: "waiting" | "cooking" | "done";
  profile_id: string | null;
  name: string;
  building: string | null;
  location: string | null;
  researcher_number: number;
  avatar_url?: string | null;
};

type Props = {
  entry: QueueRowData;
  highlight?: "cooking" | "next";
  isMine?: boolean;
  isFront?: boolean;
  onStartCooking?: () => void;
  onMarkDone?: () => void;
  onLeave?: () => void;
};

function OwnerActions({ entry, isFront, onStartCooking, onMarkDone, onLeave }: {
  entry: QueueRowData;
  isFront?: boolean;
  onStartCooking?: () => void;
  onMarkDone?: () => void;
  onLeave?: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 items-stretch">
      {entry.status === "cooking" ? (
        <button
          onClick={onMarkDone}
          className="font-pixel text-[9px] uppercase tracking-wider bg-white text-rl-text border-4 border-rl-border shadow-pixel-sm rounded px-3 py-2 hover:translate-y-[1px]"
        >
          DONE COOKING ✓
        </button>
      ) : isFront ? (
        <button
          onClick={onStartCooking}
          className="font-pixel text-[9px] uppercase tracking-wider bg-rl-yellow text-rl-text border-4 border-rl-border shadow-pixel-sm rounded px-3 py-2 hover:translate-y-[1px]"
        >
          START COOKING
        </button>
      ) : null}
      <button
        onClick={onLeave}
        className="font-pixel text-[8px] uppercase tracking-wider bg-white text-rl-muted border-[3px] border-rl-border rounded px-3 py-2 hover:translate-y-[1px]"
      >
        LEAVE ✗
      </button>
    </div>
  );
}

export function QueueRow({ entry, highlight, isMine, isFront, onStartCooking, onMarkDone, onLeave }: Props) {
  if (highlight === "cooking") {
    return (
      <div className={`border-4 border-rl-border bg-rl-yellow rounded-lg p-5 flex items-center gap-5 shadow-pixel ${entry.status === "cooking" ? "animate-pulse-amber" : ""}`}>
        <div className="font-pixel text-5xl md:text-6xl text-rl-text leading-none min-w-[80px] text-center">
          #{entry.position}
        </div>
        <AvatarOrInitials url={entry.avatar_url} name={entry.name} size={96} />
        <div className="min-w-[180px] max-w-[240px]">
          <div className="font-pixel text-rl-text text-lg uppercase truncate">{entry.name}</div>
          {entry.building && (
            <div className="font-sans text-rl-text text-xs mt-1 line-clamp-2">{entry.building}</div>
          )}
          {entry.location && (
            <div className="font-pixel text-rl-muted text-[8px] uppercase mt-1">📍 {entry.location}</div>
          )}
        </div>
        <div className="flex-1 flex justify-start min-w-0">
          <div className="font-pixel text-rl-text text-base md:text-xl uppercase tracking-wider pr-4 whitespace-nowrap">
            {entry.status === "cooking" ? "COOKING NOW" : "YOUR TURN"}
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <div className="font-pixel text-[9px] text-rl-text bg-white border-4 border-rl-border rounded px-3 py-2">
            #{String(entry.researcher_number).padStart(3, "0")}
          </div>
          {isMine && <OwnerActions entry={entry} isFront={isFront} onStartCooking={onStartCooking} onMarkDone={onMarkDone} onLeave={onLeave} />}
        </div>
      </div>
    );
  }

  if (highlight === "next") {
    return (
      <div className="border-4 border-rl-border bg-white rounded-lg p-4 flex items-center gap-5 shadow-pixel-sm">
        <div className="font-pixel text-4xl md:text-5xl text-rl-text leading-none min-w-[70px] text-center">
          #{entry.position}
        </div>
        <AvatarOrInitials url={entry.avatar_url} name={entry.name} size={56} />
        <div className="flex-1 min-w-0">
          <div className="inline-block bg-rl-yellow text-rl-text font-pixel text-[9px] px-3 py-2 rounded border-4 border-rl-border mb-2">
            NEXT UP ⏱
          </div>
          <div className="font-pixel text-rl-text text-base md:text-lg uppercase truncate">{entry.name}</div>
          {entry.building && (
            <div className="font-sans text-rl-muted text-xs mt-1 truncate">{entry.building}</div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="font-pixel text-[9px] text-rl-text bg-rl-yellow-light border-4 border-rl-border rounded px-3 py-2">
            #{String(entry.researcher_number).padStart(3, "0")}
          </div>
          {isMine && <OwnerActions entry={entry} isFront={isFront} onStartCooking={onStartCooking} onMarkDone={onMarkDone} onLeave={onLeave} />}
        </div>
      </div>
    );
  }

  return (
    <div className="border-[3px] border-rl-border bg-white rounded-lg p-3 flex items-center gap-4">
      <div className="font-pixel text-2xl text-rl-muted leading-none min-w-[50px] text-center">
        #{entry.position}
      </div>
      <AvatarOrInitials url={entry.avatar_url} name={entry.name} size={44} />
      <div className="flex-1 min-w-0">
        <div className="font-pixel text-rl-text text-sm uppercase truncate">{entry.name}</div>
        {entry.building && (
          <div className="font-sans text-xs text-rl-muted truncate">{entry.building}</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="font-pixel text-[8px] text-rl-muted">
          #{String(entry.researcher_number).padStart(3, "0")}
        </div>
        {isMine && <OwnerActions entry={entry} isFront={isFront} onStartCooking={onStartCooking} onMarkDone={onMarkDone} onLeave={onLeave} />}
      </div>
    </div>
  );
}
