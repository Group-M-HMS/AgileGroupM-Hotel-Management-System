import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import HotelHero from "./HotelHero";
import HotelStory from "./HotelStory";
import EcoCommitments from "./EcoCommitments";
import PropertyAmenities from "./PropertyAmenities";
import LocationContact from "./LocationContact";

export const metadata: Metadata = {
  title: "The Hotel — River Nest Eco Villa",
  description:
    "Discover the story, philosophy and sustainability commitments behind River Nest Eco Villa in Kitulgala, Sri Lanka.",
};

export default function HotelPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <HotelHero />
        <HotelStory />
        <EcoCommitments />
        <PropertyAmenities />
        <LocationContact />
      </main>
      <Footer />
    </>
  );
}
