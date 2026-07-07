# Post-Review Improvements Checklist

Scoped from the hackathon-judging review (Presentation 50% / Originality 25% / Practicality 25%).
Each item below gets implemented + covered by a test where the behavior is testable logic
(pure functions, API resilience). Presentation-only visual polish is implemented but not
unit-tested, consistent with how other pure-UI components in this repo are handled.

## Sample bill (demo reliability + presentation)

- [x] `src/lib/sampleBill.ts` — hardcoded, fully-populated `BillBundle` (document + explanations +
      suggestions + fee alerts) that passes `validateBillDocument` with zero API calls
- [x] Test: sample bundle document validates against `BillDocumentSchema`, has >0 charges, and its
      fee alerts / explanations reference only charge ids that exist in the document
- [x] "Try a sample bill" button on landing page — loads the bundle into the store and navigates
      straight to `/dashboard`, no upload/parse/explain round trip

## Groq API resilience (practicality — live-demo risk)

- [x] `explainCharges` catches thrown errors (network failure, timeout, rate limit) from the Groq
      call and returns the same "Unable to verify." fallback shape used for malformed output,
      instead of throwing and breaking the upload flow
- [x] Test: Groq client mock rejects → `explainCharges` resolves with one fallback explanation per
      charge and does not throw

## Presentation polish

- [x] Landing page feature-highlight strip (AI-explained charges / Fee alerts / Compare bills)
- [x] Privacy note ("Your bill data stays in your browser — only structured, anonymized JSON is
      sent for explanation, nothing is stored on a server") on the landing page

## Verification

- [x] `npm test` — all tests passing (54/54)
- [x] `npm run lint` — no errors
- [x] `npm run build` — production build passes
