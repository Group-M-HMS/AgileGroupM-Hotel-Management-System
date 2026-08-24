package com.nibm.user_service.controller;

import com.nibm.user_service.dto.UserResponse;
import com.nibm.user_service.entity.User;
import com.nibm.user_service.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * Service-to-service endpoints, not customer-facing. Lets other services (e.g.
 * booking-service resolving a guest's display name for a booking) look up a
 * profile without a Firebase ID token, mirroring booking-service's
 * BookingInternalController X-Internal-Secret pattern.
 */
@RestController
@RequestMapping("/api/v1/users/internal")
public class UserInternalController {

    private final UserService userService;
    private final String internalSecret;

    public UserInternalController(UserService userService,
                                   @Value("${internal.service-secret}") String internalSecret) {
        this.userService = userService;
        this.internalSecret = internalSecret;
    }

    @GetMapping("/{id}")
    public UserResponse getUserInternal(
            @RequestHeader(value = "X-Internal-Secret", required = false) String providedSecret,
            @PathVariable String id) {

        if (providedSecret == null || !providedSecret.equals(internalSecret)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid internal service credentials");
        }

        User user = userService.getUserById(id);
        return new UserResponse(
                user.getFirebaseUid(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getCreatedAt()
        );
    }
}
