// Story / philosophy + property overview (NIBM2-520).
// Two-column narrative with a supporting image, followed by a property-overview
// stat row.
const overview = [
  { value: "12", label: "Rooms & suites" },
  { value: "8 acres", label: "Private rainforest" },
  { value: "100%", label: "Solar powered" },
  { value: "4.9", label: "Guest rating" },
];

export default function HotelStory() {
  return (
    <section className="mx-auto max-w-7xl px-page-x py-20 lg:px-page-x-lg lg:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Narrative */}
        <div>
          <p className="font-jakarta text-[12px] font-medium uppercase tracking-[3px] text-sage">
            Our Story
          </p>
          <h2 className="mt-2 font-fraunces text-[32px] leading-tight text-jungle-dark lg:text-[42px]">
            Born from a love of the rainforest
          </h2>
          <div className="mt-6 space-y-5 font-jakarta text-[16px] leading-[30px] text-jungle/75">
            <p>
              River Nest began with a simple idea: to build a place that gives
              more to the forest than it takes. Every beam, every path and every
              window was placed to leave the canopy intact and frame the wild
              beauty of Kitulgala.
            </p>
            <p>
              We believe a great stay should feel effortless and unhurried —
              mornings by the river, afternoons under the trees, and nights lit
              only by the stars. Our philosophy is low impact, high intention:
              fewer guests, deeper experiences, and a genuine connection to the
              land we call home.
            </p>
          </div>
        </div>

        {/* Supporting image */}
        <div className="relative overflow-hidden rounded-[32px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=1200&auto=format&fit=crop"
            alt="River Nest eco-hotel nestled in the rainforest canopy"
            className="h-full min-h-[320px] w-full object-cover lg:min-h-[460px]"
          />
        </div>
      </div>

      {/* Property overview stats */}
      <div className="mt-16 grid grid-cols-2 gap-6 rounded-[32px] bg-sand-light p-8 sm:p-10 lg:mt-20 lg:grid-cols-4">
        {overview.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-fraunces text-[34px] leading-none text-jungle-dark lg:text-[40px]">
              {stat.value}
            </p>
            <p className="mt-2 font-jakarta text-[13px] uppercase tracking-[1.5px] text-jungle/60">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
