package com.hms.booking_service.client;

import com.hms.booking_service.dto.GlobalSearchResponse.SearchGuestResult;
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
 * Calls User Service guest directory endpoints for global search.
 * NIBM2-611
 */
@Component
public class UserServiceClient {

    private static final Logger log = LoggerFactory.getLogger(UserServiceClient.class);

    private final WebClient webClient;
    private final long timeoutMs;

    public UserServiceClient(WebClient userServiceWebClient, Environment env) {
        this.webClient = userServiceWebClient;
        this.timeoutMs = env.getProperty("user-service.timeout-ms", Long.class, 3000L);
    }

    /**
     * Search guest directory by query term.
     */
    public List<SearchGuestResult> searchGuests(String query) {
        try {
            List<Map<String, Object>> response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/guests")
                            .queryParam("search", query)
                            .build())
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                    .block(Duration.ofMillis(timeoutMs));

            if (response == null) return List.of();

            List<SearchGuestResult> results = new ArrayList<>();
            for (Map<String, Object> g : response) {
                String id = g.get("id") != null ? g.get("id").toString() : "";
                String firstName = g.get("firstName") != null ? g.get("firstName").toString() : "";
                String lastName = g.get("lastName") != null ? g.get("lastName").toString() : "";
                String name = (firstName + " " + lastName).trim();
                if (name.isEmpty() && g.get("name") != null) {
                    name = g.get("name").toString();
                }
                String email = g.get("email") != null ? g.get("email").toString() : "";
                String phone = g.get("phoneNumber") != null ? g.get("phoneNumber").toString() : (g.get("phone") != null ? g.get("phone").toString() : "");

                results.add(new SearchGuestResult(id, name, email, phone));
            }
            return results;
        } catch (Exception e) {
            log.warn("Guest search lookup failed for query '{}': {}", query, e.getMessage());
            return List.of();
        }
    }
}
