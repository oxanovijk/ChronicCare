# ChroniCare Web

Next.js App Router scaffold untuk ChroniCare, platform koordinasi perawatan chronic illness. Packet 01 hanya menyediakan shell route dan tooling baseline; auth, database, OCR, chatbot, SOS, dan integrasi provider belum live.

## Requirements

- Node.js 24.x
- npm
- Tidak memerlukan `.env` untuk Packet 01

## Local Development

```powershell
npm install
npx playwright install chromium
npm run dev
```

Buka `http://localhost:3000`. Shell route yang tersedia:

- `/`
- `/caregiver`
- `/patient/login`

Form Patient login sengaja disabled dan diberi label `belum aktif` sampai packet akses Patient selesai.

## Verification

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

E2E memakai port `3100` dan cache `.next-e2e` sendiri agar tidak memakai ulang dev server yang mungkin sedang berjalan di port `3000`.

Script database tersedia sebagai baseline, tetapi jangan jalankan migration, seed, atau studio sebelum database Packet 03 tersedia.
