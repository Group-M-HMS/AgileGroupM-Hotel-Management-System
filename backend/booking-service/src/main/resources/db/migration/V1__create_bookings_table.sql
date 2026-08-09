-- Schema for booking-service. The service runs with spring.jpa.hibernate.ddl-auto=validate,
-- so every column here must match the com.hms.booking_service.entity.Booking JPA mapping.
-- btree_gist is needed for the exclusion constraint below (equality on a scalar column
-- combined with a range overlap operator).
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE bookings (
    id                  BIGSERIAL PRIMARY KEY,
    customer_id         VARCHAR(255)   NOT NULL,
    room_id             BIGINT         NOT NULL,
    check_in_date       DATE           NOT NULL,
    check_out_date      DATE           NOT NULL,
    number_of_guests    INTEGER        NOT NULL,
    special_requests    VARCHAR(1000),
    status              VARCHAR(20)    NOT NULL,
    total_amount        NUMERIC(12, 2) NOT NULL,
    booking_reference   VARCHAR(255),
    terms_accepted      BOOLEAN        NOT NULL,
    cancellation_reason VARCHAR(255),
    created_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- NIBM2-314: no two active (non-cancelled) bookings for the same room may hold
    -- overlapping stays. The range is half-open [check_in, check_out) so a new stay
    -- can begin on the day a previous one checks out (back-to-back bookings are allowed).
    -- Cancelling a booking removes it from this constraint, which is what "releases"
    -- the room's dates back into availability.
    CONSTRAINT no_overlapping_active_bookings EXCLUDE USING gist (
        room_id WITH =,
        daterange(check_in_date, check_out_date, '[)') WITH &&
    ) WHERE (status <> 'CANCELLED')
);
