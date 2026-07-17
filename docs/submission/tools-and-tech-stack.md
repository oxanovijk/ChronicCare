# Development Tools and Technology Stack

Status: Submission draft

## Submission-Ready List

### Application

- Node.js 24 LTS and npm
- Next.js 16 App Router
- React 19 and TypeScript 5
- Tailwind CSS 4
- shadcn/ui and Base UI components
- Zod 4 for runtime validation

### Data, Identity, and Infrastructure

- Supabase PostgreSQL
- Supabase Auth with server-rendered session handling
- Supabase private Storage for the target document workflow
- Supabase Realtime for the target open-dashboard SOS workflow
- Prisma ORM 7 and PostgreSQL adapter
- Vercel as the target deployment platform, with `/web` as the project root

### AI and Document Processing

- Azure OpenAI through the official OpenAI JavaScript package
- Azure AI Document Intelligence through the Azure Form Recognizer JavaScript package
- Human review and confirmation before extracted document data can enter AI context

### Quality Assurance

- Vitest for unit and integration tests
- Testing Library and jest-dom for component behavior
- Playwright with Chromium for end-to-end and responsive journey checks
- ESLint for static analysis
- TypeScript compiler checks
- Next.js production builds

### Design and Collaboration

- Figma: `[CONFIRM USE AND INSERT PUBLIC VIEW-ONLY PROJECT LINK, OR REMOVE]`
- Git and GitHub: `[INSERT PUBLIC REPOSITORY URL]`
- OpenAI Codex for AI-assisted planning, implementation support, test support, review, and submission-document drafting

## Final Accuracy Gate

The final form and video must mention only tools actually used. Delete optional entries instead of leaving brackets or claiming an unused platform. Product features that depend on Azure, private Storage, Realtime, or Vercel must be described as implemented only after the corresponding packet and final readiness checks pass.
