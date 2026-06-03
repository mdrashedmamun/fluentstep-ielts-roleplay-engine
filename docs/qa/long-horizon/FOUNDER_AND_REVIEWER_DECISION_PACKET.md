# Founder And Reviewer Decision Packet

Updated: 2026-06-03

Claim boundary: this packet lists decisions and reviews still requiring a named human/founder. It does not claim production readiness, buyer readiness, deploy safety, human content approval, or visual approval.

## Current Automated State

- Critical validation: passing locally.
- Alternatives validation: passing locally.
- Strict QA: passing locally; all 53 scenarios still need human review.
- Build: passing locally with no Vite chunk-size warning after scenario-data and vendor chunk split.
- Lint: fixed locally as a blocking command; `npm run lint` exits 0 across `src`, `cli`, and `scripts`. Latest parsed report is 0 errors / 108 warnings / 175 files; warning cleanup and `.eslintignore` migration remain optional engineering follow-ups.
- Browser QA: passing locally; latest run `2026-06-03T10:42:31Z`; 12 screenshots including Healthcare disclaimer evidence and blank-integrity regression evidence, 0 automated issues, 0 console errors, and 0 failed responses.
- Blank integrity: passing locally; `npm run validate:blank-integrity` audited 53 scenarios, 715 blanks, and 2179 substitutions with 0 issues.
- Visual layout lint: current run `2026-06-03T10:43:26Z` exits 0 through screenshot fallback because Chromium DOM lint cannot register the macOS MachPort under sandbox permissions. Treat as automated evidence, not visual approval.
- Tier 1 local E2E: previously passed locally; latest post-blank-integrity full rerun reached 70 passed / 1 stale-test failure, the test expectation was updated, and focused reruns are blocked before assertions by Chromium MachPort permissions. Rerun in a browser environment that can launch Chromium before treating Tier 1 as freshly green.
- Full E2E: harness is bounded and retry-aware; implicated direct batches now pass (`tier2_batch_02.py` 71 passed / 4 skipped, `tier2_batch_09.py` 73 passed / 2 skipped). A clean complete full-suite pass is not being treated as the next default gate because the suite is too resource-heavy locally; focused E2E evidence is the practical engineering handoff gate unless a full run is explicitly budgeted.

## Parallel Subagent QA Model

Operating model: `PARALLEL_SUBAGENT_QA_KPI_OPERATING_MODEL.md` defines specialist AI lanes, KPI targets, evidence schema, severity rules, and the boundary between `ai-reviewed` and `human-approved`. Use it before asking a human/founder to sign off remaining gates.

## Atlas Triage

Situation: automated local QA has reached useful signal for this pass; more long-suite automation is now lower-value than human/content/product review.

Known truth:
- Local validators, build, lint, browser QA, visual layout lint, Tier 1 E2E, and focused implicated E2E batches have passing evidence recorded in `PROGRESS_LOG.md` and `NEXT_QA_FINDINGS_AND_FIX_PLAN.md`.
- Content/Pedagogy AI pre-review is complete for all 53 scenarios; human content approval is still absent for all 53 scenarios.
- Manual visual approval is still absent for all 12 refreshed screenshots.
- Product defaults for PROD-001 and PROD-003 have been applied locally, but founder signoff remains open; PROD-002 remains kept-by-default pending visual review.

Do now:
1. Assign a named content reviewer to the seven-scenario batch below and update `HUMAN_CONTENT_REVIEW_LEDGER.md`.
2. Assign a named visual/design reviewer to inspect the 12 screenshots and update `VISUAL_SCREENSHOT_REVIEW_CHECKLIST.md`.
3. Record founder signoff for `PROD-001`, `PROD-002`, and `PROD-003` in this packet or the linked product decision artifact; local defaults are not founder signatures.

Do not do by default:
- Do not run full `npm run test:e2e` again without an explicit time/resource budget.
- Do not claim human approval, visual approval, production readiness, buyer readiness, deploy safety, legal approval, or commercial validation from automated checks.
- Do not start broad source-code or scenario-data changes until a reviewed issue has a narrow write set and focused verifier.

Next engineering gate: after any reviewer-requested fix, run the focused validator/browser/E2E command that covers that exact changed flow, then update `PROGRESS_LOG.md`.

## Human Content Review Gate

Artifact: `HUMAN_CONTENT_REVIEW_LEDGER.md`

Reviewer briefing: `HUMAN_CONTENT_REVIEW_BATCH_BRIEF.md` gives the seven-scenario review surface, scenario-specific prompts, and decision options.

Named reviewer must review and update these first seven scenarios:

| Order | Scenario ID | Why first | Required decision |
| --- | --- | --- | --- |
| 1 | `social-1-flatmate` | Post-fix Social sample | Approve or request changes after FS-QA-001 fix. |
| 2 | `service_1_restaurant_order` | Post-fix Service sample | Approve or request changes after FS-QA-002/003/004/007 fixes. |
| 3 | `community-1-council-meeting` | Post-fix Community sample | Approve or request changes after FS-QA-005 fix. |
| 4 | `service-1-cafe` | Tier 1 E2E Service sample | Approve or request changes. |
| 5 | `workplace-1-disagreement` | Tier 1 E2E Workplace sample | Approve or request changes. |
| 6 | `academic-1-tutorial-discussion` | Academic representative sample | Approve or request changes. |
| 7 | `healthcare-1-gp-appointment` | Healthcare representative sample | Decide disclaimer/legal positioning before approval. |

Completion rule: a scenario is not content-approved until `Human State`, `Reviewer`, and `Reviewed At` are filled and the reviewer has completed the checklist in `HUMAN_CONTENT_REVIEW_PLAN.md`.

## Visual Review Gate

Artifact: `VISUAL_SCREENSHOT_REVIEW_CHECKLIST.md`

A named visual/design reviewer must inspect all 12 screenshots and update each row. Automated `qa:browser` and `qa:visual-lint` are useful objective evidence, but they are not visual approval. The image-viewing route failed for Codex again even after copying PNGs to `/private/tmp`, so this still needs a working browser/image route or a human reviewer opening the screenshots directly.

## Founder/Product Decisions

Decision form: `FOUNDER_PRODUCT_DECISION_FORM.md` is the canonical place to record founder selections for `PROD-001`, `PROD-002`, and `PROD-003`.


| ID | Decision | Default Recommendation | Why it matters | Gate |
| --- | --- | --- | --- | --- |
| PROD-001 | Should `advanced-1-manager-escalation` stay Advanced or move to Service/Logistics? | Move or label as Service/Logistics escalation unless Advanced is intentionally defined as high-friction service negotiation. | Category affects learner expectations and scenario selection. | Human content review before approval. |
| PROD-002 | Should desktop home keep a large media-first hero? | Keep the fixed fallback for now; revisit only if manual visual review says it slows task entry. | Product primitive is fast roleplay practice, not media browsing. | Visual review before visual approval. |
| PROD-003 | Should Healthcare scenarios show a learning-only disclaimer? | Add a lightweight learning-only disclaimer before expanding healthcare content. | Healthcare content can be misconstrued as advice; positioning should be explicit. | Founder/product decision before healthcare approval. |

## Next Safe Gate

Run the seven-scenario human review batch and update `HUMAN_CONTENT_REVIEW_LEDGER.md`. In parallel, complete `VISUAL_SCREENSHOT_REVIEW_CHECKLIST.md` through a working visual route, and use focused E2E reruns for changed/previously failing flows unless engineering explicitly budgets a full E2E run.
