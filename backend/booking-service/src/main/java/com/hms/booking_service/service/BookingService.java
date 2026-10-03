package com.hms.booking_service.service;

import com.hms.booking_service.client.PricingServiceClient;
import com.hms.booking_service.client.RoomDetailServiceClient;
import com.hms.booking_service.dto.*;
import com.hms.booking_service.entity.Booking;
import com.hms.booking_service.entity.BookingStatus;
import com.hms.booking_service.entity.RequestKind;
import com.hms.booking_service.exception.*;
import com.hms.booking_service.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final PricingServiceClient pricingServiceClient;
    private final RoomDetailServiceClient roomDetailServiceClient;
    private final BookingReferenceGenerator referenceGenerator;
    private final GuestRequestService guestRequestService;

    /** How long an unpaid online booking holds its room before the expiry job releases it. */
    @Value("${booking.pending-hold-minutes:15}")
    private long pendingHoldMinutes;

    public BookingService(BookingRepository bookingRepository,
                          PricingServiceClient pricingServiceClient,
                          RoomDetailServiceClient roomDetailServiceClient,
                          BookingReferenceGenerator referenceGenerator,
                          GuestRequestService guestRequestService) {
        this.bookingRepository = bookingRepository;
        this.pricingServiceClient = pricingServiceClient;
        this.roomDetailServiceClient = roomDetailServiceClient;
        this.referenceGenerator = referenceGenerator;
        this.guestRequestService = guestRequestService;
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
