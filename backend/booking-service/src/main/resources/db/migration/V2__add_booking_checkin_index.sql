-- Add indexes for check-in dates and status-date range queries
CREATE INDEX IF NOT EXISTS idx_bookings_check_in_date ON bookings(check_in_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status_dates ON bookings(status, check_in_date, check_out_date);

-- Add check-in and check-out tracking columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMP;
