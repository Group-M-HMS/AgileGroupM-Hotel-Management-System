package com.hms.payment_service.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Refuses to boot with the old public placeholder secret. A blank secret is allowed to start
 * (tests, local runs) but every internal endpoint rejects all calls until a real one is set.
 */
@Component
public class InternalSecretCheck {

    private static final Logger log = LoggerFactory.getLogger(InternalSecretCheck.class);

    public InternalSecretCheck(@Value("${internal.service-secret:}") String secret) {
        if (secret.startsWith("change-me")) {
            throw new IllegalStateException(
                    "INTERNAL_SERVICE_SECRET is still the public placeholder; set a real random value");
        }
        if (secret.isBlank()) {
            log.warn("INTERNAL_SERVICE_SECRET is not set: internal service-to-service calls will be rejected");
        }
    }
}
