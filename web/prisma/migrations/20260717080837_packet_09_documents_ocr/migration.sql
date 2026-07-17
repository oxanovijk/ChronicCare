-- CreateEnum
CREATE TYPE "document_category" AS ENUM ('BPJS_CARD', 'REFERRAL_LETTER', 'PRESCRIPTION', 'LAB_RESULT', 'MEDICAL_RESUME', 'CONTROL_CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "document_status" AS ENUM ('UPLOADING', 'UPLOADED', 'PROCESSING', 'REVIEW_REQUIRED', 'CONFIRMED', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "extraction_status" AS ENUM ('PENDING_REVIEW', 'CONFIRMED', 'REJECTED', 'FAILED');

-- CreateTable
CREATE TABLE "health_documents" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "category" "document_category" NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "bucket_name" VARCHAR(80) NOT NULL DEFAULT 'health-documents',
    "storage_path" TEXT NOT NULL,
    "original_file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(80) NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "page_count" SMALLINT,
    "sha256" CHAR(64) NOT NULL,
    "status" "document_status" NOT NULL,
    "uploaded_by_user_id" UUID NOT NULL,
    "confirmed_extraction_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "health_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_extractions" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "health_document_id" UUID NOT NULL,
    "ocr_provider" VARCHAR(80) NOT NULL,
    "ocr_model" VARCHAR(80) NOT NULL,
    "extractor_provider" VARCHAR(80) NOT NULL,
    "extractor_model" VARCHAR(120) NOT NULL,
    "schema_version" VARCHAR(24) NOT NULL DEFAULT 'document-extraction.v1',
    "raw_text" TEXT NOT NULL,
    "structured_data" JSONB NOT NULL,
    "confidence" DECIMAL(5,4),
    "status" "extraction_status" NOT NULL,
    "failure_code" VARCHAR(80),
    "reviewed_by_user_id" UUID,
    "reviewed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "document_extractions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "health_documents_storage_path_key" ON "health_documents"("storage_path");

-- CreateIndex
CREATE UNIQUE INDEX "health_documents_confirmed_extraction_id_key" ON "health_documents"("confirmed_extraction_id");

-- CreateIndex
CREATE INDEX "health_documents_patient_profile_id_status_idx" ON "health_documents"("patient_profile_id", "status");

-- CreateIndex
CREATE INDEX "document_extractions_health_document_id_created_at_idx" ON "document_extractions"("health_document_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "document_extractions_patient_profile_id_status_idx" ON "document_extractions"("patient_profile_id", "status");

-- AddForeignKey
ALTER TABLE "health_documents" ADD CONSTRAINT "health_documents_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_documents" ADD CONSTRAINT "health_documents_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_documents" ADD CONSTRAINT "health_documents_confirmed_extraction_id_fkey" FOREIGN KEY ("confirmed_extraction_id") REFERENCES "document_extractions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_extractions" ADD CONSTRAINT "document_extractions_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_extractions" ADD CONSTRAINT "document_extractions_health_document_id_fkey" FOREIGN KEY ("health_document_id") REFERENCES "health_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_extractions" ADD CONSTRAINT "document_extractions_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Data-model checks (docs/technical/data-model.md §6.1, §6.2)
ALTER TABLE "health_documents" ADD CONSTRAINT "health_documents_file_size_check" CHECK ("file_size_bytes" BETWEEN 1 AND 5242880);
ALTER TABLE "health_documents" ADD CONSTRAINT "health_documents_page_count_check" CHECK ("page_count" IS NULL OR "page_count" BETWEEN 1 AND 3);
ALTER TABLE "health_documents" ADD CONSTRAINT "health_documents_mime_type_check" CHECK ("mime_type" IN ('application/pdf', 'image/jpeg', 'image/png'));
ALTER TABLE "health_documents" ADD CONSTRAINT "health_documents_bucket_name_check" CHECK ("bucket_name" = 'health-documents');
ALTER TABLE "document_extractions" ADD CONSTRAINT "document_extractions_confidence_check" CHECK ("confidence" IS NULL OR ("confidence" >= 0 AND "confidence" <= 1));
ALTER TABLE "document_extractions" ADD CONSTRAINT "document_extractions_ocr_provider_check" CHECK ("ocr_provider" IN ('AZURE_DOCUMENT_INTELLIGENCE', 'DEMO_FALLBACK'));
ALTER TABLE "document_extractions" ADD CONSTRAINT "document_extractions_extractor_provider_check" CHECK ("extractor_provider" IN ('AZURE_OPENAI', 'DEMO_FALLBACK'));
ALTER TABLE "document_extractions" ADD CONSTRAINT "document_extractions_schema_version_check" CHECK ("schema_version" = 'document-extraction.v1');
