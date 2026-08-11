"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { fetchMyBookings, type DashboardBooking } from "@/lib/bookings";

import { UpcomingReservations } from "./UpcomingReservations";
import { PastReservations } from "./PastReservations";
import { EmptyBookingsState } from "./EmptyBookingsState";

type Tab = "bookings" | "profile";

function todayIsoDate(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function DashboardContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("bookings");
  const [bookings, setBookings] = useState<DashboardBooking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchMyBookings()
      .then(data => {
        if (!cancelled) setBookings(data);
      })
      .catch(() => {
        if (!cancelled) setError("We couldn't load your bookings right now. Please try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center py-24 font-jakarta text-jungle/60">
        Loading...
      </div>
    );
  }

  const today = todayIsoDate();
  const upcoming = (bookings ?? [])
    .filter(b => b.checkOut >= today)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const past = (bookings ?? [])
    .filter(b => b.checkOut < today)
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn));

  return (
    <>
      <div>
        <p className="font-jakarta text-sm uppercase tracking-[3px] text-sage">My Account</p>
        <h1 className="mt-2 font-fraunces text-4xl text-jungle-dark">Hi, {user.firstName}</h1>
      </div>

      <div className="flex gap-2 border-b border-sand">
        <button
          type="button"
          onClick={() => setTab("bookings")}
          className={`px-5 py-3 font-jakarta font-semibold transition-colors ${
            tab === "bookings" ? "border-b-2 border-sage text-jungle-dark" : "text-jungle/50 hover:text-jungle-dark"
          }`}
        >
          My Bookings
        </button>
        <button
          type="button"
          onClick={() => setTab("profile")}
          className={`px-5 py-3 font-jakarta font-semibold transition-colors ${
            tab === "profile" ? "border-b-2 border-sage text-jungle-dark" : "text-jungle/50 hover:text-jungle-dark"
          }`}
        >
          Profile
        </button>
      </div>

      {tab === "bookings" ? (
        <div className="space-y-10">
          {error ? (
            <p className="rounded-[30px] border border-red-200 bg-red-50 p-8 font-jakarta text-red-600 shadow-sm">
              {error}
            </p>
          ) : bookings === null ? (
            <div className="rounded-[30px] border border-sand bg-white p-8 text-center font-jakarta text-jungle/60 shadow-sm">
              Loading your bookings...
            </div>
          ) : bookings.length === 0 ? (
            <EmptyBookingsState />
          ) : (
            <>
              <UpcomingReservations bookings={upcoming} />
              <PastReservations bookings={past} />
            </>
          )}
        </div>
      ) : (
        <div className="max-w-lg rounded-[30px] border border-sand bg-white p-8 shadow-sm">
          <p className="font-jakarta text-sm uppercase tracking-[3px] text-sage">Account Information</p>
          <h2 className="mt-2 font-fraunces text-3xl text-jungle-dark">Profile</h2>

          <div className="mt-8 space-y-6">
            <div>
              <p className="text-sm text-jungle/60">First Name</p>
              <p className="mt-1 font-semibold text-jungle-dark">{user.firstName}</p>
            </div>
            <div>
              <p className="text-sm text-jungle/60">Last Name</p>
              <p className="mt-1 font-semibold text-jungle-dark">{user.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-jungle/60">Email</p>
              <p className="mt-1 font-semibold text-jungle-dark">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-jungle/60">Phone</p>
              <p className="mt-1 font-semibold text-jungle-dark">{user.phone || "—"}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
