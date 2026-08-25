package com.hms.booking_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.booking_service.config.SecurityConfig;
import com.hms.booking_service.dto.*;
import com.hms.booking_service.entity.BookingStatus;
import com.hms.booking_service.entity.BookingSource;
import com.hms.booking_service.service.BookingAdminService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.flyway.autoconfigure.FlywayAutoConfiguration;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.security.autoconfigure.web.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.security.autoconfigure.web.servlet.ServletWebSecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest; // Spring Boot 4.x package
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = BookingAdminController.class, excludeAutoConfiguration = FlywayAutoConfiguration.class)
@ImportAutoConfiguration({SecurityAutoConfiguration.class, ServletWebSecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class})
@Import(SecurityConfig.class)
public class BookingAdminControllerTests {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private BookingAdminService bookingAdminService;

    /** Stands in for the "admin" custom-claim principal FirebaseTokenFilter would normally set. */
    private static org.springframework.test.web.servlet.request.RequestPostProcessor asAdmin() {
        return SecurityMockMvcRequestPostProcessors.authentication(
                new UsernamePasswordAuthenticationToken("test-admin-uid", null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
    }

    @Test
    public void searchBookings_unauthorized_fails() throws Exception {
        mockMvc.perform(get("/api/admin/bookings"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void searchBookings_authorized_succeeds() throws Exception {
        AdminBookingSummary summary = new AdminBookingSummary(
                1L, "REF123", "user123", "John Doe", "john@example.com", "12345",
                2L, "Suite Room", "101", LocalDate.now(), LocalDate.now().plusDays(2),
                2, new BigDecimal("200.00"), true, BookingStatus.CONFIRMED,
                BookingSource.WALK_IN, "No requests", null
        );
        PagedResponse<AdminBookingSummary> paged = new PagedResponse<>(List.of(summary), 1L);

        Mockito.when(bookingAdminService.searchBookings(any(), any(), any(), eq(0), eq(20)))
                .thenReturn(paged);

        mockMvc.perform(get("/api/admin/bookings")
                        .with(asAdmin())
                        .param("q", "John")
                        .param("status", "CONFIRMED")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items[0].guestName").value("John Doe"))
                .andExpect(jsonPath("$.data.total").value(1));
    }

    @Test
    public void checkIn_authorized_succeeds() throws Exception {
        BookingStatusChangeResponse response = new BookingStatusChangeResponse(1L, BookingStatus.CHECKED_IN);
        Mockito.when(bookingAdminService.checkIn(1L)).thenReturn(response);

        mockMvc.perform(post("/api/admin/bookings/1/check-in")
                        .with(asAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CHECKED_IN"));
    }

    @Test
    public void checkOut_authorized_succeeds() throws Exception {
        BookingStatusChangeResponse response = new BookingStatusChangeResponse(1L, BookingStatus.CHECKED_OUT);
        Mockito.when(bookingAdminService.checkOut(1L)).thenReturn(response);

        mockMvc.perform(post("/api/admin/bookings/1/check-out")
                        .with(asAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CHECKED_OUT"));
    }

    @Test
    public void createWalkInBooking_invalidRequest_returnsBadRequest() throws Exception {
        WalkInBookingRequest invalidRequest = new WalkInBookingRequest(
                "", "", "123", 2L, LocalDate.now(), LocalDate.now().plusDays(2), 0, "", true
        );

        mockMvc.perform(post("/api/admin/bookings/walk-in")
                        .with(asAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    public void createWalkInBooking_validRequest_succeeds() throws Exception {
        WalkInBookingRequest validRequest = new WalkInBookingRequest(
                "John Doe", "john@example.com", "123", 2L, LocalDate.now(), LocalDate.now().plusDays(2), 2, "", true
        );
        CreateBookingResponse response = new CreateBookingResponse(1L, BookingStatus.CONFIRMED, new BigDecimal("200.00"));

        Mockito.when(bookingAdminService.createWalkInBooking(any(WalkInBookingRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/admin/bookings/walk-in")
                        .with(asAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"));
    }
}
