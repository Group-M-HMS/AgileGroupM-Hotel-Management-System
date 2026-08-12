export const AMENITY_ICONS: Record<string, string> = {
  "Free Wi-Fi": "wifi",
  "Air Conditioning": "ac_unit",
  "Garden View": "yard",
  "River View": "water",
  Minibar: "local_bar",
  "Private Balcony": "balcony",
  "Two Bedrooms": "bed",
  "Waterfall View": "water_drop",
  "Meditation Corner": "self_improvement",
  "Forest View": "forest",
  "Sunrise View": "wb_twilight",
  "Living Area": "weekend",
  "Valley View": "landscape",
};

export function AmenityIcon({
  name,
  size = 14,
  className = "text-jungle/50",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const icon = AMENITY_ICONS[name] ?? "check_circle";
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontSize: `${size}px` }}
      aria-hidden="true"
    >
      {icon}
    </span>
  );
}
