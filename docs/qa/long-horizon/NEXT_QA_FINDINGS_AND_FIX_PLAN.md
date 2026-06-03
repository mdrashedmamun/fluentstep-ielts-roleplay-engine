# Next QA Findings And Fix Plan

Date: 2026-06-02
Last updated: 2026-06-03 private-beta launch-candidate pass

Mode: current QA findings/status register. Earlier source and validator fixes are recorded in `PROGRESS_LOG.md`; this file now routes remaining review and engineering gates.

Claim boundary: locally automated QA evidence exists, but this is not human content approval, production readiness, buyer readiness, or deploy safety.

## Current Status Reconciliation

Updated: 2026-06-02 after ENG-QA-003 bundle split, refreshed `quality`, browser QA, visual lint evidence, and E2E harness hardening recorded in `PROGRESS_LOG.md`.

- FS-QA-001: fixed locally; feedback now teaches `clean` / `keep clean`.
- FS-QA-002: fixed locally; restaurant scenario now has non-empty alternatives for all 27 blanks.
- FS-QA-003: fixed locally; restaurant V2 feedback now has non-empty `whyOdd` and capped examples.
- FS-QA-004: fixed locally; restaurant opener now teaches the reusable phrase `get you started`.
- FS-QA-005: fixed locally; community British spelling contrast now uses `organized` -> `organised`.
- FS-QA-006: fixed locally; desktop media fallback now shows poster/fallback instead of a black loading block.
- FS-QA-007: fixed locally; restaurant active-recall target now uses the full phrase `That sounds good` rather than a bare `good` chunk.
- FS-QA-008: fixed locally; mobile home and mobile roleplay no longer create document-level horizontal overflow.
- ENG-QA-001: fixed locally; `validate:alternatives` now exits 0 with 0 issues.
- ENG-QA-002: fixed locally; Tier 1 local E2E passed twice consecutively after fixture hardening.
- ENG-QA-003: fixed locally; build now emits separate `index`, `scenario-data`, and `vendor` chunks below 500 KB with no Vite chunk-size warning.
- ENG-QA-004: fixed locally; `npm run lint` now exits 0 across `src`, `cli`, and `scripts`. Latest parsed lint report is 0 errors / 108 warnings / 175 files. Remaining warnings and the `.eslintignore` ESLint 9 deprecation message are optional cleanup, not current blockers.
- ENG-QA-005: mitigated locally; E2E harness now has bounded concurrency, visible per-agent reporting, optional sequential retry, browser-process reuse with isolated contexts, and first-blank navigation hardening. Full-suite runs remain resource-heavy/load-sensitive, so they are deferred unless explicitly budgeted. The next practical gate is focused E2E on changed or previously failing batches.

This reconciliation does not claim human content approval, production readiness, buyer readiness, deploy safety, or visual approval.

## 2026-06-03 Private-Beta Readiness Update

Atlas classification: FluentStep QA-to-private-beta launch candidate, not public production launch.

Current AI/content state:
- Content/Pedagogy subagent wave completed 53/53 scenario AI pre-review. This is `ai-reviewed`, not `human-approved`.
- Objective Blocker/High content issues found in the full AI wave have been fixed locally where they were Codex-fixable.
- Founder/human accountability rows remain intentionally unfilled.

Objective fixes applied in this pass:
- `FS-CONTENT-BLOCK-001`: `service-35-landlord-repairs` blank 32 feedback now teaches `commitment`, matching the actual answer.
- `FS-CONTENT-BLOCK-002` / `PROD-003`: Healthcare scenario start now shows a visible learning-only disclaimer; browser QA captures `desktop-healthcare-disclaimer.png`. Founder/legal/human approval is still open.
- `FS-CONTENT-BLOCK-003` / `PROD-001`: `advanced-1-manager-escalation` has been moved to `Service/Logistics` as the private-beta default. Founder signoff is still open.
- `FS-CONTENT-HIGH-001`: learner-facing UK English drift was corrected for `neighbour/neighbourhood`, `apologise`, and `prioritise` in app scenario copy. Stable IDs were not renamed.
- Academic framing was generalised from Oxford/Cambridge to a UK university tutorial context.
- `Academic` and `Cultural` category filters were added to the scenario picker, and stale 43-scenario hero copy was removed.

