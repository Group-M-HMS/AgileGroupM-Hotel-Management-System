package com.hms.booking_service.repository;

import com.hms.booking_service.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    // A customer should only ever see their own booking's details.
    Optional<Booking> findByIdAndCustomerId(Long id, Long customerId);

    boolean existsByBookingReference(String bookingReference);
}
