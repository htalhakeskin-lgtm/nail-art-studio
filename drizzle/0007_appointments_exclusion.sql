-- BR-RND-003 (04-veri §9): the same expert can never hold two overlapping slots. The range is
-- half-open [starts_at, blocked_until), so back-to-back appointments do not collide; cancelled
-- and no-show appointments free their slot. A violation raises 23P01, which the booking action
-- turns into "Bu saat az önce doldu". Drizzle cannot model EXCLUDE, hence this custom file.
ALTER TABLE "appointments" ADD CONSTRAINT "ex_appointments_staff_overlap"
  EXCLUDE USING gist (
    "staff_id" WITH =,
    tstzrange("starts_at", "blocked_until", '[)') WITH &&
  ) WHERE ("status" IN ('pending', 'confirmed', 'completed'));
