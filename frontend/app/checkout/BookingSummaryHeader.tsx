import { formatDate } from "./formatDate";

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-outfit text-[12px] uppercase tracking-wide text-jungle/50">
        {label}
      </span>
      <span className="font-outfit text-[15px] font-semibold text-jungle-dark">{value}</span>
    </div>
  );
}

export function BookingSummaryHeader({
  roomTitle,
  checkIn,
  checkOut,
  guests,
}: {
  roomTitle: string;
  checkIn: string;
  checkOut: string;
  guests: string;
}) {
  return (
    <div className="sticky top-16 z-40 border-b border-sand bg-white shadow-soft">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-page-x py-4 sm:flex-row sm:items-center sm:justify-between lg:px-page-x-lg">
        <span className="font-lora text-[20px] font-medium text-jungle-dark">{roomTitle}</span>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <SummaryField label="Check-In" value={formatDate(checkIn)} />
          <SummaryField label="Check-Out" value={formatDate(checkOut)} />
          <SummaryField label="Guests" value={guests || "—"} />
        </div>
      </div>
    </div>
  );
}
