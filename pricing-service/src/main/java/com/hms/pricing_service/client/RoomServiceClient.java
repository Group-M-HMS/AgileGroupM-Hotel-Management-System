package com.hms.pricing_service.client;

import com.hms.pricing_service.dto.RoomBasicInfo;
import com.hms.pricing_service.exception.RoomNotFoundException;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.math.BigDecimal;
import java.time.Duration;

@Component
public class RoomServiceClient {
    private final WebClient webClient;
    private final long timeoutMs;

    public RoomServiceClient(WebClient roomServiceWebClient, Environment env) {
        this.webClient = roomServiceWebClient;
        this.timeoutMs = env.getProperty("room-service.timeout-ms", Long.class, 3000L);
    }

    public RoomBasicInfo getRoomBasicInfo(Long roomId) {
        try {
            RoomServiceRoomResponse response = webClient.get()
                    .uri("/api/rooms/{id}", roomId)
                    .retrieve()
                    .bodyToMono(RoomServiceRoomResponse.class)
                    .block(Duration.ofMillis(timeoutMs));

            if (response == null) {
                throw new RoomNotFoundException(roomId);
            }

            return new RoomBasicInfo(response.id(), response.name(), response.basePrice());
        } catch (WebClientResponseException.NotFound ex) {
            throw new RoomNotFoundException(roomId);
        }
    }

    /**
     * Mirrors the room row exposed by Room Service (rooms table, section 5.1).
     */
    private record RoomServiceRoomResponse(
            Long id,
            String name,
            BigDecimal basePrice,
            Integer maxOccupancy,
            String status
    ) {
    }
}
