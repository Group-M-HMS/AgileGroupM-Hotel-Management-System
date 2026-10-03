package com.nibm.user_service.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.nibm.user_service.dto.UserResponse;
import com.nibm.user_service.entity.User;
import com.nibm.user_service.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

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

        if (providedSecret == null || !constantTimeEquals(providedSecret, internalSecret)) {
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

    /**
     * One-time admin bootstrap: sets the Firebase "admin" custom claim on the account with
     * the given email (creating it first, with the given password, if it doesn't exist yet),
     * so it's recognised as staff by room-service/booking-service's SecurityConfig. There's
     * no self-serve way to become an admin - this is meant to be called once (via curl over
     * SSH) per new admin account, never from the frontend.
     */
    @PostMapping("/grant-admin")
    public void grantAdmin(
            @RequestHeader(value = "X-Internal-Secret", required = false) String providedSecret,
            @RequestBody Map<String, String> body) {

        if (providedSecret == null || !constantTimeEquals(providedSecret, internalSecret)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid internal service credentials");
        }

        String email = body.get("email");
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email is required");
        }

        try {
            UserRecord user;
            try {
                user = FirebaseAuth.getInstance().getUserByEmail(email);
            } catch (FirebaseAuthException notFound) {
                String password = body.get("password");
                if (password == null || password.isBlank()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "No existing account for that email; password is required to create one");
                }
                user = FirebaseAuth.getInstance().createUser(new UserRecord.CreateRequest()
                        .setEmail(email)
                        .setPassword(password)
                        .setEmailVerified(true));
            }
            FirebaseAuth.getInstance().setCustomUserClaims(user.getUid(), Map.of("admin", true));
        } catch (FirebaseAuthException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Firebase error: " + e.getMessage());
        }
    }

    private boolean constantTimeEquals(String a, String b) {
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }
}
