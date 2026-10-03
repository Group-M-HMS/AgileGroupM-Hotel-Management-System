package com.hms.payment_service.exception;

import com.hms.payment_service.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(PaymentNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handlePaymentNotFound(PaymentNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorBody(ex.getMessage()));
    }

    @ExceptionHandler(BookingNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleBookingNotFound(BookingNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorBody(ex.getMessage()));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorBody(ex.getMessage()));
    }

    @ExceptionHandler(InvalidPaymentStateException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidState(InvalidPaymentStateException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorBody(ex.getMessage()));
    }

    @ExceptionHandler(StripeIntegrationException.class)
    public ResponseEntity<ApiResponse<Void>> handleStripeError(StripeIntegrationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorBody(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .orElse("Validation failed");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorBody(message));
    }

    // Routing/protocol errors (unknown route, wrong method, bad media type, missing parameter) carry
    // their own status; without this the catch-all below turned them into 500s.
    @ExceptionHandler({NoResourceFoundException.class, HttpRequestMethodNotSupportedException.class,
            HttpMediaTypeNotSupportedException.class, HttpMediaTypeNotAcceptableException.class,
            MissingServletRequestParameterException.class})
    public ResponseEntity<ApiResponse<Void>> handleFrameworkError(Exception ex) {
        ErrorResponse er = (ErrorResponse) ex;
        HttpStatus status = HttpStatus.resolve(er.getStatusCode().value());
        String message = status == null ? "Request failed" : status.getReasonPhrase();
        return ResponseEntity.status(er.getStatusCode()).body(errorBody(message));
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiResponse<Void>> handleBadInput(Exception ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorBody("Malformed request"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorBody("Unexpected error"));
    }

    private ApiResponse<Void> errorBody(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
