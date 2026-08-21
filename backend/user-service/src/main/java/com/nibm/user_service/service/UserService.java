package com.nibm.user_service.service;

import com.google.firebase.auth.FirebaseToken;
import com.nibm.user_service.dto.BookingDto;
import com.nibm.user_service.dto.GuestRegistrationRequest;
import com.nibm.user_service.dto.ProfileSyncRequest;
import com.nibm.user_service.dto.UserUpdateRequest;
import com.nibm.user_service.entity.User;
import com.nibm.user_service.exception.EmailAlreadyExistsException;
import com.nibm.user_service.exception.ResourceNotFoundException;
import com.nibm.user_service.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BookingHistoryService bookingHistoryService;

    public UserService(UserRepository userRepository, BookingHistoryService bookingHistoryService) {
        this.userRepository = userRepository;
        this.bookingHistoryService = bookingHistoryService;
    }

    /**
     * Registers a new guest or walk-in customer.
     * Validates unique email constraint and generates an identifier if not provided.
     */
    @Transactional
    public User registerGuest(GuestRegistrationRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailAndDeletedFalse(normalizedEmail)) {
            throw new EmailAlreadyExistsException("A guest profile with email '" + request.email() + "' already exists");
        }

        String uid = (request.firebaseUid() != null && !request.firebaseUid().isBlank())
                ? request.firebaseUid()
                : "guest-" + UUID.randomUUID().toString().substring(0, 8);

        User user = new User();
        user.setFirebaseUid(uid);
        user.setEmail(normalizedEmail);
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setPhone(request.phone().trim());
        user.setDeleted(false);
        user.setDeletedAt(null);

        return userRepository.save(user);
    }

    /**
     * Lists registered guests or searches across names, email, and phone.
     */
    @Transactional(readOnly = true)
    public List<User> searchGuests(String query) {
        if (query == null || query.isBlank()) {
            return userRepository.findAllByDeletedFalseOrderByCreatedAtDesc();
        }
        return userRepository.searchGuests(query.trim());
    }

    /**
     * Retrieves a single active guest profile by ID.
     */
    @Transactional(readOnly = true)
    public User getUserById(String id) {
        return userRepository.findByFirebaseUidAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Guest profile not found with ID: " + id));
    }

    /**
     * Updates an existing guest profile (first_name, last_name, email, phone).
     */
    @Transactional
    public User updateUser(String id, UserUpdateRequest request) {
        User user = getUserById(id);

        String newEmail = request.email().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(newEmail) && userRepository.existsByEmailAndDeletedFalse(newEmail)) {
            throw new EmailAlreadyExistsException("Email '" + request.email() + "' is already in use by another profile");
        }

        user.setEmail(newEmail);
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setPhone(request.phone().trim());

        return userRepository.save(user);
    }

    /**
     * Soft-deletes a guest profile, retaining booking and transaction history in the database.
     */
    @Transactional
    public void softDeleteUser(String id) {
        User user = getUserById(id);
        user.setDeleted(true);
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * Retrieves stay/booking history for a specific guest profile.
     */
    public List<BookingDto> getGuestBookingHistory(String id) {
        User user = getUserById(id);
        return bookingHistoryService.fetchAllBookings(user.getEmail());
    }

    /**
     * Creates or updates the caller's profile from the submitted details during auth sync.
     */
    @Transactional
    public User syncProfile(FirebaseToken token, ProfileSyncRequest request) {
        User user = userRepository.findById(token.getUid())
                .orElseGet(() -> {
                    User created = new User();
                    created.setFirebaseUid(token.getUid());
                    return created;
                });
        user.setEmail(token.getEmail() != null ? token.getEmail().trim().toLowerCase() : "");
        user.setFirstName(request.firstName() != null ? request.firstName().trim() : "");
        user.setLastName(request.lastName() != null ? request.lastName().trim() : "");
        user.setPhone(request.phone() != null ? request.phone().trim() : "");
        user.setDeleted(false);
        user.setDeletedAt(null);
        return userRepository.save(user);
    }

    /**
     * Returns caller's profile, provisioning a minimal one from Firebase token if not yet created.
     */
    @Transactional
    public User getProfile(FirebaseToken token) {
        return userRepository.findById(token.getUid())
                .orElseGet(() -> {
                    User user = new User();
                    user.setFirebaseUid(token.getUid());
                    user.setEmail(token.getEmail() != null ? token.getEmail().trim().toLowerCase() : "");
                    user.setFirstName("");
                    user.setLastName("");
                    user.setPhone("");
                    user.setDeleted(false);
                    user.setDeletedAt(null);
                    return userRepository.save(user);
                });
    }
}