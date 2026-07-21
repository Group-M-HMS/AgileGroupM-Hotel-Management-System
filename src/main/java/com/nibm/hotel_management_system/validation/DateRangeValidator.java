package com.nibm.hotel_management_system.validation;

import com.nibm.hotel_management_system.dto.RoomSearchRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class DateRangeValidator implements ConstraintValidator<ValidDateRange, RoomSearchRequest> {

    @Override
    public boolean isValid(RoomSearchRequest request, ConstraintValidatorContext context) {
        if (request.getCheckIn() == null || request.getCheckOut() == null) {
            return true;
        }
        return request.getCheckOut().isAfter(request.getCheckIn());
    }
}