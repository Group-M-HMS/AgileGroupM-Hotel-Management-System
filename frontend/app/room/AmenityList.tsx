import { AmenityIcon } from "./amenityIcons";

export function AmenityList({ amenities }: { amenities: Record<string, boolean> }) {
  const included = Object.entries(amenities).filter(([, enabled]) => enabled);

  if (included.length === 0) {
    return <p className="font-outfit text-field text-jungle/70">No amenities listed</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {included.map(([name]) => (
        <li key={name} className="flex items-center gap-2 font-outfit text-field text-jungle">
          <AmenityIcon name={name} />
          {name}
        </li>
      ))}
    </ul>
  );
}
