// Property amenities showcase (NIBM2-521).
import {
  Wifi,
  Waves,
  Utensils,
  Coffee,
  Flame,
  Bath,
  Trees,
  Sparkles,
} from "lucide-react";

const amenities = [
  { icon: Waves, label: "Private river frontage" },
  { icon: Trees, label: "Guided jungle trails" },
  { icon: Utensils, label: "Organic farm-to-table dining" },
  { icon: Coffee, label: "Breakfast included" },
  { icon: Bath, label: "Open-air rainforest bathroom" },
  { icon: Flame, label: "Riverside fire pit" },
  { icon: Sparkles, label: "Wellness & yoga deck" },
  { icon: Wifi, label: "Starlink Wi-Fi" },
];

export default function PropertyAmenities() {
  return (
    <section className="mx-auto max-w-7xl px-page-x py-20 lg:px-page-x-lg lg:py-28">
      <div className="max-w-2xl">
        <p className="font-jakarta text-[12px] font-medium uppercase tracking-[3px] text-sage">
          Property Amenities
        </p>
        <h2 className="mt-2 font-fraunces text-[32px] leading-tight text-jungle-dark lg:text-[42px]">
          Everything you need, nothing you don&apos;t
        </h2>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {amenities.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-[20px] border border-sand bg-white p-5 shadow-soft transition-colors hover:border-sage"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage/15">
              <Icon className="h-5 w-5 text-jungle" />
            </span>
            <span className="font-jakarta text-[15px] font-medium leading-[20px] text-jungle-dark">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
