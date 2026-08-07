package com.nibm.user_service.controller;

import com.google.firebase.auth.FirebaseToken;
import com.nibm.user_service.dto.UserResponse;
import com.nibm.user_service.entity.User;
import com.nibm.user_service.service.UserService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final UserService userService;

    public CheckoutController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/prefill")
    public UserResponse getPrefillDetails() {
        FirebaseToken token = (FirebaseToken) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userService.getProfile(token);
        return new UserResponse(user.getEmail(), user.getFirstName(), user.getLastName(), user.getPhone());
    }
}