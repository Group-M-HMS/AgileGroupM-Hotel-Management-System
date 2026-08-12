"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { fetchMyBookings, fetchBookingThumbnails, type DashboardBooking } from "@/lib/bookings";

import { UpcomingReservations } from "./UpcomingReservations";
import { PastReservations } from "./PastReservations";
import { EmptyBookingsState } from "./EmptyBookingsState";

function todayIsoDate(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function DashboardContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState<DashboardBooking[] | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<number, string | null>>({});
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
        if (cancelled) return;
        setBookings(data);
        // Thumbnails are best-effort and load separately so the list isn't blocked on them.
        fetchBookingThumbnails(data.map(b => b.bookingId)).then(map => {
          if (!cancelled) setThumbnails(map);
        });
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
        <p className="font-jakarta text-sm uppercase tracking-[3px] text-sage">Your reservations</p>
        <h1 className="mt-2 font-fraunces text-4xl text-jungle-dark">My Bookings</h1>
      </div>

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
            <UpcomingReservations bookings={upcoming} thumbnails={thumbnails} />
            <PastReservations bookings={past} thumbnails={thumbnails} />
          </>
        )}
      </div>
    </>
  );
}
