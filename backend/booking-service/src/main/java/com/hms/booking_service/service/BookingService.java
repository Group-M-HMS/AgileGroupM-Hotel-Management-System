package com.hms.booking_service.service;

import com.hms.booking_service.client.PricingServiceClient;
import com.hms.booking_service.client.RoomDetailServiceClient;
import com.hms.booking_service.dto.*;
import com.hms.booking_service.entity.Booking;
import com.hms.booking_service.entity.BookingStatus;
import com.hms.booking_service.exception.*;
import com.hms.booking_service.repository.BookingRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String REFERENCE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I ambiguity

    private final BookingRepository bookingRepository;
    private final PricingServiceClient pricingServiceClient;
    private final RoomDetailServiceClient roomDetailServiceClient;

    public BookingService(BookingRepository bookingRepository,
                          PricingServiceClient pricingServiceClient,
                          RoomDetailServiceClient roomDetailServiceClient) {
        this.bookingRepository = bookingRepository;
        this.pricingServiceClient = pricingServiceClient;
        this.roomDetailServiceClient = roomDetailServiceClient;
    }

    /**
     * POST /bookings. NIBM2-440 (T&C validation happens via @Valid on the
     * request DTO before this method is even entered). Double-booking
     * protection comes from the DB exclusion constraint (V1 migration) -
     * this method just lets DataIntegrityViolationException surface up to
     * GlobalExceptionHandler as a clean 400 rather than catching it here.
     */
    @Transactional
    public CreateBookingResponse createBooking(String customerId, CreateBookingRequest request) {
        // Confirms the room exists and gets its nightly rate indirectly through Pricing Service.
        roomDetailServiceClient.getRoomDetail(request.roomId());

        PricingQuote quote = pricingServiceClient.getQuote(
                request.roomId(), request.checkInDate(), request.checkOutDate());

        Booking booking = new Booking();
        booking.setCustomerId(customerId);
        booking.setRoomId(request.roomId());
        booking.setCheckInDate(request.checkInDate());
        booking.setCheckOutDate(request.checkOutDate());
        booking.setNumberOfGuests(request.numberOfGuests());
        booking.setSpecialRequests(request.specialRequests());
        booking.setTermsAccepted(request.termsAccepted());
        booking.setTotalAmount(quote.total());
        booking.setStatus(BookingStatus.PENDING);

        try {
            bookingRepository.saveAndFlush(booking);
        } catch (DataIntegrityViolationException ex) {
            // The exclusion constraint fired: someone else booked this exact
            // room/date-range overlap in the moment between our read and write.
            throw new RoomNotAvailableException(request.roomId());
        }

        return new CreateBookingResponse(booking.getId(), booking.getStatus(), booking.getTotalAmount());
    }

    /**
     * GET /bookings/my. NIBM2-443: reservation details for dashboard display.
     */
    @Transactional(readOnly = true)
    public List<BookingSummary> getMyBookings(String customerId) {
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingDetailResponse getBookingDetail(String customerId, Long bookingId) {
        Booking booking = bookingRepository.findByIdAndCustomerId(bookingId, customerId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        RoomDetailInfo room = roomDetailServiceClient.getRoomDetail(booking.getRoomId());

    String paymentStatus = switch (booking.getStatus()) {
        case CONFIRMED -> "PAID";
        case CHECKED_IN -> "CHECKED_IN";
        case CHECKED_OUT -> "COMPLETED";
        case CANCELLED -> "CANCELLED";
        case PENDING -> "PENDING";
    };

        return new BookingDetailResponse(
                booking.getId(), booking.getRoomId(), room.name(), room.description(),
                booking.getCheckInDate(), booking.getCheckOutDate(), booking.getNumberOfGuests(),
                booking.getSpecialRequests(), booking.getStatus(), paymentStatus,
                booking.getTotalAmount(), booking.getBookingReference());
    }

    /**
     * Check in a guest for a confirmed booking.
     * Subtask: NIBM2-558, NIBM2-609
     */
    @Transactional
    public CheckInOutResponse checkInBooking(Long bookingId, CheckInRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        if (booking.getStatus() == BookingStatus.CHECKED_IN) {
            throw new InvalidBookingStateException("Booking is already checked in");
        }
        if (booking.getStatus() == BookingStatus.CHECKED_OUT) {
            throw new InvalidBookingStateException("Cannot check in a completed booking");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new InvalidBookingStateException("Cannot check in a cancelled booking");
        }

        booking.setStatus(BookingStatus.CHECKED_IN);
        booking.setCheckedInAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        // Update room operational status to OCCUPIED
        String operator = request != null && request.checkedBy() != null ? request.checkedBy() : "FRONT_DESK";
        String remarks = request != null && request.remarks() != null ? request.remarks() : "Guest checked in for booking " + saved.getBookingReference();
        String guestName = request != null && request.guestName() != null ? request.guestName() : saved.getCustomerId();
        roomDetailServiceClient.updateRoomStatus(saved.getRoomId(), "OCCUPIED", operator, remarks, guestName);

        return new CheckInOutResponse(
                saved.getId(),
                saved.getBookingReference(),
                saved.getRoomId(),
                saved.getStatus(),
                "OCCUPIED",
                saved.getCheckedInAt(),
                "Guest checked in successfully"
        );
    }

    /**
     * Check out a guest for an active stay.
     * Subtask: NIBM2-558, NIBM2-609
     */
    @Transactional
    public CheckInOutResponse checkOutBooking(Long bookingId, CheckOutRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        if (booking.getStatus() == BookingStatus.CHECKED_OUT) {
            throw new InvalidBookingStateException("Booking is already checked out");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new InvalidBookingStateException("Cannot check out a cancelled booking");
        }
        if (booking.getStatus() != BookingStatus.CHECKED_IN && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new InvalidBookingStateException("Booking must be in confirmed or checked-in status to check out");
        }

        booking.setStatus(BookingStatus.CHECKED_OUT);
        booking.setCheckedOutAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        // Update room operational status to CLEANING queue
        String operator = request != null && request.checkedBy() != null ? request.checkedBy() : "FRONT_DESK";
        String remarks = request != null && request.remarks() != null ? request.remarks() : "Guest checked out, room queued for cleaning";
        roomDetailServiceClient.updateRoomStatus(saved.getRoomId(), "CLEANING", operator, remarks, null);

        return new CheckInOutResponse(
                saved.getId(),
                saved.getBookingReference(),
                saved.getRoomId(),
                saved.getStatus(),
                "CLEANING",
                saved.getCheckedOutAt(),
                "Guest checked out successfully, room queued for cleaning"
        );
    }

    /**
     * POST /bookings/{id}/cancel. NIBM2-314: releasing the dates back to
     * inventory happens automatically - the exclusion constraint only
     * blocks overlaps against non-CANCELLED rows (V1 migration WHERE
     * clause), so flipping status to CANCELLED is the release.
     */
    @Transactional
    public CancelBookingResponse cancelBooking(String customerId, Long bookingId, CancelBookingRequest request) {
        Booking booking = bookingRepository.findByIdAndCustomerId(bookingId, customerId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new InvalidBookingStateException("Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(request.reason());
        bookingRepository.save(booking);

        return new CancelBookingResponse(booking.getId(), booking.getStatus());
    }

    // --- Internal endpoints, called by Payment Service ---

    @Transactional(readOnly = true)
    public BookingInternalResponse getBookingInternal(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));
        return new BookingInternalResponse(
                booking.getId(), booking.getCustomerId(), booking.getTotalAmount(),
                booking.getStatus().name());
    }

    /**
     * NIBM2-271 (generate reference), NIBM2-274 (store it), NIBM2-330
     * (update status, return confirmed result) all meet here. Called by
     * Payment Service only after Stripe has reported success - this method
     * does not itself verify payment, it trusts the caller's contract.
     */
    @Transactional
    public BookingConfirmPaymentResponse confirmPayment(Long bookingId, BookingConfirmPaymentRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            // Idempotent: a retried confirm call returns the same result
            // instead of generating a second reference.
            return new BookingConfirmPaymentResponse(
                    booking.getId(), booking.getStatus(), booking.getBookingReference());
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new InvalidBookingStateException("Cannot confirm a cancelled booking");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setBookingReference(generateUniqueBookingReference());
        bookingRepository.save(booking);

        return new BookingConfirmPaymentResponse(
                booking.getId(), booking.getStatus(), booking.getBookingReference());
    }

    /** NIBM2-271: e.g. "BK-7F3K9QZP2H" - short, unambiguous, human-readable. */
    private String generateUniqueBookingReference() {
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

    private BookingSummary toSummary(Booking booking) {
        RoomDetailInfo room = roomDetailServiceClient.getRoomDetail(booking.getRoomId());
        return new BookingSummary(
                booking.getId(),
                room.name(),
                room.description(),
                booking.getCheckInDate(),
                booking.getCheckOutDate(),
                booking.getStatus(),
                booking.getTotalAmount(),
                booking.getNumberOfGuests(),
                null,
                null
        );
    }
}
