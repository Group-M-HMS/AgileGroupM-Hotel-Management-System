import Link from "next/link";
import {
  CalendarPlus,
  Compass,
  User,
  Heart,
} from "lucide-react";

const actions = [
  {
    title: "Book a Stay",
    description: "Reserve your next rainforest escape.",
    href: "/book",
    icon: CalendarPlus,
  },
  {
    title: "Experiences",
    description: "Discover activities at River Nest.",
    href: "/experiences",
    icon: Compass,
  },
  {
    title: "My Profile",
    description: "Update your personal information.",
    href: "/profile",
    icon: User,
  },
  {
    title: "Wishlist",
    description: "View your saved villas and experiences.",
    href: "/wishlist",
    icon: Heart,
  },
];

export default function QuickActions() {
  return (
    <section>

      <div className="mb-8">

        <p className="font-outfit text-sm uppercase tracking-[3px] text-sage">
          Quick Access
        </p>

        <h2 className="mt-2 font-lora text-4xl text-jungle-dark">
          Everything You Need
        </h2>

      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-[28px] border border-sand bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-sage hover:shadow-xl"
            >

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/15 transition-all duration-300 group-hover:bg-sage">

                <Icon
                  size={30}
                  className="text-sage transition-all duration-300 group-hover:text-jungle-dark"
                />

              </div>

              <h3 className="mt-6 font-lora text-2xl text-jungle-dark">
                {action.title}
              </h3>

              <p className="mt-3 font-outfit leading-7 text-jungle/70">
                {action.description}
              </p>

              <div className="mt-8 flex items-center gap-2 font-semibold text-sage">

                <span>Explore</span>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14M13 5l7 7-7 7"
                  />
                </svg>

              </div>

            </Link>
          );
        })}

      </div>

    </section>
  );
}