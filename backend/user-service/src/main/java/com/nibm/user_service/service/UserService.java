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

    public User syncProfile(FirebaseToken token, ProfileSyncRequest request) {
        return userRepository.findById(token.getUid())
                .orElseGet(() -> {
                    User user = new User();
                    user.setFirebaseUid(token.getUid());
                    user.setEmail(token.getEmail());
                    user.setFirstName(request.firstName());
                    user.setLastName(request.lastName());
                    user.setPhone(request.phone());
                    return userRepository.save(user);
                });
    }

    public User getProfile(String firebaseUid) {
        return userRepository.findById(firebaseUid)
                .orElseThrow(() -> new IllegalArgumentException("No profile found for this user"));
    }
}