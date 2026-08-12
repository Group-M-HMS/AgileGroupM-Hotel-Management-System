// Eco-commitments showcase (NIBM2-521).
// Rendered on a dark (bg-primary) band. Carries id="sustainability" so the
// footer's "Sustainability" link (/hotel#sustainability) anchors here.
import { Sun, Droplets, Sprout, Recycle, TreePine, Hand } from "lucide-react";

const commitments = [
  {
    icon: Sun,
    title: "Solar powered",
    body: "The villa runs entirely on solar energy, with battery storage for uninterrupted low-impact stays.",
  },
  {
    icon: Droplets,
    title: "Rainwater harvesting",
    body: "Rainwater is collected and filtered on site, and greywater is recycled back into the gardens.",
  },
  {
    icon: Sprout,
    title: "Local & organic",
    body: "Meals are cooked from produce grown in our garden and sourced from Kitulgala farmers.",
  },
  {
    icon: TreePine,
    title: "Zero-clear construction",
    body: "Built around the existing canopy — not a single mature tree was felled to make room.",
  },
  {
    icon: Recycle,
    title: "Plastic-free",
    body: "Refillable amenities, glass bottles and compostable packaging throughout the property.",
  },
  {
    icon: Hand,
    title: "Community first",
    body: "We employ and train locally, reinvesting in the Kitulgala community year round.",
  },
];

export default function EcoCommitments() {
  return (
    <section id="sustainability" className="scroll-mt-20 bg-primary">
      <div className="mx-auto max-w-7xl px-page-x py-20 lg:px-page-x-lg lg:py-28">
        <div className="max-w-2xl">
          <p className="font-jakarta text-[12px] font-medium uppercase tracking-[3px] text-sage">
            Sustainability
          </p>
          <h2 className="mt-2 font-fraunces text-[32px] leading-tight text-sand-light lg:text-[42px]">
            Commitments we hold ourselves to
          </h2>
          <p className="mt-4 font-jakarta text-[16px] leading-[30px] text-sand-light/80">
            Every part of River Nest is designed to tread lightly on the
            rainforest — here&apos;s how we keep that promise.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {commitments.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-[24px] border border-sand/15 bg-white/5 p-7 transition-colors hover:border-sage/40"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/20">
                <Icon className="h-6 w-6 text-sage" />
              </span>
              <h3 className="mt-5 font-fraunces text-[22px] text-sand-light">
                {title}
              </h3>
              <p className="mt-2 font-jakarta text-[14.5px] leading-[24px] text-sand-light/75">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
