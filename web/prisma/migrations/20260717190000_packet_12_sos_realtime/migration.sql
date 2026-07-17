CREATE TYPE "sos_status" AS ENUM ('NEW', 'HANDLED', 'CANCELLED');

CREATE TABLE "sos_events" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "created_by_patient" BOOLEAN NOT NULL DEFAULT true,
    "created_by_user_id" UUID,
    "status" "sos_status" NOT NULL DEFAULT 'NEW',
    "message" VARCHAR(500),
    "location_label" VARCHAR(160),
    "contact_phone" VARCHAR(32),
    "handled_by_user_id" UUID,
    "handled_at" TIMESTAMPTZ(6),
    "cancelled_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sos_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sos_events_creator_check" CHECK (
      ("created_by_patient" AND "created_by_user_id" IS NULL)
      OR (NOT "created_by_patient" AND "created_by_user_id" IS NOT NULL)
    ),
    CONSTRAINT "sos_events_state_check" CHECK (
      ("status" = 'NEW' AND "handled_by_user_id" IS NULL AND "handled_at" IS NULL AND "cancelled_at" IS NULL)
      OR ("status" = 'HANDLED' AND "handled_by_user_id" IS NOT NULL AND "handled_at" IS NOT NULL AND "cancelled_at" IS NULL)
      OR ("status" = 'CANCELLED' AND "handled_by_user_id" IS NULL AND "handled_at" IS NULL AND "cancelled_at" IS NOT NULL)
    )
);

CREATE INDEX "sos_events_patient_profile_id_status_created_at_idx" ON "sos_events"("patient_profile_id", "status", "created_at" DESC);
CREATE INDEX "sos_events_status_created_at_idx" ON "sos_events"("status", "created_at" DESC);

ALTER TABLE "sos_events" ADD CONSTRAINT "sos_events_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sos_events" ADD CONSTRAINT "sos_events_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sos_events" ADD CONSTRAINT "sos_events_handled_by_user_id_fkey" FOREIGN KEY ("handled_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "sos_events" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "sos_events" FROM anon, authenticated;
GRANT SELECT ON TABLE "sos_events" TO authenticated;

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.can_receive_sos(target_patient_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (SELECT auth.uid()) IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.patient_profiles profile
      JOIN public.care_circle_members member
        ON member.care_circle_id = profile.care_circle_id
      JOIN public.care_circles circle
        ON circle.id = profile.care_circle_id
      WHERE profile.id = target_patient_profile_id
        AND profile.status = 'ACTIVE'::public.patient_status
        AND profile.deleted_at IS NULL
        AND circle.is_active
        AND member.user_id = (SELECT auth.uid())
        AND member.status = 'ACTIVE'::public.member_status
    );
$$;

REVOKE ALL ON FUNCTION private.can_receive_sos(uuid) FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_receive_sos(uuid) TO authenticated;

CREATE POLICY "Caregivers receive SOS for their Care Circle"
ON "sos_events"
FOR SELECT
TO authenticated
USING ((SELECT private.can_receive_sos("patient_profile_id")));

ALTER PUBLICATION supabase_realtime ADD TABLE "sos_events";
