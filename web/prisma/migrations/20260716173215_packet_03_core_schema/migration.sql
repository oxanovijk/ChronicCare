-- CreateEnum
CREATE TYPE "member_role" AS ENUM ('OWNER', 'FAMILY_MEMBER');

-- CreateEnum
CREATE TYPE "member_status" AS ENUM ('INVITED', 'ACTIVE', 'REMOVED');

-- CreateEnum
CREATE TYPE "patient_status" AS ENUM ('ACTIVE', 'INACTIVE', 'END_OF_CARE', 'DECEASED');

-- CreateEnum
CREATE TYPE "patient_deactivation_reason" AS ENUM ('NO_LONGER_CARED', 'PATIENT_DECEASED', 'OTHER');

-- CreateEnum
CREATE TYPE "profile_fact_status" AS ENUM ('UNKNOWN', 'NONE_REPORTED', 'REPORTED');

-- CreateEnum
CREATE TYPE "bpjs_membership_status" AS ENUM ('UNKNOWN', 'NOT_REGISTERED', 'REGISTERED');

-- CreateEnum
CREATE TYPE "access_code_status" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "actor_type" AS ENUM ('CAREGIVER', 'PATIENT', 'SYSTEM');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "display_name" VARCHAR(120) NOT NULL,
    "phone_number" VARCHAR(32),
    "avatar_path" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_circles" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "care_circles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_circle_members" (
    "id" UUID NOT NULL,
    "care_circle_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "member_role" NOT NULL,
    "status" "member_status" NOT NULL,
    "invited_by_user_id" UUID,
    "joined_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "care_circle_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_circle_invitations" (
    "id" UUID NOT NULL,
    "care_circle_id" UUID NOT NULL,
    "code_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "accepted_by_user_id" UUID,
    "accepted_at" TIMESTAMPTZ(6),
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "care_circle_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_profiles" (
    "id" UUID NOT NULL,
    "care_circle_id" UUID NOT NULL,
    "display_name" VARCHAR(120) NOT NULL,
    "relationship_label" VARCHAR(32) NOT NULL,
    "date_of_birth" DATE,
    "city" VARCHAR(80),
    "location_label" VARCHAR(160),
    "primary_conditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "primary_conditions_status" "profile_fact_status" NOT NULL DEFAULT 'UNKNOWN',
    "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allergies_status" "profile_fact_status" NOT NULL DEFAULT 'UNKNOWN',
    "current_medications_status" "profile_fact_status" NOT NULL DEFAULT 'UNKNOWN',
    "bpjs_number_last4" VARCHAR(4),
    "bpjs_membership_status" "bpjs_membership_status" NOT NULL DEFAULT 'UNKNOWN',
    "usual_facility_name" VARCHAR(160),
    "emergency_contact_name" VARCHAR(120),
    "emergency_contact_phone" VARCHAR(32),
    "emergency_contact_status" "profile_fact_status" NOT NULL DEFAULT 'UNKNOWN',
    "status" "patient_status" NOT NULL DEFAULT 'ACTIVE',
    "deactivation_reason" "patient_deactivation_reason",
    "deactivation_note" VARCHAR(500),
    "deactivated_by_user_id" UUID,
    "deactivated_at" TIMESTAMPTZ(6),
    "created_by_user_id" UUID NOT NULL,
    "updated_by_user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "patient_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_access_codes" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "code_hash" VARCHAR(255) NOT NULL,
    "status" "access_code_status" NOT NULL DEFAULT 'ACTIVE',
    "failed_attempt_count" SMALLINT NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMPTZ(6),
    "last_used_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6),
    "created_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "patient_access_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_sessions" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "last_seen_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" UUID NOT NULL,
    "care_circle_id" UUID NOT NULL,
    "patient_profile_id" UUID,
    "actor_type" "actor_type" NOT NULL,
    "actor_user_id" UUID,
    "actor_patient_profile_id" UUID,
    "actor_role" VARCHAR(32),
    "action" VARCHAR(80) NOT NULL,
    "target_type" VARCHAR(80) NOT NULL,
    "target_id" UUID,
    "summary" VARCHAR(500) NOT NULL,
    "request_id" VARCHAR(80),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "care_circle_members_user_id_status_idx" ON "care_circle_members"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "care_circle_members_care_circle_id_user_id_key" ON "care_circle_members"("care_circle_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "care_circle_invitations_code_hash_key" ON "care_circle_invitations"("code_hash");

-- CreateIndex
CREATE INDEX "patient_profiles_care_circle_id_status_idx" ON "patient_profiles"("care_circle_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "patient_access_codes_code_hash_key" ON "patient_access_codes"("code_hash");

-- CreateIndex
CREATE UNIQUE INDEX "patient_sessions_token_hash_key" ON "patient_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "audit_events_care_circle_id_created_at_idx" ON "audit_events"("care_circle_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_events_patient_profile_id_created_at_idx" ON "audit_events"("patient_profile_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "care_circles" ADD CONSTRAINT "care_circles_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_circle_members" ADD CONSTRAINT "care_circle_members_care_circle_id_fkey" FOREIGN KEY ("care_circle_id") REFERENCES "care_circles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_circle_members" ADD CONSTRAINT "care_circle_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_circle_members" ADD CONSTRAINT "care_circle_members_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_circle_invitations" ADD CONSTRAINT "care_circle_invitations_care_circle_id_fkey" FOREIGN KEY ("care_circle_id") REFERENCES "care_circles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_circle_invitations" ADD CONSTRAINT "care_circle_invitations_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_circle_invitations" ADD CONSTRAINT "care_circle_invitations_accepted_by_user_id_fkey" FOREIGN KEY ("accepted_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_care_circle_id_fkey" FOREIGN KEY ("care_circle_id") REFERENCES "care_circles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_deactivated_by_user_id_fkey" FOREIGN KEY ("deactivated_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_access_codes" ADD CONSTRAINT "patient_access_codes_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_access_codes" ADD CONSTRAINT "patient_access_codes_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_sessions" ADD CONSTRAINT "patient_sessions_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_care_circle_id_fkey" FOREIGN KEY ("care_circle_id") REFERENCES "care_circles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_patient_profile_id_fkey" FOREIGN KEY ("actor_patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Supabase Auth owns caregiver identity. Triggers preserve the locked FK behavior
-- without asking Prisma to manage Supabase's internal auth schema.
CREATE FUNCTION "ensure_public_user_has_auth_identity"() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "auth"."users" WHERE "id" = NEW."id") THEN
    RAISE EXCEPTION 'AUTH_USER_REQUIRED' USING ERRCODE = '23503';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER "users_auth_identity_trigger"
  BEFORE INSERT OR UPDATE OF "id" ON "users"
  FOR EACH ROW EXECUTE FUNCTION "ensure_public_user_has_auth_identity"();

CREATE FUNCTION "restrict_referenced_auth_user_delete"() RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM "public"."users" WHERE "id" = OLD."id") THEN
    RAISE EXCEPTION 'AUTH_USER_REFERENCED' USING ERRCODE = '23503';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER "auth_users_public_user_restrict_trigger"
  BEFORE DELETE ON "auth"."users"
  FOR EACH ROW EXECUTE FUNCTION "restrict_referenced_auth_user_delete"();

-- Prisma list fields are required by the locked profile-fact contract.
ALTER TABLE "patient_profiles" ALTER COLUMN "primary_conditions" SET NOT NULL;
ALTER TABLE "patient_profiles" ALTER COLUMN "allergies" SET NOT NULL;

-- Same-row progressive fact checks.
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_primary_conditions_state_check" CHECK (
  ("primary_conditions_status" = 'REPORTED' AND cardinality("primary_conditions") > 0)
  OR ("primary_conditions_status" <> 'REPORTED' AND cardinality("primary_conditions") = 0)
);
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_allergies_state_check" CHECK (
  ("allergies_status" = 'REPORTED' AND cardinality("allergies") > 0)
  OR ("allergies_status" <> 'REPORTED' AND cardinality("allergies") = 0)
);
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_emergency_contact_state_check" CHECK (
  ("emergency_contact_status" = 'REPORTED' AND ("emergency_contact_name" IS NOT NULL OR "emergency_contact_phone" IS NOT NULL))
  OR ("emergency_contact_status" <> 'REPORTED' AND "emergency_contact_name" IS NULL AND "emergency_contact_phone" IS NULL)
);
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_bpjs_state_check" CHECK (
  "bpjs_membership_status" = 'REGISTERED' OR "bpjs_number_last4" IS NULL
);
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_bpjs_last4_check" CHECK (
  "bpjs_number_last4" IS NULL OR "bpjs_number_last4" ~ '^[0-9]{4}$'
);
ALTER TABLE "patient_access_codes" ADD CONSTRAINT "patient_access_codes_failed_attempt_count_check" CHECK (
  "failed_attempt_count" >= 0
);
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_check" CHECK (
  ("actor_type" = 'CAREGIVER' AND "actor_user_id" IS NOT NULL AND "actor_patient_profile_id" IS NULL)
  OR ("actor_type" = 'PATIENT' AND "actor_user_id" IS NULL AND "actor_patient_profile_id" IS NOT NULL)
  OR ("actor_type" = 'SYSTEM' AND "actor_user_id" IS NULL AND "actor_patient_profile_id" IS NULL)
);