Fresh automated evidence:
- Earlier `npm run qa:browser`: exit 0; generated `2026-06-03T05:48:29Z`; 10 screenshots, 0 issues, 0 console errors, 0 failed responses. Superseded by the `2026-06-03T13:52:17Z` 12-screenshot blank-integrity run below.
- `npm run test:e2e:tier1:local`: exit 0; 71 passed, 3 inherited pytest warnings, runtime 294.68s.
- Earlier `npm run qa:visual-lint`: exit 0; generated `2026-06-03T05:51:25Z`; Chromium DOM lint could not launch under macOS sandbox MachPort permissions, so the command used screenshot fallback against the 10 browser QA screenshots and found 0 issues. Superseded by the `2026-06-03T13:52:46Z` 12-screenshot fallback run below.

Private-beta blocker status:
- 0 unresolved objective Codex-fixable Blocker/High issues are known after this pass.
- Remaining gates are founder/human/visual accountability gates, not source-content fixes.


## 2026-06-03 Blank Integrity Regression Update

Current blank-integrity state:
- `FS-QA-009`: fixed locally. `RoleplayViewer` now normalises answer index base per scenario through `src/services/blankIndexing.ts`, avoiding the prior exact-index-first fallback that could render `Nice to meet` into `It's quite ________ here`.
- `npm run validate:blank-integrity`: exit 0; 53 scenarios, 715 blanks, 2179 substitutions, 0 issues. Reports: `blank-integrity-report.md` and `blank-integrity-report.json`.
- `npm run qa:browser`: exit 0; generated `2026-06-03T13:52:17Z`; 12 screenshots, 0 issues, 0 console errors, 0 failed responses. New screenshots include `desktop-blank-integrity-neighbor.png` and `desktop-route-workplace-performance-review.png`.
- `npm run qa:visual-lint`: exit 0; generated `2026-06-03T13:52:46Z`; screenshot fallback checked 12 screenshots and found 0 issues.

Tier 1 E2E caveat:
- Full rerun after starting the dev server reached product assertions and produced 70 passed / 1 failed / 3 warnings. The one failure was a stale test locator for the old multiple-popover behavior, not the blank-answer product bug.
- The stale test was updated to re-query remaining blanks and assert one active alternatives popover.
- Focused reruns after the test update are currently blocked before assertions by Chromium MachPort permissions in this sandbox. Rerun in a browser environment that allows Chromium launch before treating Tier 1 as green again.

## Current Evidence

Latest automated browser evidence:
- Vercel preview deployment is Ready at `https://fluentstep-ielts-roleplay-engine-2pgzvm9wy.vercel.app` and `curl -I` returned HTTP 200. Remote browser smoke is not claimed because Node fetch cannot reach the preview from this local environment.
- `docs/qa/long-horizon/browser-qa-report.md` generated at `2026-06-03T13:52:17Z` against `http://127.0.0.1:3000`.
- Automated browser report captured 12 screenshots, including `desktop-healthcare-disclaimer.png`, `desktop-route-workplace-performance-review.png`, and `desktop-blank-integrity-neighbor.png`, and reported 0 issues, 0 console errors, and 0 failed responses.
- `npm run qa:visual-lint`: current report generated at `2026-06-03T13:52:46Z` and exits 0 through screenshot fallback. It checked 12 current browser QA screenshots and found 0 issues; manual visual approval remains separate.
- Manual visual/design approval remains incomplete because the image-viewing route failed; see `VISUAL_SCREENSHOT_REVIEW_CHECKLIST.md`.

