package com.hms.booking_service.repository;

import com.hms.booking_service.entity.Booking;
import com.hms.booking_service.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long>,
        JpaSpecificationExecutor<Booking> {   // NIBM2-577: powers dynamic admin filtering

    List<Booking> findByCustomerIdOrderByCreatedAtDesc(String customerId);

    Optional<Booking> findByIdAndCustomerId(Long id, String customerId);

    boolean existsByBookingReference(String bookingReference);

    // NIBM2-583: all non-cancelled bookings whose stay overlaps [from, to),
    // used for the calendar timeline. Relies on idx_bookings_daterange_gist (Commit 3).
    @Query("""
        SELECT b FROM Booking b
        WHERE b.status <> com.hms.booking_service.entity.BookingStatus.CANCELLED
          AND b.checkInDate < :to
          AND b.checkOutDate > :from
        ORDER BY b.roomId, b.checkInDate
        """)
    List<Booking> findScheduleBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    // NIBM2-623: Postgres advisory lock, scoped to the current transaction
    // (released automatically on commit/rollback - no manual unlock needed).
    // Serializes concurrent walk-in booking attempts for the SAME room, so two
    // front-desk creates for the same room can't race between the availability
    // check and the insert. hashtext() folds the room id into the lock key
    // space pg_advisory_xact_lock expects.
    @Query(value = "SELECT pg_advisory_xact_lock(hashtext(CAST(:roomId AS text)))", nativeQuery = true)
    void lockRoomForBooking(@Param("roomId") Long roomId);
}
