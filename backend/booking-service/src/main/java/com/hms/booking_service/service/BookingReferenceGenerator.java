package com.hms.booking_service.service;

import com.hms.booking_service.repository.BookingRepository;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

/** Shared by BookingService (online payment confirm) and BookingAdminService (walk-in create). */
@Component
public class BookingReferenceGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String REFERENCE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I ambiguity

    private final BookingRepository bookingRepository;

    public BookingReferenceGenerator(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    /** e.g. "BK-7F3K9QZP2H" - short, unambiguous, human-readable. */
    public String generate() {
        String reference;
        do {
            StringBuilder sb = new StringBuilder("BK-");
            for (int i = 0; i < 10; i++) {
                sb.append(REFERENCE_CHARS.charAt(RANDOM.nextInt(REFERENCE_CHARS.length())));
            }
            reference = sb.toString();
        } while (bookingRepository.existsByBookingReference(reference));
        return reference;
    }
}
