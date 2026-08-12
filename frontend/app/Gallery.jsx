// Bento gallery — asymmetric image grid showing off the setting.
// Placeholder Unsplash imagery; swap for real River Nest photography.
const shots = [
  {
    src: "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1200&auto=format&fit=crop",
    alt: "Sunlit rainforest trail through tall trees",
    className: "col-span-2 row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=800&auto=format&fit=crop",
    alt: "Clear river flowing over mossy rocks",
    className: "",
  },
  {
    src: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=800&auto=format&fit=crop",
    alt: "Wooden eco-villa exterior among the trees",
    className: "",
  },
  {
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop",
    alt: "Mist rolling through a forest canopy at dawn",
    className: "col-span-2",
  },
];

export default function Gallery() {
  return (
    <section>

      <div className="mb-8">

        <p className="font-jakarta text-sm uppercase tracking-[3px] text-sage">
          Gallery
        </p>

        <h2 className="mt-2 font-fraunces text-4xl text-jungle-dark">
          A glimpse of River Nest
        </h2>

      </div>

      <div className="grid auto-rows-[180px] grid-cols-2 gap-4 md:grid-cols-4 md:auto-rows-[200px]">

        {shots.map((shot) => (
          <div
            key={shot.src}
            className={`group overflow-hidden rounded-[24px] ${shot.className}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shot.src}
              alt={shot.alt}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </div>
        ))}

      </div>

    </section>
  );
}
