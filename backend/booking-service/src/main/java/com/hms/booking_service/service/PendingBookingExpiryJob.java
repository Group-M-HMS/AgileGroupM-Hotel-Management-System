package com.hms.booking_service.service;

import com.hms.booking_service.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Releases rooms held by online bookings whose payment never completed. Cancelling the row is
 * the release: the exclusion constraint ignores CANCELLED bookings.
 *
 * Uses one conditional UPDATE (status = PENDING re-checked by the database under the row lock)
 * instead of load-modify-save, so a payment confirming at the same moment can never be
 * overwritten with CANCELLED: whichever commits first wins and the other sees the new status.
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
        int released = bookingRepository.cancelExpiredPending(LocalDateTime.now());
        if (released > 0) {
            log.info("Released {} unpaid booking hold(s)", released);
        }
    }
}
