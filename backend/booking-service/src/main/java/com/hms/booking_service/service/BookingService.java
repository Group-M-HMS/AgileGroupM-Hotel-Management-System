package com.hms.booking_service.service;

import com.hms.booking_service.client.PaymentServiceClient;
import com.hms.booking_service.client.PricingServiceClient;
import com.hms.booking_service.client.RoomDetailServiceClient;
import com.hms.booking_service.dto.*;
import com.hms.booking_service.entity.Booking;
import com.hms.booking_service.entity.BookingStatus;
import com.hms.booking_service.entity.RequestKind;
import com.hms.booking_service.exception.*;
import com.hms.booking_service.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    /** The hotel's calendar day decides refund and past-date rules, not the server's (UTC) clock. */
    private static final ZoneId HOTEL_ZONE = ZoneId.of("Asia/Colombo");

    private final BookingRepository bookingRepository;
    private final PricingServiceClient pricingServiceClient;
    private final RoomDetailServiceClient roomDetailServiceClient;
    private final BookingReferenceGenerator referenceGenerator;
    private final GuestRequestService guestRequestService;
    private final PaymentServiceClient paymentServiceClient;

    /** How long an unpaid online booking holds its room before the expiry job releases it. */
    @Value("${booking.pending-hold-minutes:15}")
    private long pendingHoldMinutes;

    public BookingService(BookingRepository bookingRepository,
                          PricingServiceClient pricingServiceClient,
                          RoomDetailServiceClient roomDetailServiceClient,
                          BookingReferenceGenerator referenceGenerator,
                          GuestRequestService guestRequestService,
                          PaymentServiceClient paymentServiceClient) {
        this.bookingRepository = bookingRepository;
        this.pricingServiceClient = pricingServiceClient;
        this.roomDetailServiceClient = roomDetailServiceClient;
        this.referenceGenerator = referenceGenerator;
        this.guestRequestService = guestRequestService;
        this.paymentServiceClient = paymentServiceClient;
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
        RoomDetailInfo room = roomDetailServiceClient.getRoomDetail(request.roomId());

        if (request.checkInDate().isBefore(LocalDate.now(HOTEL_ZONE))) {
            throw new InvalidBookingStateException("Check-in date cannot be in the past");
        }
        if (!request.checkOutDate().isAfter(request.checkInDate())) {
            throw new InvalidBookingStateException("Check-out must be after check-in");
        }
        if (room.maxOccupancy() != null && request.numberOfGuests() > room.maxOccupancy()) {
            throw new InvalidBookingStateException(
                    "This room sleeps at most " + room.maxOccupancy() + " guests");
        }

        PricingQuote quote = pricingServiceClient.getQuote(
                request.roomId(), request.checkInDate(), request.checkOutDate());

        // A retry (card declined, double click, back button) must not collide with the customer's own
        // earlier unpaid attempt on this room: reuse the identical one, drop any other abandoned one.
        List<Booking> ownPending = bookingRepository.findByCustomerIdAndRoomIdAndStatus(
                customerId, request.roomId(), BookingStatus.PENDING);
        for (Booking earlier : ownPending) {
            if (earlier.getCheckInDate().equals(request.checkInDate())
                    && earlier.getCheckOutDate().equals(request.checkOutDate())) {
                earlier.setNumberOfGuests(request.numberOfGuests());
                earlier.setSpecialRequests(request.specialRequests());
                earlier.setTotalAmount(quote.total());
                earlier.setExpiresAt(LocalDateTime.now().plusMinutes(pendingHoldMinutes));
                bookingRepository.save(earlier);
                return new CreateBookingResponse(earlier.getId(), earlier.getStatus(), earlier.getTotalAmount());
            }
        }
        for (Booking abandoned : ownPending) {
            abandoned.setStatus(BookingStatus.CANCELLED);
            abandoned.setCancellationReason("Replaced by a new booking attempt");
        }
        if (!ownPending.isEmpty()) {
            bookingRepository.flush(); // release the dates before the new insert hits the exclusion constraint
        }

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
        booking.setExpiresAt(LocalDateTime.now().plusMinutes(pendingHoldMinutes));

        try {
            bookingRepository.saveAndFlush(booking);
        } catch (DataIntegrityViolationException ex) {
            // The exclusion constraint fired: someone else booked this exact
            // room/date-range overlap in the moment between our read and write.
            throw new RoomNotAvailableException(request.roomId());
        }

        // NIBM2-613/614: a special request placed at booking time becomes a
        // guest-request alert so front desk sees it without opening the booking.
        if (request.specialRequests() != null && !request.specialRequests().isBlank()) {
            guestRequestService.createRequest(new CreateGuestRequestDto(
                    RequestKind.REQUEST,
                    "Special request — " + room.name(),
                    request.specialRequests().trim(),
                    request.roomId(),
                    booking.getId(),
                    customerId,
                    null
            ));
        }

        return new CreateBookingResponse(booking.getId(), booking.getStatus(), booking.getTotalAmount());
    }

    /**
     * GET /bookings/my. NIBM2-443: reservation details for dashboard display.
     */
    @Transactional(readOnly = true)
    public List<BookingSummary> getMyBookings(String customerId) {
        Map<Long, RoomDetailInfo> rooms = new HashMap<>();
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(b -> toSummary(b, rooms.computeIfAbsent(b.getRoomId(), roomDetailServiceClient::getRoomDetail)))
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
     * POST /bookings/{id}/cancel. NIBM2-314: releasing the dates back to
     * inventory happens automatically - the exclusion constraint only
     * blocks overlaps against non-CANCELLED rows (V1 migration WHERE
     * clause), so flipping status to CANCELLED is the release.
     *
     * Deliberately not @Transactional: the refund is a slow external call and must not hold a
     * database transaction open. The load and the final save are each their own short transaction.
     */
    public CancelBookingResponse cancelBooking(String customerId, Long bookingId, CancelBookingRequest request) {
        Booking booking = bookingRepository.findByIdAndCustomerId(bookingId, customerId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new InvalidBookingStateException("Booking is already cancelled");
        }
        if (booking.getStatus() == BookingStatus.CHECKED_IN || booking.getStatus() == BookingStatus.CHECKED_OUT) {
            throw new InvalidBookingStateException(
                    "A stay that has started or finished cannot be cancelled online; please contact the front desk");
        }

        // Policy: a paid booking is refunded in full when cancelled up to the day before check-in
        // (hotel calendar); from the check-in day on it is cancelled without a refund. The refund runs
        // first, so a failed refund leaves the booking intact and the customer can retry.
        boolean refunded = false;
        String message = "Booking cancelled successfully.";
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            if (LocalDate.now(HOTEL_ZONE).isBefore(booking.getCheckInDate())) {
                paymentServiceClient.refundBooking(booking.getId());
                refunded = true;
                message = "Booking cancelled. Your payment has been refunded in full.";
            } else {
                message = "Booking cancelled. No refund applies within one day of check-in.";
            }
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(request.reason());
        try {
            bookingRepository.save(booking);
        } catch (RuntimeException ex) {
            if (refunded) {
                // Money is back with the customer but the stay is still CONFIRMED. A repeat cancel is
                // safe (the refund is idempotent) and finishes the job; the log makes it findable.
                log.error("Booking {} was REFUNDED but could not be marked CANCELLED; retry the cancel or cancel it manually",
                        booking.getId(), ex);
            }
            throw ex;
        }

        return new CancelBookingResponse(booking.getId(), booking.getStatus(), refunded, message);
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

    /** Owner-scoped: someone else's booking is a 404, never revealed. Used by payment-service. */
    @Transactional(readOnly = true)
    public BookingInternalResponse getOwnedBookingForPayment(String customerId, Long bookingId) {
        Booking booking = bookingRepository.findByIdAndCustomerId(bookingId, customerId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));
        return new BookingInternalResponse(
                booking.getId(), booking.getCustomerId(), booking.getTotalAmount(), booking.getStatus().name());
    }

    /** Room-service search uses this so it never offers a room another booking already holds. */
    @Transactional(readOnly = true)
    public List<Long> getBookedRoomIds(LocalDate from, LocalDate to) {
        return bookingRepository.findBookedRoomIds(from, to);
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
        booking.setExpiresAt(null);
        booking.setBookingReference(referenceGenerator.generate());
        bookingRepository.save(booking);

        return new BookingConfirmPaymentResponse(
                booking.getId(), booking.getStatus(), booking.getBookingReference());
    }

    private BookingSummary toSummary(Booking booking, RoomDetailInfo room) {
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
