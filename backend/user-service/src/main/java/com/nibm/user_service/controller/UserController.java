package com.nibm.user_service.controller;

import com.google.firebase.auth.FirebaseToken;
import com.nibm.user_service.dto.ProfileSyncRequest;
import com.nibm.user_service.dto.UserResponse;
import com.nibm.user_service.entity.User;
import com.nibm.user_service.service.UserService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/sync")
    public UserResponse syncProfile(@RequestBody ProfileSyncRequest request) {
        FirebaseToken token = currentToken();
        User user = userService.syncProfile(token, request);
        return toResponse(user);
    }

    @GetMapping("/me")
    public UserResponse getMyProfile() {
        FirebaseToken token = currentToken();
        User user = userService.getProfile(token.getUid());
        return toResponse(user);
    }

    private FirebaseToken currentToken() {
        return (FirebaseToken) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.getEmail(), user.getFirstName(), user.getLastName(), user.getPhone());
    }
}