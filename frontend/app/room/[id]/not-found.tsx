import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function RoomNotFound() {
  return (
    <>
      <Navbar />
      <div className="pt-16">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="font-lora text-heading-sm font-medium text-jungle-dark sm:text-heading-md">
            Room not found
          </h1>
          <p className="font-outfit text-field text-jungle/70">
            The room you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>
          <Link
            href="/"
            className="rounded-btn bg-jungle-dark px-6 py-2.5 font-outfit text-meta font-semibold text-sand-light transition-opacity hover:opacity-90"
          >
            Back to Home
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
