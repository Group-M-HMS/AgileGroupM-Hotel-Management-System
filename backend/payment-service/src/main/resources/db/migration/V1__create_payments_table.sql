-- Schema for payment-service. The service runs with spring.jpa.hibernate.ddl-auto=validate,
-- so every column here must match the com.hms.payment_service.entity.Payment JPA mapping.
CREATE TABLE payments (
    id                       BIGSERIAL PRIMARY KEY,
    booking_id               BIGINT         NOT NULL,
    customer_id              VARCHAR(255)   NOT NULL,
    stripe_payment_intent_id VARCHAR(255)   NOT NULL,
    idempotency_key          VARCHAR(255)   NOT NULL UNIQUE,
    amount                   NUMERIC(12, 2) NOT NULL,
    currency                 VARCHAR(3)     NOT NULL,
    payment_method           VARCHAR(255)   NOT NULL,
    status                   VARCHAR(20)    NOT NULL,
    transaction_reference    VARCHAR(255),
    created_at               TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);
