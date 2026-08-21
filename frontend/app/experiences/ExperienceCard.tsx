// Experience card (NIBM2-529): photography, title, duration, difficulty and a
// short description, with a details/inquiry action. Rendered inside the client
// grid, which owns the details-modal state.
import { Clock, ArrowRight } from "lucide-react";
import type { Experience } from "./experiences";
import { ExperienceImage, difficultyClasses } from "./ExperienceImage";

export function ExperienceCard({
  experience,
  onView,
}: {
  experience: Experience;
  onView: () => void;
}) {
  const { title, category, image, duration, difficulty, summary } = experience;

  return (
    <button
      type="button"
      onClick={onView}
      aria-label={`View details for ${title}`}
      className="group flex flex-col overflow-hidden rounded-[30px] border border-sand bg-white text-left transition-shadow hover:shadow-soft-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
    >
      <div className="relative h-60 overflow-hidden">
        <ExperienceImage
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-sand-light/90 px-3 py-1 font-jakarta text-[12px] font-semibold tracking-wide text-jungle-dark backdrop-blur-sm">
          {category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 font-jakarta text-[13px]">
          <span className="inline-flex items-center gap-1.5 text-jungle/60">
            <Clock size={15} className="text-sage" />
            {duration}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${difficultyClasses(
              difficulty
            )}`}
          >
            {difficulty}
          </span>
        </div>

        <h3 className="mt-3 font-fraunces text-[24px] leading-tight text-jungle-dark">
          {title}
        </h3>

        <p className="mt-2 font-jakarta text-[14.5px] leading-[24px] text-jungle/70">
          {summary}
        </p>

        <span className="mt-5 inline-flex items-center gap-2 font-jakarta text-[14px] font-semibold text-jungle transition-colors group-hover:text-jungle-dark">
          <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-[width] after:duration-300 after:content-[''] group-hover:after:w-full motion-reduce:after:transition-none">
            View details
          </span>
          <ArrowRight size={17} />
        </span>
      </div>
    </button>
  );
}
