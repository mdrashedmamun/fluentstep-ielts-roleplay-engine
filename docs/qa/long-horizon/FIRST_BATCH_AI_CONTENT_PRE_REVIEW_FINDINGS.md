# First Batch AI Content Pre-Review Findings

Updated: 2026-06-03

Claim boundary: this is AI Content/Pedagogy pre-review evidence and local fix tracking. It does not mark any scenario human-approved, visually approved, production-ready, buyer-ready, deploy-safe, medically/legal-safe, or commercially validated.

## Scope

Seven representative/post-fix scenarios from `HUMAN_CONTENT_REVIEW_BATCH_BRIEF.md`:

- `social-1-flatmate`
- `service-1-cafe`
- `service_1_restaurant_order`
- `workplace-1-disagreement`
- `academic-1-tutorial-discussion`
- `healthcare-1-gp-appointment`
- `community-1-council-meeting`

## KPI Scores After Local Fixes

| KPI | Status | Evidence |
| --- | --- | --- |
| Content review coverage | Pass | 7/7 scenarios AI pre-reviewed by Content/Pedagogy lane. |
| Category coverage | Pass | Social, Service/Logistics, Workplace, Academic, Healthcare, Community represented. |
| Blank/chunk alignment | Pass locally | `academic-1-tutorial-discussion` run-by mismatch fixed in `src/services/staticData.ts`; `validate:critical` exit 0. |
| UK English High/Blocker issues | Pass from AI scan | No High/Blocker UK-English issue found in first batch. |
| Alternatives in target scope | Pass locally | `service-1-cafe` and `healthcare-1-gp-appointment` empty alternatives fixed; `validate:alternatives` exit 0 with 0 issues. |
| Feedback usefulness | Partial | Good transfer value in most rows; human reviewer still needed for pedagogy judgement and community difficulty. |
| Healthcare safety | Blocked | `PROD-003` still required before healthcare approval. |
| Fix readiness | Pass | All AI issues have location, evidence, fix, and validation method. |
| Human content approval | Not claimed | `qa-check -- --strict` still reports 0 approved, 53 needs human review. |

## Findings Register

| ID | Severity | Location | Evidence | Fix / Status | Validation |
| --- | --- | --- | --- | --- | --- |
| FS-CONTENT-AI-001 | Medium | `service-1-cafe` answer index 9 | `cash` previously had empty alternatives. | Fixed locally: added `in cash`, `cash payment`. | `npm run validate:alternatives` exit 0. |
| FS-CONTENT-AI-002 | High | `academic-1-tutorial-discussion` blank 12 | Dialogue previously produced `run you my draft` while feedback taught `run by`. | Fixed locally: blank now teaches `run my draft by you` with valid alternatives `send you my draft`, `share my draft with you`, `pass my draft to you`; deep dive phrase aligned. | `npm run validate:critical` exit 0; `npm run qa-check -- --strict` exit 0. |
| FS-CONTENT-AI-003 | Medium | `academic-1-tutorial-discussion` context/register | Original `Oxford/Cambridge` framing risk was identified. | Fixed locally by generalising to a UK university tutorial context; named human approval still required. | Named human content review. |
| FS-CONTENT-AI-004 | Blocker | `healthcare-1-gp-appointment` approval gate | Healthcare scenario requires `PROD-003` learning-only disclaimer/legal-positioning decision. | Blocked on founder/product decision. | `FOUNDER_PRODUCT_DECISION_FORM.md` completed by founder/date/note, then human review. |
| FS-CONTENT-AI-005 | High | `healthcare-1-gp-appointment` answer indexes 2 and 17 | `Have` and `rule` previously had empty alternatives. | Fixed locally: sentence shapes now teach `Have you` and `rule out`; alternatives fit exact sentence context. | `npm run validate:alternatives` exit 0; `npm run validate:critical` exit 0. |
| FS-CONTENT-AI-006 | Medium | `community-1-council-meeting` length/difficulty | Scenario has 34 blanks and dense formal civic speech. | Open human/product judgement: keep as advanced, reduce blank count, or split into two passes. | Named human content review plus focused browser check if edited. |

## Commands Run

- `npm run validate:critical`: exit 0; 53 scenarios; 0 critical errors; 14 inherited `social-7-house-rules` chunk ID warnings.
- `npm run validate:alternatives`: exit 0; 53 scenarios; 715 blanks; 2179 alternatives including main answers; 0 issues.
- `npm run qa-check -- --strict`: exit 0; 53/53 passed; final approval still 0 approved / 53 needs human review / 0 blocked; inherited chunk reuse recommendation for `really` / `extremely`.

## Next Gate

- Named human reviewer reviews the first-batch scenarios using this file plus `HUMAN_CONTENT_REVIEW_BATCH_BRIEF.md`.
- Founder resolves `PROD-003` before healthcare approval.
- Founder/human decides whether Academic framing and Community difficulty need changes.
