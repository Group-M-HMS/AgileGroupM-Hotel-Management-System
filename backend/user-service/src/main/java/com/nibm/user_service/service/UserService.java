package com.nibm.user_service.service;

import com.google.firebase.auth.FirebaseToken;
import com.nibm.user_service.dto.ProfileSyncRequest;
import com.nibm.user_service.entity.User;
import com.nibm.user_service.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Creates or updates the caller's profile from the submitted details. Applies the
     * request's fields whether the row is new or already exists, so a sync always wins —
     * this matters because getProfile (/me) can auto-create a blank row first (fired by
     * the client's auth-state listener at signup), and an update-on-create-only sync
     * would then silently drop the name the user just entered.
     */
    public User syncProfile(FirebaseToken token, ProfileSyncRequest request) {
        User user = userRepository.findById(token.getUid())
                .orElseGet(() -> {
                    User created = new User();
                    created.setFirebaseUid(token.getUid());
                    return created;
                });
        user.setEmail(token.getEmail());
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setPhone(request.phone());
        return userRepository.save(user);
    }

    /**
     * Returns the caller's profile, provisioning a minimal one from the Firebase token
     * if none exists yet. Firebase is the source of truth for identity; a missing DB
     * profile (e.g. an account created before profile sync worked, or an admin-created
     * user) is auto-created here rather than being treated as an error, so any valid
     * Firebase user can always log in. Name/phone stay blank until the user edits them.
     */
    public User getProfile(FirebaseToken token) {
        return userRepository.findById(token.getUid())
                .orElseGet(() -> {
                    User user = new User();
                    user.setFirebaseUid(token.getUid());
                    user.setEmail(token.getEmail());
                    user.setFirstName("");
                    user.setLastName("");
                    user.setPhone("");
                    return userRepository.save(user);
                });
    }
}