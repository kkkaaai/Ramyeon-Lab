type Status = "cooking" | "waiting" | "done" | "active" | "inactive" | "pending" | "approved" | "rejected";

const styles: Record<Status, string> = {
  cooking: "bg-rl-yellow text-rl-base border-rl-border",
  waiting: "bg-rl-surface-2 text-rl-text border-rl-muted",
  done: "bg-rl-surface-2 text-rl-muted border-rl-muted",
  active: "bg-rl-yellow text-rl-base border-rl-border",
  inactive: "bg-rl-surface-2 text-rl-muted border-rl-muted",
  pending: "bg-rl-yellow-light text-rl-base border-rl-border",
  approved: "bg-rl-yellow text-rl-base border-rl-border",
  rejected: "bg-rl-danger text-rl-text border-red-900",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-[1px] border-2 rounded ${styles[status]}`}
    >
      {status}
    </span>
  );
}
