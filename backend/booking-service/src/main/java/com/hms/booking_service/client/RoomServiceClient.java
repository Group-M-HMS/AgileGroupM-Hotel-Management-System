package com.hms.booking_service.client;

import com.hms.booking_service.dto.GlobalSearchResponse.SearchRoomResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Calls Room Service to update housekeeping status and search rooms for global search.
 * NIBM2-611 / NIBM2-619
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
            // Soft failure by design
            log.warn("Failed to sync room {} status to {} on Room Service: {}",
                    roomId, status, e.getMessage());
        }
    }

    /**
     * Search room catalog by query term for global search.
     */
    public List<SearchRoomResult> searchRooms(String query) {
        try {
            List<Map<String, Object>> response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/rooms")
                            .queryParam("q", query)
                            .build())
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                    .block(Duration.ofMillis(timeoutMs));

            if (response == null) return List.of();

            List<SearchRoomResult> results = new ArrayList<>();
            for (Map<String, Object> r : response) {
                Long id = r.get("id") != null ? Long.valueOf(r.get("id").toString()) : null;
                String number = r.get("roomNumber") != null ? r.get("roomNumber").toString() : (r.get("number") != null ? r.get("number").toString() : "");
                String title = r.get("title") != null ? r.get("title").toString() : "Room";
                String bedType = r.get("bedType") != null ? r.get("bedType").toString() : "";
                String roomType = r.get("roomType") != null ? r.get("roomType").toString() : "";
                String status = r.get("status") != null ? r.get("status").toString() : "AVAILABLE";

                results.add(new SearchRoomResult(id, number, title, bedType, roomType, status));
            }
            return results;
        } catch (Exception e) {
            log.warn("Room search lookup failed for query '{}': {}", query, e.getMessage());
            return List.of();
        }
    }

    private record RoomStatusUpdateRequest(String status) {
    }
}
