# ClearBill

Upload any bill — ClearBill extracts every charge, structures it, and explains each one in plain English using AI. Built for [Lumora Hacks Summer 2026](https://lumora-hacks-2026.devpost.com/) (see [HACKATHON.md](./HACKATHON.md)).

## What it does

1. Upload a bill (PDF, PNG, or JPG)
2. Extracts text (PDF parsing or OCR)
3. Normalizes it into structured JSON — provider, billing period, due date, total, taxes, individual charges
4. Validates the structure
5. Sends only that structured JSON to Groq, which explains each charge in plain English, flags whether it's optional, and gives a confidence score — never inventing charges, and saying "Unable to verify." when unsure
6. Shows a dashboard: totals, largest charge, fee/recurring counts, spending breakdown, fee alerts (late/admin/duplicate/unexpected-increase), and AI-generated questions/savings/observations
7. Compare multiple bills over time: totals, category changes, biggest increases

## Tech stack

Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion · Recharts · Groq API

## Architecture

```
src/
  parser/      PDF/OCR text extraction + heuristic normalization + validation (no AI)
  ai/          Groq calls — only ever receives/returns structured JSON (no parsing, no math)
  utils/       pure logic: fee detection, bill math, comparison, formatting (no AI)
  charts/      Recharts wrappers
  components/  UI (upload, dashboard, shared)
  types/       shared TypeScript interfaces
  hooks/       client-side upload flow + localStorage-backed bill store
  app/         routes + API endpoints (/api/parse, /api/explain, /api/compare)
```

AI logic and parsing logic are strictly separated: the parser never calls Groq, and Groq never sees raw text or performs OCR/math.

## Getting started

```bash
npm install
cp .env.example .env.local   # add your GROQ_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

```bash
npm test     # vitest unit tests (parser, utils, ai fallback logic)
npm run lint
npm run build
```

See [CHECKLIST.md](./CHECKLIST.md) for the full feature/test checklist.
