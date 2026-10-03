package com.hms.booking_service.client;

import com.hms.booking_service.exception.RefundFailedException;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

@Component
public class PaymentServiceClient {

    private final WebClient webClient;
    private final long timeoutMs;
    private final String internalSecret;

    public PaymentServiceClient(WebClient paymentServiceWebClient, Environment env) {
        this.webClient = paymentServiceWebClient;
        this.internalSecret = env.getProperty("internal.service-secret", "");
        this.timeoutMs = env.getProperty("payment-service.timeout-ms", Long.class, 15000L);
    }

    /** Fully refunds the booking's paid charge. Throws if the refund could not be confirmed. */
    public void refundBooking(Long bookingId) {
        try {
            webClient.post()
                    .uri("/api/v1/payments/internal/booking/{id}/refund", bookingId)
                    .header("X-Internal-Secret", internalSecret)
                    .retrieve()
                    .toBodilessEntity()
                    .block(Duration.ofMillis(timeoutMs));
        } catch (Exception ex) {
            throw new RefundFailedException("Refund failed for booking " + bookingId, ex);
        }
    }
}
