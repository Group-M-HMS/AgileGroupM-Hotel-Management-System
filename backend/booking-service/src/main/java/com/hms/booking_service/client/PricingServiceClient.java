package com.hms.booking_service.client;

import com.hms.booking_service.dto.PricingQuote;
import com.hms.booking_service.exception.PricingServiceException;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.LocalDate;

@Component
public class PricingServiceClient {

    private final WebClient webClient;
    private final long timeoutMs;

    public PricingServiceClient(WebClient pricingServiceWebClient, Environment env) {
        this.webClient = pricingServiceWebClient;
        this.timeoutMs = env.getProperty("pricing-service.timeout-ms", Long.class, 3000L);
    }

    public PricingQuote getQuote(Long roomId, LocalDate checkIn, LocalDate checkOut) {
        try {
            PricingQuote quote = webClient.post()
                    .uri("/api/pricing/quote")
                    .bodyValue(new QuoteRequestBody(roomId, checkIn, checkOut))
                    .retrieve()
                    .bodyToMono(PricingQuote.class)
                    .block(Duration.ofMillis(timeoutMs));

            if (quote == null) {
                throw new PricingServiceException("Pricing Service returned an empty quote");
            }
            return quote;
        } catch (Exception e) {
            if (e instanceof PricingServiceException pse) {
                throw pse;
            }
            throw new PricingServiceException("Failed to get quote from Pricing Service: " + e.getMessage());
        }
    }

    private record QuoteRequestBody(Long roomId, LocalDate checkIn, LocalDate checkOut) {
    }
}
