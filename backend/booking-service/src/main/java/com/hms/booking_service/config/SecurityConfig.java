package com.hms.booking_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.booking_service.security.FirebaseTokenFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.Map;

/**
 * Customer-facing booking endpoints (BookingController, BookingInternalController) stay
 * unauthenticated here - they're gated by X-User-Id / X-Internal-Secret, a separate,
 * already-tracked concern. Everything under /api/admin/**, plus the legacy alias paths the
 * admin controllers also answer on (/api/v1/admin/**, /api/search, /api/v1/search), now
 * requires a real Firebase ID token carrying the "admin" custom claim (see
 * FirebaseTokenFilter) - replaces the old X-Admin-Secret stopgap.
 */
@Configuration
public class SecurityConfig {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> writeJsonError(response, 401, "Authentication required"))
                        .accessDeniedHandler((request, response, accessDeniedException) -> writeJsonError(response, 403, "Admin access required")))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/admin/**",
                                "/api/v1/admin/**",
                                "/api/search",
                                "/api/v1/search")
                        .hasAuthority("ROLE_ADMIN")
                        .anyRequest().permitAll())
                .addFilterBefore(new FirebaseTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private static void writeJsonError(jakarta.servlet.http.HttpServletResponse response, int status, String message) throws java.io.IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(OBJECT_MAPPER.writeValueAsString(Map.of("error", message)));
    }
}
