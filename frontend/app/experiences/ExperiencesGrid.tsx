"use client";

// Responsive activity grid (NIBM2-528) + details/inquiry modal (NIBM2-529).
import { useEffect, useState } from "react";
import { Clock, X, Mail, CalendarCheck } from "lucide-react";
import Link from "next/link";
import type { Experience } from "./experiences";
import { ExperienceCard } from "./ExperienceCard";
import { ExperienceImage, difficultyClasses } from "./ExperienceImage";

export default function ExperiencesGrid({
  experiences,
}: {
  experiences: Experience[];
}) {
  const [selected, setSelected] = useState<Experience | null>(null);

  // Close on Escape and lock body scroll while the modal is open.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected]);

  if (experiences.length === 0) {
    return (
      <p className="rounded-[28px] border border-dashed border-sand bg-sand-light/40 py-20 text-center font-jakarta text-[15px] text-jungle/60">
        Our activity catalog is being updated — check back soon.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {experiences.map((exp) => (
          <ExperienceCard
            key={exp.id}
            experience={exp}
            onView={() => setSelected(exp)}
          />
        ))}
      </div>

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="experience-modal-title"
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-jungle-dark/60 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-soft-lg"
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close details"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-jungle-dark backdrop-blur-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
            >
              <X size={20} />
            </button>

            <ExperienceImage
              src={selected.image}
              alt={selected.title}
              className="h-60 w-full object-cover sm:h-72"
            />

            <div className="p-7 sm:p-9">
              <div className="flex flex-wrap items-center gap-3 font-jakarta text-[13px]">
                <span className="rounded-full bg-sand-light px-3 py-1 font-semibold text-jungle-dark">
                  {selected.category}
                </span>
                <span className="inline-flex items-center gap-1.5 text-jungle/60">
                  <Clock size={15} className="text-sage" />
                  {selected.duration}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${difficultyClasses(
                    selected.difficulty
                  )}`}
                >
                  {selected.difficulty}
                </span>
              </div>

              <h2
                id="experience-modal-title"
                className="mt-4 font-fraunces text-[30px] leading-tight text-jungle-dark"
              >
                {selected.title}
              </h2>

              <p className="mt-4 font-jakarta text-[15.5px] leading-[28px] text-jungle/75">
                {selected.description}
              </p>

              {/* Inquiry options */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`mailto:hello@rivernest.eco?subject=${encodeURIComponent(
                    `Experience enquiry: ${selected.title}`
                  )}`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-jakarta text-[14px] font-semibold text-sand-light transition hover:opacity-90"
                >
                  <Mail size={17} />
                  Enquire about this experience
                </a>
                <Link
                  href="/#search-stay"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-sand px-6 py-3 font-jakarta text-[14px] font-semibold text-jungle-dark transition hover:border-sage"
                >
                  <CalendarCheck size={17} className="text-sage" />
                  Book your stay
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
