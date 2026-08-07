package com.hms.booking_service.client;

import com.hms.booking_service.dto.RoomDetailInfo;
import com.hms.booking_service.exception.RoomNotFoundException;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;

@Component
public class RoomDetailServiceClient {

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
}
