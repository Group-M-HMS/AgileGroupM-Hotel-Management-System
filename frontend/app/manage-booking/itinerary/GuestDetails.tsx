import { SectionHeading } from "./SectionHeading";

function SummaryField({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-jakarta text-[12px] uppercase tracking-wide text-jungle/50">
        {label}
      </span>
      <span className="flex items-center gap-1 font-jakarta text-[15px] font-semibold text-jungle-dark">
        {icon && (
          <span className="material-symbols-outlined text-jungle/50" style={{ fontSize: "16px" }} aria-hidden="true">
            {icon}
          </span>
        )}
        {value}
      </span>
    </div>
  );
}

export function GuestDetails({
  firstName,
  lastName,
  email,
  phone,
  specialRequests,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeading icon="person">Guest Details</SectionHeading>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <SummaryField label="Name" value={`${firstName} ${lastName}`.trim() || "—"} />
        <SummaryField label="Email" value={email || "—"} icon="mail" />
        <SummaryField label="Phone" value={phone || "—"} icon="call" />
      </div>
      <SummaryField
        label="Special Requests"
        value={specialRequests.trim() || "No special requests"}
      />
    </div>
  );
}
