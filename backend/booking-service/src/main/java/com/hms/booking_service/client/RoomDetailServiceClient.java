package com.hms.booking_service.client;

import com.hms.booking_service.dto.RoomDetailInfo;
import com.hms.booking_service.exception.RoomNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Component
public class RoomDetailServiceClient {

    private static final Logger log = LoggerFactory.getLogger(RoomDetailServiceClient.class);

    private final WebClient webClient;
    private final long timeoutMs;

    public RoomDetailServiceClient(WebClient roomDetailServiceWebClient, Environment env) {
        this.webClient = roomDetailServiceWebClient;
        this.timeoutMs = env.getProperty("room-detail-service.timeout-ms", Long.class, 3000L);
    }

    public RoomDetailInfo getRoomDetail(Long roomId) {
        try {
            RoomDetailInfo response = webClient.get()
                    .uri("/api/rooms/{id}", roomId)
                    .retrieve()
                    .bodyToMono(RoomDetailInfo.class)
                    .block(Duration.ofMillis(timeoutMs));

            if (response == null) {
                throw new RoomNotFoundException(roomId);
            }
            return response;
        } catch (WebClientResponseException.NotFound ex) {
            throw new RoomNotFoundException(roomId);
        }
    }

    /**
     * Updates operational/housekeeping status of a room in room-service.
     */
    public void updateRoomStatus(Long roomId, String status, String changedBy, String remarks, String guestName) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("status", status);
            payload.put("changedBy", changedBy != null ? changedBy : "BOOKING_SERVICE");
            payload.put("remarks", remarks != null ? remarks : "Triggered by booking status change");
            if (guestName != null) {
                payload.put("guestName", guestName);
            }

            webClient.patch()
                    .uri("/api/rooms/{id}/status", roomId)
                    .bodyValue(payload)
                    .retrieve()
                    .toBodilessEntity()
                    .block(Duration.ofMillis(timeoutMs));
        } catch (Exception ex) {
            log.warn("Could not sync room status with room-service for room {}: {}", roomId, ex.getMessage());
        }
    }
}
