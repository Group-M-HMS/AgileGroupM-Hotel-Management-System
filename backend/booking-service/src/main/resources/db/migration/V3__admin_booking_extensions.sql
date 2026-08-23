-- V3__admin_booking_extensions.sql
-- Admin console support for Booking Service.

-- NIBM2-619: customer_id must become nullable for walk-in bookings
-- (no customer account exists for a front-desk-created booking).
ALTER TABLE bookings ALTER COLUMN customer_id DROP NOT NULL;

-- NIBM2-622: track where a booking came from.
ALTER TABLE bookings ADD COLUMN source VARCHAR(20) NOT NULL DEFAULT 'WEBSITE';

-- NIBM2-622: denormalized contact info for walk-in guests with no customer account.
ALTER TABLE bookings ADD COLUMN guest_name VARCHAR(255);
ALTER TABLE bookings ADD COLUMN guest_email VARCHAR(255);
ALTER TABLE bookings ADD COLUMN guest_phone VARCHAR(50);

-- NIBM2-618: composite index for the admin ledger's filtered/paginated queries
-- (search by reference, filter by status, filter by customer/guest history).
CREATE INDEX idx_bookings_admin_ledger
    ON bookings (booking_reference, status, customer_id);

-- NIBM2-620: GiST index on the date range itself, separate from the exclusion
-- constraint's index (V1). The exclusion constraint enforces "no overlap on
-- insert"; this index is what makes a *range-overlap read query*
-- (GET /admin/bookings/schedule?from=&to=) fast across many rooms at once.
CREATE INDEX idx_bookings_daterange_gist
    ON bookings USING gist (daterange(check_in_date, check_out_date, '[)'));
