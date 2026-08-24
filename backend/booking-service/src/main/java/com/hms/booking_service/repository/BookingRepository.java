package com.hms.booking_service.repository;

import com.hms.booking_service.entity.Booking;
import com.hms.booking_service.entity.BookingStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long>,
        JpaSpecificationExecutor<Booking> {   // NIBM2-577: powers dynamic admin filtering

    List<Booking> findByCustomerIdOrderByCreatedAtDesc(String customerId);

    Optional<Booking> findByIdAndCustomerId(Long id, String customerId);

    Optional<Booking> findByBookingReference(String bookingReference);

    boolean existsByBookingReference(String bookingReference);

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByStatusOrderByCheckInDateAsc(BookingStatus status);

    List<Booking> findByCheckInDate(LocalDate checkInDate);

    List<Booking> findByCheckInDateAndStatusNot(LocalDate checkInDate, BookingStatus status);

    List<Booking> findByCheckOutDateAndStatusNot(LocalDate checkOutDate, BookingStatus status);

    long countByStatus(BookingStatus status);

    long countByStatusIn(Collection<BookingStatus> statuses);

    @Query("""
        SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b
        WHERE b.status <> com.hms.booking_service.entity.BookingStatus.CANCELLED
          AND b.createdAt >= :start AND b.createdAt < :end
        """)
    BigDecimal sumRevenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
        SELECT b FROM Booking b
        WHERE b.status <> com.hms.booking_service.entity.BookingStatus.CANCELLED
          AND b.checkInDate < :to
          AND b.checkOutDate > :from
        ORDER BY b.roomId, b.checkInDate
        """)
    List<Booking> findScheduleBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query(value = "SELECT pg_advisory_xact_lock(hashtext(CAST(:roomId AS text)))", nativeQuery = true)
    void lockRoomForBooking(@Param("roomId") Long roomId);

    @Query("""
        SELECT b FROM Booking b
        WHERE LOWER(b.bookingReference) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(COALESCE(b.guestName, '')) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(COALESCE(b.guestEmail, '')) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(COALESCE(b.customerId, '')) LIKE LOWER(CONCAT('%', :q, '%'))
        ORDER BY b.createdAt DESC
        """)
    List<Booking> searchBookingsByQuery(@Param("q") String q, Pageable pageable);
}