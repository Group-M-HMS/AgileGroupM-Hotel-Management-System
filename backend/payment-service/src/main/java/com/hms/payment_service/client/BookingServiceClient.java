package com.hms.payment_service.client;

import com.hms.payment_service.dto.BookingConfirmResult;
import com.hms.payment_service.dto.BookingInfo;
import com.hms.payment_service.exception.BookingNotConfirmableException;
import com.hms.payment_service.exception.BookingNotFoundException;
import com.hms.payment_service.exception.UnauthorizedException;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
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
        this.internalSecret = env.getProperty("internal.service-secret", "");
    }

    /**
     * Loads one of the caller's own bookings, authorised by the customer's Firebase token (forwarded
     * as-is; booking-service verifies it and scopes the lookup to that customer). Someone else's
     * booking comes back as "not found", so ownership is never decided in this service.
     */
    public BookingInfo getOwnedBooking(Long bookingId, String authorization) {
        if (authorization == null || authorization.isBlank()) {
            throw new UnauthorizedException("Authentication required");
        }
        try {
            BookingServiceBookingResponse response = webClient.get()
                    .uri("/api/v1/bookings/my/{id}/payable", bookingId)
                    .header(HttpHeaders.AUTHORIZATION, authorization)
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
        } catch (WebClientResponseException.Unauthorized | WebClientResponseException.Forbidden ex) {
            throw new UnauthorizedException("Authentication required");
        }
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
     *
     * A 4xx answer (e.g. the booking was cancelled when its unpaid hold expired) is final, so it is
     * reported as {@link BookingNotConfirmableException} and the caller refunds. Timeouts and 5xx
     * propagate unchanged: the outcome is unknown and the confirm call can be retried safely.
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
        } catch (WebClientResponseException ex) {
            if (ex.getStatusCode().is4xxClientError()) {
                throw new BookingNotConfirmableException(bookingId, ex.getStatusCode().value());
            }
            throw ex;
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
