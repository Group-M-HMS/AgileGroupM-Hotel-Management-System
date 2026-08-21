package com.hms.booking_service.service;

import com.hms.booking_service.client.PricingServiceClient;
import com.hms.booking_service.client.RoomDetailServiceClient;
import com.hms.booking_service.client.RoomServiceClient;
import com.hms.booking_service.dto.*;
import com.hms.booking_service.entity.Booking;
import com.hms.booking_service.entity.BookingSource;
import com.hms.booking_service.entity.BookingStatus;
import com.hms.booking_service.exception.BookingNotFoundException;
import com.hms.booking_service.exception.InvalidBookingStateException;
import com.hms.booking_service.exception.RoomNotAvailableException;
import com.hms.booking_service.repository.BookingRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class BookingAdminService {

    private final BookingRepository bookingRepository;
    private final PricingServiceClient pricingServiceClient;
    private final RoomDetailServiceClient roomDetailServiceClient;
    private final RoomServiceClient roomServiceClient;

    public BookingAdminService(BookingRepository bookingRepository,
                               PricingServiceClient pricingServiceClient,
                               RoomDetailServiceClient roomDetailServiceClient,
                               RoomServiceClient roomServiceClient) {
        this.bookingRepository = bookingRepository;
        this.pricingServiceClient = pricingServiceClient;
        this.roomDetailServiceClient = roomDetailServiceClient;
        this.roomServiceClient = roomServiceClient;
    }

    /**
     * NIBM2-577: staff-scoped ledger, filterable and paginated.
     * Unlike getMyBookings(), this is NOT scoped to a single customer.
     */
    @Transactional(readOnly = true)
    public PagedResponse<AdminBookingSummary> searchBookings(
            String q, BookingStatus status, String guestId, int page, int size) {

        Specification<Booking> spec = buildSearchSpec(q, status, guestId);
        Page<Booking> result = bookingRepository.findAll(spec, PageRequest.of(page, size));

        List<AdminBookingSummary> items = result.getContent().stream()
                .map(this::toAdminSummary)
                .toList();

        return new PagedResponse<>(items, result.getTotalElements());
    }

    private Specification<Booking> buildSearchSpec(String q, BookingStatus status, String guestId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (q != null && !q.isBlank()) {
                String like = "%" + q.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("bookingReference")), like),
                        cb.like(cb.lower(root.get("guestName")), like)
                ));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (guestId != null && !guestId.isBlank()) {
                predicates.add(cb.equal(root.get("customerId"), guestId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * NIBM2-583: bookings overlapping a date range, for the calendar timeline.
     */
    @Transactional(readOnly = true)
    public List<ScheduleEntry> getSchedule(LocalDate from, LocalDate to) {
        return bookingRepository.findScheduleBetween(from, to).stream()
                .map(b -> new ScheduleEntry(
                        b.getId(), b.getRoomId(), b.getCheckInDate(), b.getCheckOutDate(),
                        b.getStatus(), resolveGuestName(b)))
                .toList();
    }

    /**
     * NIBM2-580 + NIBM2-619: CONFIRMED -> CHECKED_IN, marks paid (implicitly true
     * since a CONFIRMED booking already passed payment), syncs room to OCCUPIED.
     */
    @Transactional
    public BookingStatusChangeResponse checkIn(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new InvalidBookingStateException(
                    "Cannot check in a booking with status " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CHECKED_IN);
        bookingRepository.save(booking);

        roomServiceClient.updateRoomStatus(booking.getRoomId(), "OCCUPIED");

        return new BookingStatusChangeResponse(booking.getId(), booking.getStatus());
    }

    /**
     * NIBM2-580 + NIBM2-619: CHECKED_IN -> CHECKED_OUT, syncs room to CLEANING.
     */
    @Transactional
    public BookingStatusChangeResponse checkOut(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new InvalidBookingStateException(
                    "Cannot check out a booking with status " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CHECKED_OUT);
        bookingRepository.save(booking);

        roomServiceClient.updateRoomStatus(booking.getRoomId(), "CLEANING");

        return new BookingStatusChangeResponse(booking.getId(), booking.getStatus());
    }

    /**
     * Staff-side cancel - unlike the customer-facing cancelBooking(), this is
     * NOT scoped to a customerId (staff can cancel any booking), and releases
     * an occupied room back toward availability the same way NIBM2-314 already
     * does (the exclusion constraint only blocks overlap against non-cancelled rows).
     */
    @Transactional
    public BookingStatusChangeResponse adminCancel(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new InvalidBookingStateException("Booking is already cancelled");
        }

        boolean wasOccupying = booking.getStatus() == BookingStatus.CHECKED_IN;

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        bookingRepository.save(booking);

        if (wasOccupying) {
            roomServiceClient.updateRoomStatus(booking.getRoomId(), "CLEANING");
        }

        return new BookingStatusChangeResponse(booking.getId(), booking.getStatus());
    }

    /**
     * NIBM2-622 + NIBM2-623: front-desk booking, no customer account required.
     * amount is ALWAYS server-computed via Pricing Service - never trust a
     * client-supplied amount (explicit requirement from the doc).
     * Advisory lock serializes concurrent walk-in creates for the same room
     * before the insert even happens.
     */
    @Transactional
    public CreateBookingResponse createWalkInBooking(WalkInBookingRequest request) {
        roomDetailServiceClient.getRoomDetail(request.roomId()); // confirms room exists

        // NIBM2-623: serialize concurrent attempts for this room before we insert.
        bookingRepository.lockRoomForBooking(request.roomId());

        var quote = pricingServiceClient.getQuote(request.roomId(), request.checkIn(), request.checkOut());

        Booking booking = new Booking();
        booking.setRoomId(request.roomId());
        booking.setCheckInDate(request.checkIn());
        booking.setCheckOutDate(request.checkOut());
        booking.setNumberOfGuests(request.guests());
        booking.setSpecialRequests(request.specialRequests());
        booking.setTermsAccepted(true); // staff-created, T&C acceptance doesn't apply the same way
        booking.setTotalAmount(quote.total()); // server-computed, never client-supplied
        booking.setSource(BookingSource.WALK_IN);
        booking.setGuestName(request.guestName());
        booking.setGuestEmail(request.guestEmail());
        booking.setGuestPhone(request.guestPhone());
        booking.setCustomerId(null); // no customer account for a walk-in
        booking.setStatus(request.paid() ? BookingStatus.CONFIRMED : BookingStatus.PENDING);

        try {
            bookingRepository.saveAndFlush(booking);
        } catch (DataIntegrityViolationException ex) {
            throw new RoomNotAvailableException(request.roomId());
        }

        return new CreateBookingResponse(booking.getId(), booking.getStatus(), booking.getTotalAmount());
    }

    private AdminBookingSummary toAdminSummary(Booking booking) {
        var room = roomDetailServiceClient.getRoomDetail(booking.getRoomId());
        return new AdminBookingSummary(
                booking.getId(),
                booking.getBookingReference(),
                booking.getCustomerId(),
                resolveGuestName(booking),
                booking.getGuestEmail(),
                booking.getGuestPhone(),
                booking.getRoomId(),
                room.name(),
                null, // roomNumber - Room Detail Service doesn't currently expose this; ask Uvisha to add it, or fetch from Room Service directly
                booking.getCheckInDate(),
                booking.getCheckOutDate(),
                booking.getNumberOfGuests(),
                booking.getTotalAmount(),
                booking.getStatus() == BookingStatus.CONFIRMED
                        || booking.getStatus() == BookingStatus.CHECKED_IN
                        || booking.getStatus() == BookingStatus.CHECKED_OUT,
                booking.getStatus(),
                booking.getSource(),
                booking.getSpecialRequests(),
                booking.getCancellationReason()
        );
    }

    private String resolveGuestName(Booking booking) {
        // Walk-in bookings store the name directly; website bookings would need
        // a User/Guest service lookup by customerId - not wired up here since
        // that entity isn't owned by this service (open question - flag with team).
        return booking.getGuestName() != null ? booking.getGuestName() : "Customer #" + booking.getCustomerId();
    }
}
