package com.hms.booking_service.client;

import com.hms.booking_service.dto.DashboardMetricsResponse.RoomStatusCounts;
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
 * Calls Room Service to update housekeeping status, search rooms, and aggregate room operational metrics.
 * NIBM2-552 / NIBM2-611 / NIBM2-619
 */
@Component
public class RoomServiceClient {

    private static final Logger log = LoggerFactory.getLogger(RoomServiceClient.class);

    private final WebClient webClient;
    private final long timeoutMs;
    private final String internalSecret;

    public RoomServiceClient(WebClient roomServiceWebClient, Environment env) {
        this.webClient = roomServiceWebClient;
        this.internalSecret = env.getProperty("internal.service-secret", "");
        this.timeoutMs = env.getProperty("room-service.timeout-ms", Long.class, 3000L);
    }

    public void updateRoomStatus(Long roomId, String status) {
        try {
            webClient.patch()
                    .uri("/api/internal/rooms/{id}/status", roomId)
                    .header("X-Internal-Secret", internalSecret)
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
            List<Map<String, Object>> all = webClient.get()
                    .uri("/api/internal/rooms")
                    .header("X-Internal-Secret", internalSecret)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                    .block(Duration.ofMillis(timeoutMs));

            if (all == null) return List.of();

            // The internal endpoint lists every room; filter here like the old ?q= did.
            String needle = query == null ? "" : query.toLowerCase();
            List<SearchRoomResult> results = new ArrayList<>();
            for (Map<String, Object> r : all) {
                String haystack = (str(r, "title") + " " + str(r, "roomNumber") + " " + str(r, "bedType") + " " + str(r, "roomType")).toLowerCase();
                if (!haystack.contains(needle)) continue;
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

    /**
     * Fetches current room inventory operational counts across all rooms.
     * NIBM2-552
     */
    public RoomStatusCounts getRoomStatusCounts() {
        int available = 0;
        int occupied = 0;
        int cleaning = 0;
        int maintenance = 0;

        try {
            List<Map<String, Object>> rooms = webClient.get()
                    .uri("/api/internal/rooms")
                    .header("X-Internal-Secret", internalSecret)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                    .block(Duration.ofMillis(timeoutMs));

            if (rooms != null) {
                for (Map<String, Object> r : rooms) {
                    String status = r.get("status") != null ? r.get("status").toString().toUpperCase() : "AVAILABLE";
                    switch (status) {
                        case "OCCUPIED" -> occupied++;
                        case "CLEANING" -> cleaning++;
                        case "MAINTENANCE" -> maintenance++;
                        default -> available++;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch room operational status from Room Service: {}", e.getMessage());
            // Don't invent numbers: zeros make a Room Service outage visibly not "50 free rooms".
            available = 0;
            occupied = 0;
            cleaning = 0;
            maintenance = 0;
        }

        return new RoomStatusCounts(available, occupied, cleaning, maintenance);
    }

    private static String str(Map<String, Object> r, String key) {
        return r.get(key) != null ? r.get(key).toString() : "";
    }

    private record RoomStatusUpdateRequest(String status) {
    }
}
