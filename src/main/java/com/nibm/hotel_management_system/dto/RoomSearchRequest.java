package com.nibm.hotel_management_system.dto;

import com.nibm.hotel_management_system.validation.ValidDateRange;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@ValidDateRange
public class RoomSearchRequest {

    @Schema(description = "Check-in date (ISO format). Cannot be in the past.", example = "2026-08-01")
    @NotNull(message = "Check-in date is required")
    @FutureOrPresent(message = "Check-in date cannot be in the past")
    private LocalDate checkIn;

    @Schema(description = "Check-out date (ISO format). Must be after check-in.", example = "2026-08-05")
    @NotNull(message = "Check-out date is required")
    private LocalDate checkOut;

    @Schema(description = "Number of guests", example = "2")
    @NotNull(message = "Guest count is required")
    @Min(value = 1, message = "Guest count must be at least 1")
    private Integer guests;

    public LocalDate getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDate checkIn) { this.checkIn = checkIn; }
    public LocalDate getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDate checkOut) { this.checkOut = checkOut; }
    public Integer getGuests() { return guests; }
    public void setGuests(Integer guests) { this.guests = guests; }
}