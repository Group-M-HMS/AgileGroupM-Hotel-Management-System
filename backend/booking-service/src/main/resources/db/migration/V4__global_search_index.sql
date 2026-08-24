-- V4__global_search_index.sql
-- NIBM2-612: Optimize global search across booking references and guest names/contacts

CREATE INDEX IF NOT EXISTS idx_bookings_guest_name ON bookings (guest_name);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_email ON bookings (guest_email);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_phone ON bookings (guest_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_reference_search ON bookings (booking_reference);
