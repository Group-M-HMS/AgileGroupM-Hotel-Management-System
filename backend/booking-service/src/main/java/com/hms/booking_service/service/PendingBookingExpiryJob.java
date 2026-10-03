package com.hms.booking_service.service;

import com.hms.booking_service.entity.Booking;
import com.hms.booking_service.entity.BookingStatus;
import com.hms.booking_service.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Releases rooms held by online bookings whose payment never completed. Cancelling the row is
 * the release: the exclusion constraint ignores CANCELLED bookings.
 */
@Component
public class PendingBookingExpiryJob {

    private static final Logger log = LoggerFactory.getLogger(PendingBookingExpiryJob.class);

    private final BookingRepository bookingRepository;

    public PendingBookingExpiryJob(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Scheduled(fixedDelayString = "${booking.expiry-sweep-ms:60000}")
    @Transactional
    public void cancelExpiredPendingBookings() {
        List<Booking> expired = bookingRepository
                .findByStatusAndExpiresAtBefore(BookingStatus.PENDING, LocalDateTime.now());
        for (Booking booking : expired) {
            booking.setStatus(BookingStatus.CANCELLED);
            booking.setCancellationReason("Payment not completed in time");
        }
        if (!expired.isEmpty()) {
            log.info("Released {} unpaid booking hold(s)", expired.size());
        }
    }
}
