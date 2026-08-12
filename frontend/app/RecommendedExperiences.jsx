import Link from "next/link";
import { ArrowRight } from "lucide-react";

const experiences = [
  {
    title: "Jungle Trek",
    image: "/images/experiences/jungle.jpg",
    description:
      "Discover hidden rainforest trails with experienced local guides.",
  },
  {
    title: "River Bathing",
    image: "/images/experiences/river.jpg",
    description:
      "Relax in crystal-clear natural pools surrounded by lush greenery.",
  },
  {
    title: "Bird Watching",
    image: "/images/experiences/bird.jpg",
    description:
      "Spot rare tropical birds in Sri Lanka's breathtaking rainforest.",
  },
];

export default function RecommendedExperiences() {
  return (
    <section>

      <div className="mb-8 flex items-end justify-between">

        <div>

          <p className="font-jakarta text-sm uppercase tracking-[3px] text-sage">
            Discover More
          </p>

          <h2 className="mt-2 font-fraunces text-4xl text-jungle-dark">
            Recommended Experiences
          </h2>

        </div>

        <Link
          href="/experiences"
          className="hidden rounded-full font-semibold text-jungle transition hover:text-jungle-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 lg:flex"
        >
          View All
        </Link>

      </div>

      <div className="grid gap-8 lg:grid-cols-3">

        {experiences.map((item) => (

          <div
            key={item.title}
            className="group overflow-hidden rounded-[30px] border border-sand bg-white"
          >

            <div className="relative h-64 overflow-hidden">

              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            </div>

            <div className="p-8">

              <h3 className="font-fraunces text-3xl text-jungle-dark">
                {item.title}
              </h3>

              <p className="mt-4 font-jakarta leading-7 text-jungle/70">
                {item.description}
              </p>

              <Link
                href="/experiences"
                className="mt-8 inline-flex items-center gap-2 rounded-full font-semibold text-jungle transition hover:text-jungle-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
              >
                {/* Underline draws in from the left when the card is hovered */}
                <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-[width] after:duration-300 after:content-[''] group-hover:after:w-full motion-reduce:after:transition-none">
                  Explore
                </span>

                <ArrowRight size={18} />

              </Link>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}