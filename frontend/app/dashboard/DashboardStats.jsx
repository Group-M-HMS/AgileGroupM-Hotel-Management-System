import {
  CalendarDays,
  BedDouble,
  Leaf,
  Star,
} from "lucide-react";

const stats = [
  {
    title: "Upcoming Stay",
    value: "01",
    subtitle: "Confirmed Booking",
    icon: CalendarDays,
  },
  {
    title: "Bookings",
    value: "05",
    subtitle: "Completed Stays",
    icon: BedDouble,
  },
  {
    title: "Experiences",
    value: "08",
    subtitle: "Available Activities",
    icon: Leaf,
  },
  {
    title: "Reward Points",
    value: "1,250",
    subtitle: "Premium Member",
    icon: Star,
  },
];

export default function DashboardStats() {
  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="group rounded-[28px] border border-sand bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">

              <div>

                <p className="font-outfit text-sm text-jungle/60">
                  {item.title}
                </p>

                <h2 className="mt-3 font-lora text-[42px] leading-none text-jungle-dark">
                  {item.value}
                </h2>

                <p className="mt-3 font-outfit text-sm text-sage">
                  {item.subtitle}
                </p>

              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/15 transition-all group-hover:bg-sage">

                <Icon
                  size={30}
                  className="text-sage transition-all group-hover:text-jungle-dark"
                />

              </div>

            </div>
          </div>
        );
      })}
    </section>
  );
}