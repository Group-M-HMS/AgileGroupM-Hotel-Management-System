package com.hms.booking_service.repository;

import com.hms.booking_service.entity.Booking;
import com.hms.booking_service.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomerIdOrderByCreatedAtDesc(String customerId);

    Optional<Booking> findByIdAndCustomerId(Long id, String customerId);

    Optional<Booking> findByBookingReference(String bookingReference);

    boolean existsByBookingReference(String bookingReference);

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByStatusOrderByCheckInDateAsc(BookingStatus status);

    List<Booking> findByCheckInDate(LocalDate checkInDate);
}