Latest automated content/engineering gates after Atlas coordination:
- `npm run validate:critical`: exit 0; 53 scenarios; 0 critical errors; inherited `social-7-house-rules` chunk ID warnings remain.
- `npm run validate:alternatives`: exit 0; 53 scenarios, 715 blanks, 2173 alternatives including main answers, 0 issues.
- `npm run qa-check -- --strict`: exit 0; 53/53 passed; all 53 still need human review.
- `npm run build`: exit 0; chunk split verified with `index` 131.42 KB, `scenario-data` 238.20 KB, and `vendor` 251.28 KB; no Vite chunk-size warning.
- `npm run lint`: exit 0; latest parsed report is 0 errors / 108 warnings / 175 files. Remaining warnings are mostly script `no-console` and cleanup-style warnings; `.eslintignore` still emits an ESLint 9 deprecation message. `npm run quality` exits 0 outside sandbox.
- `npm run test:e2e:tier1:local`: latest exit 0; 71 passed, 3 inherited pytest warnings, 294.68s.
- Full E2E harness smoke: deliberate one-second timeout returns bounded diagnostics and retry output instead of hanging.
- Focused E2E regression after harness fixes: `tier2_batch_01.py` 71 passed / 4 skipped in 5:50; `tier2_batch_02.py` 71 passed / 4 skipped in 9:07 after the Next Turn fallback; `tier2_batch_09.py` 73 passed / 2 skipped in 9:06; `tier2_batch_10.py` 15 passed in 2:39.
- Full E2E status: not a practical routine blocking gate in this local environment. A full concurrency-3 run produced 9/11 passing agents before targeted fixes; a later concurrency-3 run showed load-sensitive failure/timeout; a concurrency-2 run was stopped because it was consuming too much wall-clock time without producing timely signal. Use focused E2E batches by default; run full suite only with an explicit time/resource budget.

Current human/content state:
- `HUMAN_CONTENT_REVIEW_LEDGER.md` currently tracks 52 scenarios as `not-reviewed` and 1 scenario as `blocked` for Healthcare/founder/legal judgement.
- Codex-local fixes are complete for FS-QA-001 through FS-QA-008 and first-batch AI pre-review fixes FS-CONTENT-AI-001/002/005, but named human approval remains absent.

## First Batch AI Content Pre-Review

Artifact: `FIRST_BATCH_AI_CONTENT_PRE_REVIEW_FINDINGS.md`

Status after local fixes:
- 53/53 scenarios are AI pre-reviewed by the Content/Pedagogy lane; the first seven representative findings remain linked for detailed sampling evidence.
- Fixed locally: `FS-CONTENT-AI-001`, `FS-CONTENT-AI-002`, `FS-CONTENT-AI-005`.
- Academic framing was generalised locally; `FS-CONTENT-AI-006` Community difficulty/length remains a human/product judgement unless evidence upgrades it to High.
- Healthcare disclaimer was implemented locally and browser-verified; Healthcare approval still requires founder/legal/human judgement.
- Validation passed: `npm run validate:critical`, `npm run validate:alternatives`, `npm run qa-check -- --strict`.

Claim boundary: `ai-reviewed` and locally validated, not human-approved.

## Issue Register

