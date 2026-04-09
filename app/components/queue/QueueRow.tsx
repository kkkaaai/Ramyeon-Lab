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

function OwnerActions({
  entry,
  isFront,
  onStartCooking,
  onMarkDone,
  onLeave,
  compact,
}: {
  entry: QueueRowData;
  isFront?: boolean;
  onStartCooking?: () => void;
  onMarkDone?: () => void;
  onLeave?: () => void;
  compact?: boolean;
}) {
  const primaryCls = compact
    ? "font-pixel text-[8px] uppercase tracking-wider border-[3px] border-rl-border shadow-pixel-sm rounded px-2 py-1 hover:translate-y-[1px]"
    : "font-pixel text-[9px] uppercase tracking-wider border-4 border-rl-border shadow-pixel-sm rounded px-3 py-2 hover:translate-y-[1px]";

  return (
    <div className="flex flex-wrap gap-2 items-stretch">
      {entry.status === "cooking" ? (
        <button onClick={onMarkDone} className={`${primaryCls} bg-white text-rl-text`}>
          DONE ✓
        </button>
      ) : isFront ? (
        <button onClick={onStartCooking} className={`${primaryCls} bg-rl-yellow text-rl-text`}>
          START COOKING
        </button>
      ) : null}
      <button onClick={onLeave} className={`${primaryCls} bg-white text-rl-muted`}>
        LEAVE ✗
      </button>
    </div>
  );
}

export function QueueRow({
  entry,
  highlight,
  isMine,
  isFront,
  onStartCooking,
  onMarkDone,
  onLeave,
}: Props) {
  if (highlight === "cooking") {
    return (
      <div
        className={`border-4 border-rl-border bg-rl-yellow rounded-lg p-3 md:p-5 shadow-pixel ${
          entry.status === "cooking" ? "animate-pulse-amber" : ""
        }`}
      >
        <div className="flex items-center gap-3 md:gap-5">
          <div className="font-pixel text-3xl md:text-6xl text-rl-text leading-none min-w-[44px] md:min-w-[80px] text-center shrink-0">
            #{entry.position}
          </div>
          <div className="shrink-0">
            <AvatarOrInitials url={entry.avatar_url} name={entry.name} size={56} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-pixel text-rl-text text-sm md:text-lg uppercase truncate">
              {entry.name}
            </div>
            {entry.location && (
              <div className="font-pixel text-rl-muted text-[8px] uppercase mt-1 truncate">
                📍 {entry.location}
              </div>
            )}
            <div className="font-pixel text-rl-text text-[10px] md:text-sm uppercase tracking-wider mt-1">
              {entry.status === "cooking" ? "COOKING NOW" : "YOUR TURN"}
            </div>
          </div>
          <div className="font-pixel text-[8px] md:text-[9px] text-rl-text bg-white border-[3px] md:border-4 border-rl-border rounded px-2 py-1 md:px-3 md:py-2 shrink-0">
            #{String(entry.researcher_number).padStart(3, "0")}
          </div>
        </div>
        {entry.building && (
          <div className="font-sans text-rl-text text-xs mt-2 line-clamp-2">{entry.building}</div>
        )}
        {isMine && (
          <div className="mt-3 pt-3 border-t-2 border-rl-border/30">
            <OwnerActions
              entry={entry}
              isFront={isFront}
              onStartCooking={onStartCooking}
              onMarkDone={onMarkDone}
              onLeave={onLeave}
            />
          </div>
        )}
      </div>
    );
  }

  if (highlight === "next") {
    return (
      <div className="border-4 border-rl-border bg-white rounded-lg p-3 md:p-4 shadow-pixel-sm">
        <div className="flex items-center gap-3 md:gap-5">
          <div className="font-pixel text-2xl md:text-5xl text-rl-text leading-none min-w-[40px] md:min-w-[70px] text-center shrink-0">
            #{entry.position}
          </div>
          <div className="shrink-0">
            <AvatarOrInitials url={entry.avatar_url} name={entry.name} size={44} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-block bg-rl-yellow text-rl-text font-pixel text-[8px] md:text-[9px] px-2 py-1 md:px-3 md:py-2 rounded border-[3px] md:border-4 border-rl-border mb-1 md:mb-2">
              NEXT UP ⏱
            </div>
            <div className="font-pixel text-rl-text text-sm md:text-lg uppercase truncate">
              {entry.name}
            </div>
            {entry.building && (
              <div className="font-sans text-rl-muted text-[11px] md:text-xs mt-1 truncate">
                {entry.building}
              </div>
            )}
          </div>
          <div className="font-pixel text-[8px] md:text-[9px] text-rl-text bg-rl-yellow-light border-[3px] md:border-4 border-rl-border rounded px-2 py-1 md:px-3 md:py-2 shrink-0">
            #{String(entry.researcher_number).padStart(3, "0")}
          </div>
        </div>
        {isMine && (
          <div className="mt-3 pt-3 border-t-2 border-rl-border/30">
            <OwnerActions
              entry={entry}
              isFront={isFront}
              onStartCooking={onStartCooking}
              onMarkDone={onMarkDone}
              onLeave={onLeave}
              compact
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-[3px] border-rl-border bg-white rounded-lg p-2 md:p-3">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="font-pixel text-xl md:text-2xl text-rl-muted leading-none min-w-[36px] md:min-w-[50px] text-center shrink-0">
          #{entry.position}
        </div>
        <div className="shrink-0">
          <AvatarOrInitials url={entry.avatar_url} name={entry.name} size={36} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-pixel text-rl-text text-xs md:text-sm uppercase truncate">
            {entry.name}
          </div>
          {entry.building && (
            <div className="font-sans text-[11px] md:text-xs text-rl-muted truncate">
              {entry.building}
            </div>
          )}
        </div>
        <div className="font-pixel text-[8px] text-rl-muted shrink-0">
          #{String(entry.researcher_number).padStart(3, "0")}
        </div>
      </div>
      {isMine && (
        <div className="mt-2 pt-2 border-t border-rl-border/20">
          <OwnerActions
            entry={entry}
            isFront={isFront}
            onStartCooking={onStartCooking}
            onMarkDone={onMarkDone}
            onLeave={onLeave}
            compact
          />
        </div>
      )}
    </div>
  );
}
