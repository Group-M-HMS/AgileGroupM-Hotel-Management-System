const STYLES: Record<string, string> = {
  Confirmed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-4 py-1.5 text-sm font-semibold ${STYLES[status] ?? "bg-gray-100 text-gray-700"}`}
    >
      {status}
    </span>
  );
}
