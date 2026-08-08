package com.hms.payment_service.client;

import com.hms.payment_service.dto.BookingConfirmResult;
import com.hms.payment_service.dto.BookingInfo;
import com.hms.payment_service.exception.BookingNotFoundException;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;


@Component
public class BookingServiceClient {

    private final WebClient webClient;
    private final long timeoutMs;
    private final String internalSecret;

    public BookingServiceClient(WebClient bookingServiceWebClient, Environment env) {
        this.webClient = bookingServiceWebClient;
        this.timeoutMs = env.getProperty("booking-service.timeout-ms", Long.class, 5000L);
        this.internalSecret = env.getProperty("internal.service-secret", "change-me-in-every-environment");
    }

    public BookingInfo getBooking(Long bookingId) {
        try {
            BookingServiceBookingResponse response = webClient.get()
                    .uri("/api/v1/bookings/internal/{id}", bookingId)
                    .header("X-Internal-Secret", internalSecret)
                    .retrieve()
                    .bodyToMono(BookingServiceBookingResponse.class)
                    .block(Duration.ofMillis(timeoutMs));

            if (response == null) {
                throw new BookingNotFoundException(bookingId);
            }

            return new BookingInfo(response.bookingId(), response.customerId(),
                    response.totalAmount(), response.status());
        } catch (WebClientResponseException.NotFound ex) {
            throw new BookingNotFoundException(bookingId);
        }
    }

    /**
     * Tells Booking Service that a payment succeeded, so it can move the
     * booking to CONFIRMED and generate its reference number.
     * Internal service-to-service endpoint, not part of the public API doc.
     */
    public BookingConfirmResult confirmBooking(Long bookingId, String paymentReference) {
        try {
            BookingConfirmResponse response = webClient.post()
                    .uri("/api/v1/bookings/internal/{id}/confirm-payment", bookingId)
                    .header("X-Internal-Secret", internalSecret)
                    .bodyValue(new BookingConfirmRequest(paymentReference))
                    .retrieve()
                    .bodyToMono(BookingConfirmResponse.class)
                    .block(Duration.ofMillis(timeoutMs));

            if (response == null) {
                throw new BookingNotFoundException(bookingId);
            }
            return new BookingConfirmResult(response.status(), response.bookingReference());
        } catch (WebClientResponseException.NotFound ex) {
            throw new BookingNotFoundException(bookingId);
        }
    }

    private record BookingServiceBookingResponse(
            Long bookingId,
            String customerId,
            java.math.BigDecimal totalAmount,
            String status
    ) {
    }

    // Field name must match booking-service's BookingConfirmPaymentRequest.
    private record BookingConfirmRequest(String transactionReference) {
    }

    private record BookingConfirmResponse(Long bookingId, String status, String bookingReference) {
    }
}
