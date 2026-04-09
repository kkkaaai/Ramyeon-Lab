type Status = "cooking" | "waiting" | "done" | "active" | "inactive" | "pending" | "approved" | "rejected";

const styles: Record<Status, string> = {
  cooking: "bg-rl-yellow text-rl-text border-rl-border",
  waiting: "bg-white text-rl-text border-rl-border",
  done: "bg-white text-rl-muted border-rl-border",
  active: "bg-rl-yellow text-rl-text border-rl-border",
  inactive: "bg-white text-rl-muted border-rl-border",
  pending: "bg-rl-yellow-light text-rl-text border-rl-border",
  approved: "bg-rl-yellow text-rl-text border-rl-border",
  rejected: "bg-rl-danger text-white border-red-900",
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
