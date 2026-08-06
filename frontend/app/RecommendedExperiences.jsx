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

          <p className="font-outfit text-sm uppercase tracking-[3px] text-sage">
            Discover More
          </p>

          <h2 className="mt-2 font-lora text-4xl text-jungle-dark">
            Recommended Experiences
          </h2>

        </div>

        <Link
          href="/experiences"
          className="hidden font-semibold text-sage transition hover:text-jungle-dark lg:flex"
        >
          View All
        </Link>

      </div>

      <div className="grid gap-8 lg:grid-cols-3">

        {experiences.map((item) => (

          <div
            key={item.title}
            className="group overflow-hidden rounded-[30px] border border-sand bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
          >

            <div className="relative h-64 overflow-hidden">

              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            </div>

            <div className="p-8">

              <h3 className="font-lora text-3xl text-jungle-dark">
                {item.title}
              </h3>

              <p className="mt-4 font-outfit leading-7 text-jungle/70">
                {item.description}
              </p>

              <Link
                href="/experiences"
                className="mt-8 inline-flex items-center gap-2 font-semibold text-sage transition hover:text-jungle-dark"
              >
                Explore

                <ArrowRight size={18} />

              </Link>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}