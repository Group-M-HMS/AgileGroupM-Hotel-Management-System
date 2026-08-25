package com.nibm.user_service.config;

import com.nibm.user_service.security.FirebaseTokenFilter;
import com.nibm.user_service.security.RestAuthenticationEntryPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final RestAuthenticationEntryPoint authenticationEntryPoint;

    public SecurityConfig(RestAuthenticationEntryPoint authenticationEntryPoint) {
        this.authenticationEntryPoint = authenticationEntryPoint;
    }

    /**
     * Bypasses the security filter chain entirely for endpoints that don't need it: internal
     * service-to-service calls (own X-Internal-Secret check in the controller, never called
     * from a browser so no CORS needed) and API-doc tooling. "/error" is exempted too: when a
     * controller calls sendError() (e.g. our own 401 for a bad X-Internal-Secret), Tomcat
     * forwards the request to "/error" internally, which re-enters this filter chain as a
     * *second*, unauthenticated request - without this, that second pass gets denied by
     * .anyRequest().authenticated() and silently overwrites the real error body with the
     * generic "Authentication required" message from authenticationEntryPoint.
     */
    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (WebSecurity web) -> web.ignoring().requestMatchers(
                "/api/v1/users/internal/**", "/swagger-ui/**", "/v3/api-docs/**", "/error");
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex.authenticationEntryPoint(authenticationEntryPoint))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/users/register").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(new FirebaseTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}