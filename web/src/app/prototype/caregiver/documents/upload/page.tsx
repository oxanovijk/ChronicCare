import { CaregiverShell } from "@/components/caregiver-shell";
import { DocumentUploadForm } from "@/components/document-upload-form";

export default function DocumentUploadPage() { return <CaregiverShell active="documents"><header className="caregiver-page-heading"><span className="section-kicker"><span aria-hidden="true" /> Screen 05</span><h1>Upload dokumen kesehatan.</h1><p>Siapkan satu dokumen sintetis untuk alur OCR dan review caregiver.</p></header><DocumentUploadForm /></CaregiverShell>; }

