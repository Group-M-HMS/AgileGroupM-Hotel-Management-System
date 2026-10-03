package com.nibm.room_service.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Asks booking-service (the booking system of record) which rooms are already held for a date
 * range. Fails open: if booking-service is unreachable, search still lists rooms and the
 * booking-service exclusion constraint rejects any real double-booking at checkout.
 */
@Component
public class BookingAvailabilityClient {

    private static final Logger log = LoggerFactory.getLogger(BookingAvailabilityClient.class);

    private final RestClient restClient;
    private final String internalSecret;

    public BookingAvailabilityClient(@Value("${booking-service.base-url}") String baseUrl,
                                     @Value("${internal.service-secret}") String internalSecret,
                                     @Value("${booking-service.timeout-ms:3000}") int timeoutMs) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(timeoutMs));
        factory.setReadTimeout(Duration.ofMillis(timeoutMs));
        this.restClient = RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
        this.internalSecret = internalSecret;
    }

    public Set<Long> bookedRoomIds(LocalDate from, LocalDate to) {
        try {
            List<Long> ids = restClient.get()
                    .uri(u -> u.path("/api/v1/bookings/internal/booked-room-ids")
                            .queryParam("from", from)
                            .queryParam("to", to)
                            .build())
                    .header("X-Internal-Secret", internalSecret)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<Long>>() {});
            return ids == null ? Set.of() : new HashSet<>(ids);
        } catch (Exception ex) {
            log.warn("Could not load booked rooms from booking-service ({} to {}): {}", from, to, ex.getMessage());
            return Set.of();
        }
    }
}
