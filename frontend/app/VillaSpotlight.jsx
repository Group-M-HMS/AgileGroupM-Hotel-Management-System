import Link from "next/link";
import { Check } from "lucide-react";

// Placeholder highlights — swap for the villa's real specs.
const highlights = [
  "A single secluded villa — you're the only guests",
  "Sleeps up to 4, with private river frontage",
  "Solar-powered and built from local materials",
];

export default function VillaSpotlight() {
  return (
    <section className="overflow-hidden rounded-[32px] bg-primary">

      <div className="grid lg:grid-cols-2">

        {/* Copy */}
        <div className="flex flex-col justify-center gap-6 p-8 sm:p-12 lg:p-14">

          <div>
            <p className="font-jakarta text-sm uppercase tracking-[3px] text-sage">
              The Villa
            </p>

            <h2 className="mt-2 font-fraunces text-4xl leading-tight text-sand-light lg:text-5xl">
              A sanctuary in the trees
            </h2>
          </div>

          <p className="max-w-xl font-jakarta leading-8 text-sand-light/80">
            Built in harmony with the surrounding rainforest, River Nest is a
            single secluded eco-villa — complete privacy and an unbroken
            connection to nature. Wake to the sound of the river and mist
            rolling through the canopy.
          </p>

          <ul className="flex flex-col gap-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage/20">
                  <Check size={14} className="text-sage" />
                </span>
                <span className="font-jakarta text-sand-light/85">{item}</span>
              </li>
            ))}
          </ul>

          <div>
            <Link
              href="/hotel"
              className="inline-flex items-center rounded-full bg-sage px-7 py-3 font-jakarta font-semibold text-jungle-dark transition hover:bg-sage/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              View Villa Details
            </Link>
          </div>

        </div>

        {/* Image — fills the right half, matches the copy column height on desktop */}
        <div className="relative min-h-[320px] lg:min-h-[520px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=1200&auto=format&fit=crop"
            alt="The River Nest eco-villa nestled in the rainforest canopy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

      </div>

    </section>
  );
}
