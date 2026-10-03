package com.nibm.room_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nibm.room_service.security.FirebaseTokenFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.Map;

/**
 * Public room browsing (search, room detail, images, amenities, experiences) stays
 * unauthenticated. Everything that mutates inventory or lives under /api/admin/** requires
 * a real Firebase ID token carrying the "admin" custom claim (see FirebaseTokenFilter) -
 * replaces the old X-Admin-Secret stopgap.
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
                        .requestMatchers(HttpMethod.GET, "/api/rooms/search").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/rooms/*/images").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/rooms/*/amenities").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/rooms/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/experiences", "/api/experiences/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/api/rooms/**", "/api/admin/**").hasAuthority("ROLE_ADMIN")
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
