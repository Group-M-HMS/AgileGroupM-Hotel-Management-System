-- Online bookings created before V6 have no expires_at, so the expiry job never released them and
-- their unpaid holds blocked rooms indefinitely (some for dates years ahead). Mark them expired now;
-- the job cancels them on its next sweep. Walk-ins are left alone (staff-managed, never expire).
UPDATE bookings
SET expires_at = CURRENT_TIMESTAMP
WHERE status = 'PENDING'
  AND expires_at IS NULL
  AND source <> 'WALK_IN';
