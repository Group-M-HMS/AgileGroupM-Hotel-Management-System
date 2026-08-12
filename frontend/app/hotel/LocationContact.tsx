// Location + contact + map overview (NIBM2-522).
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const details = [
  {
    icon: MapPin,
    label: "Address",
    lines: ["123 Forest Edge Road", "Kitulgala, Sri Lanka"],
  },
  { icon: Phone, label: "Phone", lines: ["+94 77 123 4567"] },
  { icon: Mail, label: "Email", lines: ["hello@rivernest.eco"] },
  {
    icon: Clock,
    label: "Reception",
    lines: ["Check-in 2:00 PM", "Check-out 11:00 AM"],
  },
];

export default function LocationContact() {
  return (
    <section className="bg-sand-light">
      <div className="mx-auto max-w-7xl px-page-x py-20 lg:px-page-x-lg lg:py-28">
        <div className="max-w-2xl">
          <p className="font-jakarta text-[12px] font-medium uppercase tracking-[3px] text-sage">
            Find Us
          </p>
          <h2 className="mt-2 font-fraunces text-[32px] leading-tight text-jungle-dark lg:text-[42px]">
            On the edge of the Kitulgala rainforest
          </h2>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Contact details */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {details.map(({ icon: Icon, label, lines }) => (
              <div
                key={label}
                className="rounded-[24px] border border-sand bg-white p-6 shadow-soft"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sage/15">
                  <Icon className="h-5 w-5 text-jungle" />
                </span>
                <p className="mt-4 font-jakarta text-[12px] uppercase tracking-[1.5px] text-jungle/60">
                  {label}
                </p>
                <div className="mt-1 space-y-0.5">
                  {lines.map((line) => (
                    <p
                      key={line}
                      className="font-jakarta text-[15px] leading-[22px] text-jungle-dark"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Map overview */}
          <div className="relative min-h-[340px] overflow-hidden rounded-[32px] border border-sand shadow-soft lg:min-h-full">
            <iframe
              title="Map showing River Nest Eco Villa in Kitulgala, Sri Lanka"
              src="https://www.google.com/maps?q=Kitulgala,+Sri+Lanka&z=12&output=embed"
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