-- MVP cardinality and active-record constraints.
CREATE UNIQUE INDEX "care_circle_members_one_active_owner_idx"
  ON "care_circle_members" ("care_circle_id")
  WHERE "role" = 'OWNER' AND "status" = 'ACTIVE';
CREATE UNIQUE INDEX "patient_profiles_active_relationship_label_idx"
  ON "patient_profiles" ("care_circle_id", "relationship_label")
  WHERE "deleted_at" IS NULL;
CREATE UNIQUE INDEX "patient_access_codes_one_active_per_profile_idx"
  ON "patient_access_codes" ("patient_profile_id")
  WHERE "status" = 'ACTIVE';

CREATE FUNCTION "enforce_patient_profile_limit"() RETURNS trigger AS $$
BEGIN
  IF NEW."deleted_at" IS NULL THEN
    PERFORM 1 FROM "care_circles" WHERE "id" = NEW."care_circle_id" FOR UPDATE;
    IF (
      SELECT count(*) FROM "patient_profiles"
      WHERE "care_circle_id" = NEW."care_circle_id"
        AND "deleted_at" IS NULL
        AND "id" <> NEW."id"
    ) >= 2 THEN
      RAISE EXCEPTION 'PATIENT_PROFILE_LIMIT_REACHED' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "patient_profiles_limit_trigger"
  BEFORE INSERT OR UPDATE OF "care_circle_id", "deleted_at" ON "patient_profiles"
  FOR EACH ROW EXECUTE FUNCTION "enforce_patient_profile_limit"();
