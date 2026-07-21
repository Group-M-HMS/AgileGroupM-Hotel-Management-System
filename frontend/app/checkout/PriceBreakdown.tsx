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
  pricePerNight,
  nights,
  taxRate,
}: {
  pricePerNight: number;
  nights: number;
  taxRate: number;
}) {
  const subtotal = pricePerNight * nights;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-3xl bg-white p-6 shadow-soft">
      <h2 className="font-lora text-[20px] font-medium text-jungle-dark">Price Breakdown</h2>
      <BreakdownRow
        label={`$${pricePerNight} x ${nights} night${nights === 1 ? "" : "s"}`}
        value={`$${subtotal.toFixed(2)}`}
      />
      <BreakdownRow label={`Tax (${Math.round(taxRate * 100)}%)`} value={`$${tax.toFixed(2)}`} />
      <div className="border-t border-sand pt-3">
        <BreakdownRow label="Total" value={`$${total.toFixed(2)}`} emphasize />
      </div>
    </div>
  );
}
