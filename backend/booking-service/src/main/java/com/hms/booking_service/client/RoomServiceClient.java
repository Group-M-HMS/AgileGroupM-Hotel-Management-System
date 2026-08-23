package com.hms.booking_service.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

/**
 * Calls Room Service to update housekeeping status after a check-in/check-out.
 * NIBM2-619: this crosses into Room Service's territory (housekeeping status
 * lives on the Room entity, owned by Uvisha). This client fails SOFT -
 * a Room Service outage or an endpoint that doesn't exist yet must not block
 * the booking status transition itself. Confirm the real endpoint shape with
 * Uvisha; this assumes PATCH /api/admin/rooms/{roomId}/status per the doc.
 */
@Component
public class RoomServiceClient {

    private static final Logger log = LoggerFactory.getLogger(RoomServiceClient.class);

    private final WebClient webClient;
    private final long timeoutMs;

    public RoomServiceClient(WebClient roomServiceWebClient, Environment env) {
        this.webClient = roomServiceWebClient;
        this.timeoutMs = env.getProperty("room-service.timeout-ms", Long.class, 3000L);
    }

    public void updateRoomStatus(Long roomId, String status) {
        try {
            webClient.patch()
                    .uri("/api/admin/rooms/{id}/status", roomId)
                    .bodyValue(new RoomStatusUpdateRequest(status))
                    .retrieve()
                    .toBodilessEntity()
                    .block(Duration.ofMillis(timeoutMs));
        } catch (Exception e) {
            // Soft failure by design - see class comment.
            log.warn("Failed to sync room {} status to {} on Room Service: {}",
                    roomId, status, e.getMessage());
        }
    }

    private record RoomStatusUpdateRequest(String status) {
    }
}
