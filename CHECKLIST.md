# ClearBill Build Checklist

## Architecture

- [x] `components/`, `lib/`, `parser/`, `ai/`, `charts/`, `types/`, `utils/`, `hooks/` separated
- [x] AI logic (`ai/`) never touches raw text, OCR, or math — only structured `BillDocument` JSON in, structured explanations out
- [x] Parser (`parser/`) never calls Groq — extraction and normalization only
- [x] Fee detection, totals, and comparison math are pure functions in `utils/` (no AI involved)

## Upload

- [x] Drag-and-drop upload area (react-dropzone + framer-motion)
- [x] Accepts PDF, PNG, JPG
- [x] 15MB size limit enforced client + server side
- [x] Rejects unsupported file types with a clear error

## Extraction

- [x] PDF text extraction (`pdf-parse`)
- [x] Image OCR (`tesseract.js`)
- [x] Heuristic extraction of provider, billing period, due date, total, subtotal, taxes
- [x] Line-item charge extraction with category + recurring detection
- [x] Zod validation of the normalized `BillDocument` before it's used anywhere else
- [x] Extraction warnings surfaced to the user when a field can't be found (never silently guessed)

## AI Explanation

- [x] One explanation per input charge, matched by ID — never fewer, never invented extras
- [x] "Unable to verify." fallback when the model can't explain a charge or omits it
- [x] `isOptional` and `confidence` per charge
- [x] Suggestions (questions / savings / observations) generated from structured data only

## Dashboard

- [x] Total bill, largest charge, fee count, recurring count stat cards
- [x] Per-charge cards with explanation, category, optional/recurring badges, confidence bar
- [x] Spending breakdown pie chart
- [x] Extraction warnings shown when present

## Fee Alerts

- [x] Late fee detection
- [x] Administrative/service fee detection
- [x] Duplicate-looking charge detection
- [x] Unexpected increase detection (requires a prior bill for comparison)

## Bill Comparison

- [x] Upload/select multiple bills
- [x] Total, category totals, month-over-month change
- [x] Biggest category increases
- [x] Bill history line chart
- [x] Category comparison bar chart

## Design

- [x] Apple-inspired rounded cards, large typography
- [x] Framer Motion entrance/hover animations
- [x] Dark mode (next-themes, system-aware)
- [x] Responsive layout (mobile → desktop grid)

## Testing

- [x] `utils/date.test.ts` — flexible date parsing
- [x] `utils/formatCurrency.test.ts` — currency/percent formatting
- [x] `utils/billMath.test.ts` — totals, largest charge, fee/recurring counts, category totals
- [x] `utils/feeDetection.test.ts` — late/admin/duplicate/increase detection, and that it doesn't over-fire on clean bills
- [x] `utils/compareBills.test.ts` — month-over-month + category change math
- [x] `parser/textNormalizer.test.ts` — provider/date/total/charge extraction from raw text, and that it never fabricates charges from empty text
- [x] `parser/validator.test.ts` — schema accepts valid documents, rejects invalid ones
- [x] `ai/explainCharges.test.ts` (Groq client mocked) — one explanation per charge, fallback on omission, ignores hallucinated charge IDs, graceful fallback on malformed model output
- [x] `npm run build` — production build passes
- [x] `npm run lint` — no lint errors
- [x] `npm test` — 47/47 tests passing

## Repo / Deploy (pending user go-ahead)

- [ ] Local git repo initialized, identity set to the user's GitHub account only
- [ ] GitHub repo `ClearBill` created
- [ ] User tests on localhost and approves
- [ ] Push to GitHub
- [ ] Vercel project linked to the GitHub repo (auto-deploy on push)
- [ ] `GROQ_API_KEY` set as a Vercel environment variable
