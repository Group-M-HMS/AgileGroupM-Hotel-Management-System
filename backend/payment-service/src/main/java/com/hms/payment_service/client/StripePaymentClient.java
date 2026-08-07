package com.hms.payment_service.client;

import com.hms.payment_service.exception.StripeIntegrationException;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.net.RequestOptions;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;


@Component
public class StripePaymentClient {

    public PaymentIntent createPaymentIntent(BigDecimal amount, String currency,
                                              String idempotencyKey, Long bookingId) {
        try {
            long amountInSmallestUnit = amount
                    .movePointRight(2) // dollars -> cents
                    .longValueExact();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInSmallestUnit)
                    .setCurrency(currency.toLowerCase())
                    .putMetadata("bookingId", String.valueOf(bookingId))
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            // Passing the idempotency key to Stripe itself is what actually
            // prevents a double-charge on network retries - our own DB
            // uniqueness constraint is a second line of defense.
            RequestOptions requestOptions = RequestOptions.builder()
                    .setIdempotencyKey(idempotencyKey)
                    .build();

            return PaymentIntent.create(params, requestOptions);
        } catch (StripeException e) {
            throw new StripeIntegrationException("Failed to create Stripe PaymentIntent", e);
        }
    }

    /**
     * Retrieves the current status of a PaymentIntent from Stripe.
     * Covers the Stripe side of NIBM2-272 (confirm payment status).
     */
    public PaymentIntent retrievePaymentIntent(String paymentIntentId) {
        try {
            return PaymentIntent.retrieve(paymentIntentId);
        } catch (StripeException e) {
            throw new StripeIntegrationException("Failed to retrieve Stripe PaymentIntent", e);
        }
    }
}