| ID | Severity | Location | Evidence | Why It Matters | Recommended Fix | Validation Method | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FS-QA-009 | High | `src/components/RoleplayViewer.tsx`, `social-10-new-neighbor` blank 2 | UI could render `Nice to meet` in `Welcome to the neighbourhood. It's quite ________ here` because answer lookup tried exact rendered blank index before one-based fallback. | Learners see an impossible sentence and lose trust in blank feedback. | Fixed locally with shared per-scenario index-base normalisation and single-active-popover state. | `npm run validate:blank-integrity`: exit 0; `npm run qa:browser`: exit 0 with `desktop-blank-integrity-neighbor.png`; rerun Tier 1 when Chromium MachPort allows. | Fixed locally |
| FS-QA-001 | High | `src/services/staticData.ts`, `social-1-flatmate` | Dialogue blank says `keep ________` and answer index 3 is `clean` at lines 188 and 243-249, but `chunkFeedback` blankIndex 3 teaches `keep track` at lines 365-400. | Feedback can teach the wrong phrase after the learner answers correctly, undermining trust and pattern fluency. | Replace the mismatched feedback with content for `clean`/`keep clean`, or change the dialogue/answer to match `keep track` if product intent was monitoring rather than house cleanliness. | Run `npm run validate:critical`, `npm run qa-check --strict`, `npm run audit:report`; manually replay `social-1-flatmate` blank 3 and confirm feedback matches the answer. | Fixed locally |
| FS-QA-002 | High | `src/services/staticData.ts`, `service_1_restaurant_order` | All 27 `answerVariations` in the sampled restaurant scenario have empty `alternatives` arrays at lines 13096-13231. | The exercise becomes brittle and less conversational; learners get less support for acceptable UK English variants. | Add natural alternatives for each blank, prioritising multi-word service phrases, dietary/allergy language, and billing phrases. Keep alternatives semantically valid in the exact sentence. | Run `npm run validate:critical`, `npm run qa-check --strict`, `npm run validate:alternatives`, then browser-smoke the restaurant flow. | Fixed locally |
| FS-QA-003 | Medium | `src/services/staticData.ts`, `service_1_restaurant_order` V2 feedback | V2 feedback examples often exceed the local interface contract of 1-2 examples and several `whyOdd` fields are empty, e.g. lines 13242-13250 and 13260-13268. | Feedback becomes verbose and less diagnostic; empty `whyOdd` weakens the learning loop and makes reports appear polished while omitting the actual explanation. | Trim examples to focused 1-2 items per chunk and fill every `whyOdd` with a specific learner-facing reason. | Add or run a validator that checks V2 `examples.length <= 2` and non-empty `whyOdd`; then run `npm run validate:critical` and `npm run qa-check --strict`. | Fixed locally |
| FS-QA-004 | Medium | `src/services/staticData.ts`, `service_1_restaurant_order` | The chunk `help start` at lines 13107-13110 and 13271-13278 is taught as native, but the full phrase is carried by the sentence around it. | The blank isolates an unnatural fragment rather than a reusable conversational chunk. The learner may memorise `help start` instead of a full server phrase. | Rework the blank to capture the full phrase pattern, e.g. `get you started` or `help start you off`, subject to product tone review. | Human content review plus browser replay; run validators after any data edit. | Fixed locally |
| FS-QA-005 | Medium | `src/services/staticData.ts`, `community-1-council-meeting` | Fixed locally: `commonWrong` now uses US spelling `organized`, while `fix` uses British `organised`, matching the `whyOdd` explanation. | Clear contrast helps the learner understand the British-English spelling point. | Keep in human review sample for final content approval. | `npm run validate:critical`, `npm run validate:alternatives`, `npm run qa-check -- --strict`, `npm run build`. | Fixed locally |
| FS-QA-006 | Medium | Desktop home screenshot | `desktop-home.png` top crop shows a large black media area with loading spinner above scenario selection. | The first desktop impression looks like a broken video or missing asset before the learner reaches the real task. | Add a poster/fallback state, reduce media dominance, or defer the media block until it has loaded. Keep mobile treatment consistent. | Rerun `npm run qa:browser`; manually compare `desktop-home.png` and `mobile-home.png`; check console/network for media failures. | Fixed locally |
| FS-QA-007 | Low | Active recall content | Fixed locally: the restaurant positive-response blank/chunk now teaches `That sounds good` as a full reusable phrase. | Multi-word pragmatic phrase better matches the pattern-fluency primitive than a bare adjective. | Keep in human review sample for final content approval. | `npm run validate:critical`, `npm run validate:alternatives`, `npm run qa-check -- --strict`, `npm run build`, `npm run qa:browser`. | Fixed locally |
| FS-QA-008 | High | Mobile home and mobile roleplay layout | `qa:visual-lint` initially found mobile-home horizontal overflow of 177px and mobile-roleplay horizontal overflow of 136px. | Horizontal scrolling on mobile makes controls feel broken and can hide category/navigation actions. | Fixed responsive category tabs, mobile roleplay header stacking, and filter hit areas; added repeatable `qa:visual-lint` gate. | `npm run qa:visual-lint`: exit 0; 6 page states, 0 issues, mobile horizontal overflow delta 0px. `npm run qa:browser`: exit 0 with refreshed screenshots. | Fixed locally |

## Current Workstream Status

Content QA:
- FS-QA-001 through FS-QA-008 are fixed locally and validator/browser-clean.
- Human review remains required for all 53 scenarios. Use `HUMAN_CONTENT_REVIEW_LEDGER.md`; start with the seven representative/post-fix scenarios.

