package com.nibm.room_service.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .orElse("Validation failed");
        
        return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                .body(errorBody(org.springframework.http.HttpStatus.BAD_REQUEST, message));
    }

    private Map<String, Object> errorBody(org.springframework.http.HttpStatus status, String message) {
        return Map.of(
                "timestamp", java.time.Instant.now().toString(),
                "status", status.value(),
                "error", status.getReasonPhrase(),
                "message", message
        );
    }
}
