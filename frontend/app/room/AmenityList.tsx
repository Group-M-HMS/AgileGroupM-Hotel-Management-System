import { AmenityIcon } from "./amenityIcons";

export function AmenityList({ amenities }: { amenities: Record<string, boolean> }) {
  const included = Object.entries(amenities).filter(([, enabled]) => enabled);

  if (included.length === 0) {
    return <p className="font-jakarta text-field text-jungle/70">No amenities listed</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {included.map(([name]) => (
        <div
          key={name}
          className="flex items-center gap-3 rounded-2xl border border-sand bg-white px-4 py-2.5"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/15">
            <AmenityIcon name={name} size={18} className="text-jungle" />
          </span>
          <span className="font-jakarta text-[15px] font-medium text-jungle-dark">
            {name}
          </span>
        </div>
      ))}
    </div>
  );
}
