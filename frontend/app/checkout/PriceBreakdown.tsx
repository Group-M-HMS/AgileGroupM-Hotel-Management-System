function BreakdownRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={`font-outfit text-field ${emphasize ? "font-semibold text-jungle-dark" : "text-jungle/70"}`}
      >
        {label}
      </span>
      <span
        className={`font-outfit text-field ${emphasize ? "font-semibold text-jungle-dark" : "text-jungle-dark"}`}
      >
        {value}
      </span>
    </div>
  );
}

export function PriceBreakdown({
  quote,
}: {
  quote: { nightlyRate: number; nights: number; subtotal: number; tax: number; total: number };
}) {
  const { nightlyRate, nights, subtotal, tax, total } = quote;
  const taxRate = subtotal > 0 ? tax / subtotal : 0;

  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-3xl bg-white p-6 shadow-soft">
      <h2 className="font-lora text-[20px] font-medium text-jungle-dark">Price Breakdown</h2>
      <BreakdownRow
        label={`$${nightlyRate} x ${nights} night${nights === 1 ? "" : "s"}`}
        value={`$${subtotal.toFixed(2)}`}
      />
      <BreakdownRow label={`Tax (${Math.round(taxRate * 100)}%)`} value={`$${tax.toFixed(2)}`} />
      <div className="border-t border-sand pt-3">
        <BreakdownRow label="Total" value={`$${total.toFixed(2)}`} emphasize />
      </div>
    </div>
  );
}
