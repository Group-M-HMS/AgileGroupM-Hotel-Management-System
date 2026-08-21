package com.nibm.user_service.controller;

import com.google.firebase.auth.FirebaseToken;
import com.nibm.user_service.dto.BookingDto;
import com.nibm.user_service.dto.GuestRegistrationRequest;
import com.nibm.user_service.dto.ProfileSyncRequest;
import com.nibm.user_service.dto.UserResponse;
import com.nibm.user_service.dto.UserUpdateRequest;
import com.nibm.user_service.entity.User;
import com.nibm.user_service.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Guest registration endpoint (walk-ins and direct registrations).
     * Subtask: NIBM2-626, NIBM2-627
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse registerGuest(@Valid @RequestBody GuestRegistrationRequest request) {
        User user = userService.registerGuest(request);
        return toResponse(user);
    }

    /**
     * List and search registered guest directory.
     * Subtask: NIBM2-587
     */
    @GetMapping
    public List<UserResponse> listOrSearchGuests(
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(name = "search", required = false) String search) {
        String query = q != null ? q : search;
        return userService.searchGuests(query).stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Get specific guest profile by ID.
     */
    @GetMapping("/{id}")
    public UserResponse getGuestById(@PathVariable String id) {
        User user = userService.getUserById(id);
        return toResponse(user);
    }

    /**
     * Update guest profile details.
     * Subtask: NIBM2-591, NIBM2-628
     */
    @PutMapping("/{id}")
    public UserResponse updateGuest(
            @PathVariable String id,
            @Valid @RequestBody UserUpdateRequest request) {
        User user = userService.updateUser(id, request);
        return toResponse(user);
    }

    /**
     * Soft-delete guest profile.
     * Subtask: NIBM2-594, NIBM2-629
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGuest(@PathVariable String id) {
        userService.softDeleteUser(id);
    }

    /**
     * Fetch stay/booking history for a specific guest profile.
     * Subtask: NIBM2-594
     */
    @GetMapping("/{id}/bookings")
    public List<BookingDto> getGuestBookings(@PathVariable String id) {
        return userService.getGuestBookingHistory(id);
    }

    /**
     * Sync authenticated user profile from client auth state.
     */
    @PostMapping("/sync")
    public UserResponse syncProfile(@RequestBody ProfileSyncRequest request) {
        FirebaseToken token = currentToken();
        User user = userService.syncProfile(token, request);
        return toResponse(user);
    }

    /**
     * Current authenticated user profile.
     */
    @GetMapping("/me")
    public UserResponse getMyProfile() {
        FirebaseToken token = currentToken();
        User user = userService.getProfile(token);
        return toResponse(user);
    }

    private FirebaseToken currentToken() {
        return (FirebaseToken) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private UserResponse toResponse(User user) {
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