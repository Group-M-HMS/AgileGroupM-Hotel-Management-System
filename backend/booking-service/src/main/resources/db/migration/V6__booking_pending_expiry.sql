-- #6: online bookings sit in PENDING until Stripe confirms. expires_at is when an unpaid
-- hold is released; the scheduled expiry job cancels PENDING rows past this time so the
-- exclusion constraint stops blocking those dates. NULL = never expires (walk-ins, paid).
ALTER TABLE bookings ADD COLUMN expires_at TIMESTAMP;
CREATE INDEX idx_bookings_pending_expiry ON bookings (expires_at) WHERE status = 'PENDING';
