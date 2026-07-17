CREATE TYPE "medication_status" AS ENUM ('ACTIVE', 'PAUSED', 'ENDED');
CREATE TYPE "medication_log_status" AS ENUM ('TAKEN', 'MISSED', 'SKIPPED');
CREATE TYPE "reminder_type" AS ENUM ('MEDICATION', 'CHECK_IN', 'DOCTOR_VISIT', 'BPJS', 'OTHER');
CREATE TYPE "reminder_status" AS ENUM ('UPCOMING', 'DONE', 'MISSED', 'SKIPPED');

CREATE TABLE "medications" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "dose_text" VARCHAR(160) NOT NULL,
    "schedule_text" VARCHAR(240) NOT NULL,
    "instructions" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "status" "medication_status" NOT NULL DEFAULT 'ACTIVE',
    "created_by_user_id" UUID NOT NULL,
    "updated_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "medication_logs" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "medication_id" UUID NOT NULL,
    "status" "medication_log_status" NOT NULL,
    "scheduled_for" TIMESTAMPTZ(6),
    "recorded_by_user_id" UUID,
    "recorded_by_patient" BOOLEAN NOT NULL DEFAULT false,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "medication_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reminders" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "type" "reminder_type" NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "scheduled_at" TIMESTAMPTZ(6),
    "schedule_text" VARCHAR(240),
    "status" "reminder_status" NOT NULL DEFAULT 'UPCOMING',
    "related_medication_id" UUID,
    "created_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "health_notes" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "note_text" TEXT NOT NULL,
    "category" VARCHAR(48) NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "updated_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "health_notes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "medications_patient_profile_id_status_idx" ON "medications"("patient_profile_id", "status");
CREATE INDEX "medication_logs_patient_profile_id_recorded_at_idx" ON "medication_logs"("patient_profile_id", "recorded_at" DESC);
CREATE INDEX "medication_logs_medication_id_recorded_at_idx" ON "medication_logs"("medication_id", "recorded_at" DESC);
CREATE INDEX "reminders_patient_profile_id_status_scheduled_at_idx" ON "reminders"("patient_profile_id", "status", "scheduled_at");
CREATE INDEX "health_notes_patient_profile_id_created_at_idx" ON "health_notes"("patient_profile_id", "created_at" DESC);

ALTER TABLE "medications" ADD CONSTRAINT "medications_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "medications" ADD CONSTRAINT "medications_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "medications" ADD CONSTRAINT "medications_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "medication_logs" ADD CONSTRAINT "medication_logs_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "medication_logs" ADD CONSTRAINT "medication_logs_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "medication_logs" ADD CONSTRAINT "medication_logs_recorded_by_user_id_fkey" FOREIGN KEY ("recorded_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_related_medication_id_fkey" FOREIGN KEY ("related_medication_id") REFERENCES "medications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "health_notes" ADD CONSTRAINT "health_notes_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "health_notes" ADD CONSTRAINT "health_notes_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "health_notes" ADD CONSTRAINT "health_notes_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
