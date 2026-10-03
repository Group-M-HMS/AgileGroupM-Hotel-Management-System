package com.hms.payment_service.dto;

/** result is REFUNDED (money returned, now or earlier) or NO_PAYMENT (nothing was charged). */
public record RefundBookingResponse(Long bookingId, String result) {
}