UI/Visual QA:
- Automated browser QA is green with 12 refreshed screenshots and 0 issues.
- Automated visual layout lint exits 0 through screenshot fallback when Chromium DOM lint is blocked by macOS sandbox MachPort permissions. It validates the 12 current browser QA screenshots; manual visual/design review remains open.
- Manual visual/design approval remains open in `VISUAL_SCREENSHOT_REVIEW_CHECKLIST.md`; the contact sheet has been refreshed to the 12 current screenshots, but named visual review is still required.

UX/E2E QA:
- Tier 1 local E2E passed twice consecutively after fixture hardening.
- The browser route now verifies it is running against FluentStep rather than an unrelated localhost app.
- Full-suite E2E is materially improved but still long/load-sensitive. The runner is bounded and retry-aware; implicated batches 02 and 09 now pass directly. Treat focused E2E plus targeted reruns as the next practical engineering regression gate; full E2E is a budgeted deep-regression option, not routine closeout.

Engineering QA:
- ENG-QA-001 and ENG-QA-002 are fixed locally.
- ENG-QA-003 is fixed locally because the build chunks are now below 500 KB and the Vite chunk-size warning is gone.
- ENG-QA-004 is fixed locally because `npm run lint` exits 0 across the repo. Remaining 108 lint warnings and the `.eslintignore` deprecation message are optional cleanup items, not current blockers.
- ENG-QA-005 is mitigated locally and remains documented as resource-heavy. It should be closed either by a budgeted full run or by replacing the current long-suite strategy with smaller reliable smoke/regression shards.

## Remaining Packets

Packet A - Human content review batch:
- Scope: named reviewer reviews the seven representative/post-fix scenarios first, then all 53.
- Artifact: `HUMAN_CONTENT_REVIEW_LEDGER.md`.
- Claim boundary: no content approval until reviewer/date/checklist evidence is recorded.

Packet B - Visual/design review:
- Scope: named reviewer inspects all 10 refreshed screenshots.
- Artifact: `VISUAL_SCREENSHOT_REVIEW_CHECKLIST.md`.
- Claim boundary: automated `qa:browser` is not visual approval.

Packet C - Optional performance regression watch:
- Scope: future bundle-size monitoring only; ENG-QA-003 is fixed locally.
- Artifact: `ENGINEERING_QA_FOLLOWUPS.md`.
- Claim boundary: local build chunk split verified, not production performance certification.

Packet D - Optional lint warning cleanup:
- Scope: warning cleanup only after ENG-QA-004. Highest-volume warning files are `scripts/extractFromPDF.ts`, `scripts/utils/validationReporting.ts`, `scripts/migrateChunkIds.ts`, `scripts/migrateCustomCategories.ts`, and `scripts/testQAAgent.ts`.
- Artifact: `ENGINEERING_QA_FOLLOWUPS.md`.
- Claim boundary: lint exits 0 locally, but remaining warnings and `.eslintignore` migration are not fully cleaned.

## Founder-Only Or Product Decisions

OPEN SIGNOFF - Private-beta default applied locally: `advanced-1-manager-escalation` now uses `Service/Logistics`. Founder signoff is still required before treating the product decision as closed.

BLOCKED - Decide whether desktop home should keep a large media-first hero. If the product primitive is fast roleplay practice, a smaller or deferred media area may be more appropriate.

OPEN SIGNOFF - Private-beta default applied locally: Healthcare scenarios now show a visible learning-only disclaimer. Founder/legal/human signoff is still required before Healthcare approval.

## Next Safe Gate

Primary next gate: run the named human/founder/visual review gates using `HUMAN_CONTENT_REVIEW_LEDGER.md`, `HUMAN_CONTENT_REVIEW_PLAN.md`, and `FOUNDER_PRODUCT_DECISION_FORM.md`.

Parallel non-human gates:
- Visual/design reviewer inspects the 12-row `VISUAL_SCREENSHOT_REVIEW_CHECKLIST.md`.
- Engineering QA next gate: use focused E2E reruns for changed/failed flows and avoid another full run unless explicitly budgeted. `ENG-QA-001` through `ENG-QA-004` are fixed locally; ENG-QA-005 is mitigated but not fully closed.

Do not claim human approval, visual approval, production readiness, buyer readiness, or deploy safety until the relevant ledger/checklist entries are completed by named reviewers.
