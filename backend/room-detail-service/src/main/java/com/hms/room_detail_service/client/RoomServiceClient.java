package com.hms.room_detail_service.client;

import com.hms.room_detail_service.dto.RoomBasicInfo;
import com.hms.room_detail_service.exception.RoomNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;

@Component
public class RoomServiceClient {

    private final WebClient webClient;
    private final long timeoutMs;

    public RoomServiceClient(WebClient roomServiceWebClient,
                             org.springframework.core.env.Environment env) {
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

            return new RoomBasicInfo(
                    response.id(),
                    response.name(),
                    response.description(),
                    response.maxOccupancy()
            );
        } catch (WebClientResponseException.NotFound ex) {
            throw new RoomNotFoundException(roomId);
        }
    }

    private record RoomServiceRoomResponse(
            Long id,
            String name,
            String description,
            Integer maxOccupancy,
            String status
    ) {
    }
}
