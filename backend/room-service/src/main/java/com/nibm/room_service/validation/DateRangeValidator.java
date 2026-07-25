package com.nibm.room_service.validation;

import com.nibm.room_service.dto.RoomSearchRequest;
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
