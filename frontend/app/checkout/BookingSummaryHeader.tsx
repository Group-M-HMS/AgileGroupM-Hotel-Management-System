import { formatDate } from "./formatDate";

type Quote = {
  nightlyRate: number;
  nights: number;
  subtotal: number;
  tax: number;
  total: number;
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-jakarta text-[13px] text-jungle/60">{label}</span>
      <span className="font-jakarta text-[14px] font-semibold text-jungle-dark">{value}</span>
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-jakarta text-field text-jungle/70">{label}</span>
      <span className="font-jakarta text-field text-jungle-dark">{value}</span>
    </div>
  );
}

// Single sidebar card combining the "Your Stay" summary and the price
// breakdown — presented in the same bordered-card vocabulary used across the
// home, search-results, and room-details screens.
export function StaySummaryCard({
  roomTitle,
  checkIn,
  checkOut,
  guests,
  quote,
}: {
  roomTitle: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  quote: Quote | null;
}) {
  const taxRate = quote && quote.subtotal > 0 ? quote.tax / quote.subtotal : 0;

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-sand bg-white p-6 shadow-soft">
      {/* Stay */}
      <div>
        <p className="font-jakarta text-[12px] font-medium uppercase tracking-[2px] text-sage">
          Your Stay
        </p>
        <h2 className="mt-1 font-fraunces text-[22px] font-medium text-jungle-dark">
          {roomTitle}
        </h2>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-sand pt-4">
        <SummaryRow label="Check-In" value={formatDate(checkIn)} />
        <SummaryRow label="Check-Out" value={formatDate(checkOut)} />
        {quote ? (
          <SummaryRow
            label="Nights"
            value={`${quote.nights} night${quote.nights === 1 ? "" : "s"}`}
          />
        ) : null}
        <SummaryRow label="Guests" value={guests || "—"} />
      </div>

      {/* Price */}
      {quote ? (
        <div className="flex flex-col gap-3 border-t border-sand pt-4">
          <p className="font-jakarta text-[12px] font-medium uppercase tracking-[2px] text-sage">
            Price Details
          </p>
          <BreakdownRow
            label={`$${quote.nightlyRate} x ${quote.nights} night${quote.nights === 1 ? "" : "s"}`}
            value={`$${quote.subtotal.toFixed(2)}`}
          />
          <BreakdownRow
            label={`Tax (${Math.round(taxRate * 100)}%)`}
            value={`$${quote.tax.toFixed(2)}`}
          />
          <div className="mt-1 flex items-center justify-between border-t border-sand pt-4">
            <span className="font-jakarta text-[15px] font-semibold text-jungle-dark">Total</span>
            <span className="font-fraunces text-[26px] font-medium text-jungle-dark">
              ${quote.total.toFixed(2)}
            </span>
          </div>
        </div>
      ) : (
        <p className="border-t border-sand pt-4 font-jakarta text-field text-jungle/60">
          We couldn&apos;t load pricing for this stay right now.
        </p>
      )}
    </div>
  );
}
