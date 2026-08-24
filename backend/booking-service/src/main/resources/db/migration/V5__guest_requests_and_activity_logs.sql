-- V5__guest_requests_and_activity_logs.sql
-- NIBM2-614: Schema for guest requests, room service requests, and activity alerts

CREATE TABLE IF NOT EXISTS guest_requests (
    id             BIGSERIAL PRIMARY KEY,
    kind           VARCHAR(50)  NOT NULL,
    title          VARCHAR(255) NOT NULL,
    detail         TEXT         NOT NULL,
    room_id        BIGINT,
    booking_id     BIGINT,
    customer_id    VARCHAR(255),
    guest_name     VARCHAR(255),
    status         VARCHAR(50)  NOT NULL DEFAULT 'PENDING',
    resolved_by    VARCHAR(255),
    resolved_at    TIMESTAMP,
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_guest_requests_status ON guest_requests(status);
CREATE INDEX IF NOT EXISTS idx_guest_requests_kind ON guest_requests(kind);
CREATE INDEX IF NOT EXISTS idx_guest_requests_created_at ON guest_requests(created_at DESC);
