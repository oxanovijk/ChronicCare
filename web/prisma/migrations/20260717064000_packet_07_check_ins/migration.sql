-- CreateEnum
CREATE TYPE "check_in_mood" AS ENUM ('GOOD', 'OKAY', 'UNWELL');

-- CreateTable
CREATE TABLE "check_ins" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "submitted_by_user_id" UUID,
    "submitted_by_patient" BOOLEAN NOT NULL DEFAULT false,
    "mood" "check_in_mood" NOT NULL,
    "condition_text" TEXT,
    "pain_level" SMALLINT,
    "medication_taken" BOOLEAN,
    "complaint_text" TEXT,
    "needs_family_help" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "check_ins_pain_level_check" CHECK ("pain_level" IS NULL OR "pain_level" BETWEEN 0 AND 10),
    CONSTRAINT "check_ins_submitter_check" CHECK (
      ("submitted_by_patient" = true AND "submitted_by_user_id" IS NULL)
      OR ("submitted_by_patient" = false AND "submitted_by_user_id" IS NOT NULL)
    )
);

-- CreateIndex
CREATE INDEX "check_ins_patient_profile_id_created_at_idx" ON "check_ins"("patient_profile_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_submitted_by_user_id_fkey" FOREIGN KEY ("submitted_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
