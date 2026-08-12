import { Leaf, Compass, Droplets, Sun } from "lucide-react";

// Feature highlights — marketing value props (not navigation).
const features = [
  {
    title: "Eco Friendly Stay",
    description: "100% solar powered and built with sustainable local materials.",
    icon: Leaf,
  },
  {
    title: "Private Jungle Villa",
    description: "You are the only guests. Complete privacy in the wild.",
    icon: Compass,
  },
  {
    title: "River Access",
    description: "Private steps leading down to crystal clear natural pools.",
    icon: Droplets,
  },
  {
    title: "Guided Experiences",
    description: "Local experts to guide you through the jungle safely.",
    icon: Sun,
  },
];

export default function QuickActions() {
  return (
    <section>

      <div className="mb-12">

        <p className="font-jakarta text-sm uppercase tracking-[3px] text-sage">
          Why River Nest
        </p>

        <h2 className="mt-2 font-fraunces text-4xl text-jungle-dark">
          Crafted for a deeper escape
        </h2>

      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="flex flex-col items-center rounded-[28px] border border-sand bg-white p-8 text-center"
            >

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sage/15 text-jungle">
                <Icon size={30} />
              </div>

              <h3 className="mt-6 font-fraunces text-xl text-jungle-dark">
                {feature.title}
              </h3>

              <p className="mt-3 font-jakarta leading-7 text-jungle/70">
                {feature.description}
              </p>

            </div>
          );
        })}

      </div>

    </section>
  );
}
