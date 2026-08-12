// Hero band for "The Hotel" page — hotel photography + welcome statement (NIBM2-520).
// Static server component; the marketing pages use a bare <img>/background image
// like HomeHero and VillaSpotlight rather than the room-photography fallback pattern.
export default function HotelHero() {
  return (
    <section
      className="relative flex min-h-[72vh] items-end bg-primary bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1758438919146-f3f59a6d2544?q=80&w=2070&auto=format&fit=crop')",
      }}
    >
      {/* Gradient scrim keeps the welcome copy legible over the photography. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-primary/30" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-page-x pb-16 pt-32 lg:px-page-x-lg lg:pb-24">
        <div className="max-w-3xl">
          <p className="font-jakarta text-[12px] font-medium uppercase tracking-[3px] text-sage">
            The Hotel · Kitulgala
          </p>
          <h1 className="mt-4 font-fraunces text-[42px] leading-[50px] text-sand-light lg:text-[58px] lg:leading-[64px]">
            A rainforest retreat, built to disappear into the trees
          </h1>
          <p className="mt-6 max-w-2xl font-jakarta text-[16px] leading-[30px] text-sand-light/85">
            River Nest Eco Villa is a single secluded sanctuary on the edge of
            Sri Lanka&apos;s Kitulgala rainforest — designed for quiet, privacy,
            and an unbroken connection to nature.
          </p>
        </div>
      </div>
    </section>
  );
}
