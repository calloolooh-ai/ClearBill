# Feature Batch 2 Checklist

Second round of features/changes, scoped from brainstorming against hackathon judging weights
(Presentation 50% / Originality 25% / Practicality 25%). Pure logic gets unit tests; UI-only
wiring is implemented without a dedicated test, consistent with the rest of the repo.

- [x] Ask-a-follow-up chat on a charge (`/api/ask`, `askAboutCharge`, UI on charge card)
- [x] Bill Health Score (pure function + dashboard stat)
- [x] "Explain like I'm 5" tone toggle (prompt variant + dashboard toggle)
- [x] Print/export dashboard as PDF (print stylesheet + button)
- [x] Content-hash caching for Groq calls (skip re-calling API on identical bill content)
- [x] "My Bills" management page (`/bills`, refactored testable storage module)
- [x] Next-month spend estimate (pure function + compare page)
- [x] Duplicate-upload guard (pure function + upload flow wiring)
- [x] Toast notifications (sonner, replacing inline error text)
- [x] CSV export of charges (pure function + dashboard button)

## Verification

- [x] `npm test` — all tests passing (99/99)
- [x] `npm run lint` — no errors
- [x] `npm run build` — production build passes
- [x] Smoke-tested `/`, `/bills`, `/compare`, `/api/ask` (valid + invalid charge id) live against dev server
