package com.nibm.user_service.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BookingDto(
        String email,
        Long id,
        Long roomId,
        LocalDate checkIn,
        LocalDate checkOut,
        Integer guests,
        BigDecimal subtotal,
        BigDecimal taxRate,
        BigDecimal taxAmount,
        BigDecimal total,
        String status,
        String firstName,
        String lastName,
        String phone,
        String specialRequests
) {}
