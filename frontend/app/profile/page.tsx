import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import ProfileContent from "./ProfileContent";

export const metadata: Metadata = {
  title: "Profile — River Nest Eco Villa",
  description: "View and update your River Nest account details.",
};

export default function ProfilePage() {
  return (
    <>
      <Navbar />
      <main className="bg-sand-light pt-24 lg:pt-28">
        <div className="mx-auto max-w-3xl px-page-x pb-16 lg:px-page-x-lg">
          <header className="mb-6">
            <p className="font-jakarta text-[12px] font-medium uppercase tracking-[3px] text-sage">
              Your account
            </p>
            <h1 className="mt-2 font-fraunces text-[36px] leading-tight text-jungle-dark lg:text-[44px]">
              My Profile
            </h1>
          </header>

          <ProfileContent />
        </div>
      </main>
      <Footer />
    </>
  );
}
