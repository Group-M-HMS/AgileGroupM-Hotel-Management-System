package com.hms.booking_service.service;

import com.hms.booking_service.client.RoomDetailServiceClient;
import com.hms.booking_service.client.RoomServiceClient;
import com.hms.booking_service.client.UserServiceClient;
import com.hms.booking_service.dto.GlobalSearchResponse;
import com.hms.booking_service.dto.GlobalSearchResponse.SearchBookingResult;
import com.hms.booking_service.dto.GlobalSearchResponse.SearchGuestResult;
import com.hms.booking_service.dto.GlobalSearchResponse.SearchRoomResult;
import com.hms.booking_service.entity.Booking;
import com.hms.booking_service.repository.BookingRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Aggregates multi-entity global search across bookings, rooms, and guests.
 * Subtasks: NIBM2-611, NIBM2-612
 */
@Service
public class GlobalSearchService {

    private final BookingRepository bookingRepository;
    private final RoomServiceClient roomServiceClient;
    private final RoomDetailServiceClient roomDetailServiceClient;
    private final UserServiceClient userServiceClient;

    public GlobalSearchService(BookingRepository bookingRepository,
                               RoomServiceClient roomServiceClient,
                               RoomDetailServiceClient roomDetailServiceClient,
                               UserServiceClient userServiceClient) {
        this.bookingRepository = bookingRepository;
        this.roomServiceClient = roomServiceClient;
        this.roomDetailServiceClient = roomDetailServiceClient;
        this.userServiceClient = userServiceClient;
    }

    @Transactional(readOnly = true)
    public GlobalSearchResponse search(String query, int limit) {
        if (query == null || query.isBlank()) {
            return new GlobalSearchResponse("", 0, List.of(), List.of(), List.of());
        }

        String q = query.trim();
        int maxLimit = limit > 0 ? Math.min(limit, 20) : 5;

        // 1. Search Bookings
        List<Booking> bookingsFound = bookingRepository.searchBookingsByQuery(q, PageRequest.of(0, maxLimit));
        List<SearchBookingResult> bookingResults = new ArrayList<>();
        Set<String> seenGuestKeys = new HashSet<>();
        List<SearchGuestResult> fallbackGuests = new ArrayList<>();

        for (Booking b : bookingsFound) {
            String roomTitle = "Room #" + b.getRoomId();
            try {
                var roomDetail = roomDetailServiceClient.getRoomDetail(b.getRoomId());
                if (roomDetail != null && roomDetail.name() != null) {
                    roomTitle = roomDetail.name();
                }
            } catch (Exception ignored) {}

            String guestName = b.getGuestName() != null ? b.getGuestName() : (b.getCustomerId() != null ? "Customer #" + b.getCustomerId() : "Guest");
            bookingResults.add(new SearchBookingResult(
                    b.getId(),
                    b.getBookingReference() != null ? b.getBookingReference() : "BK-" + b.getId(),
                    guestName,
                    roomTitle,
                    b.getStatus().name(),
                    b.getCheckInDate() != null ? b.getCheckInDate().toString() : "",
                    b.getCheckOutDate() != null ? b.getCheckOutDate().toString() : ""
            ));

            if (b.getGuestName() != null && !b.getGuestName().isBlank() && seenGuestKeys.add(b.getGuestName().toLowerCase())) {
                fallbackGuests.add(new SearchGuestResult(
                        b.getCustomerId() != null ? b.getCustomerId() : "booking-" + b.getId(),
                        b.getGuestName(),
                        b.getGuestEmail() != null ? b.getGuestEmail() : "",
                        b.getGuestPhone() != null ? b.getGuestPhone() : ""
                ));
            }
        }

        // 2. Search Rooms
        List<SearchRoomResult> roomResults = roomServiceClient.searchRooms(q);
        if (roomResults.size() > maxLimit) {
            roomResults = roomResults.subList(0, maxLimit);
        }

        // 3. Search Guests
        List<SearchGuestResult> guestResults = new ArrayList<>(userServiceClient.searchGuests(q));
        for (SearchGuestResult fg : fallbackGuests) {
            if (guestResults.stream().noneMatch(g -> g.name().equalsIgnoreCase(fg.name()))) {
                guestResults.add(fg);
            }
        }
        if (guestResults.size() > maxLimit) {
            guestResults = guestResults.subList(0, maxLimit);
        }

        int totalMatches = roomResults.size() + guestResults.size() + bookingResults.size();

        return new GlobalSearchResponse(q, totalMatches, roomResults, guestResults, bookingResults);
    }
}
