/goal Complete the next FluentStep long-horizon QA pass without claiming production readiness or human content approval.

Mode: start read-only, then only implement fixes after findings are prioritized and the allowed write set is explicit.

Read first:
- docs/qa/long-horizon/PROGRESS_LOG.md
- docs/qa/long-horizon/QA_WORKFLOW.md
- docs/qa/long-horizon/CODEX_LONG_HORIZON_RUNBOOK.md
- docs/qa/long-horizon/NEXT_BROWSER_QA_PLAN.md
- docs/qa/long-horizon/HUMAN_CONTENT_REVIEW_PLAN.md
- docs/qa/long-horizon/browser-qa-report.md
- docs/qa/long-horizon/browser-qa-report.json
- CODEX_LONG_HORIZON_QA_PLAN.md
- package.json
- tests/e2e/
- scripts/qaAgent.ts
- scripts/stagingValidateContent.ts

Current boundary:
Local automated QA has passed: validate:critical, qa-check --strict, audit:report, type-check, build, qa:browser, and test:e2e:tier1:local. Browser QA has 10 screenshots and 0 automated issues. Manual visual review and human content approval are still required.

Workstreams:
1. Manual browser/screenshot QA: review desktop/mobile screenshots and rerun npm run qa:browser if screenshots are stale or missing.
2. Human content review sampling: review representative scenarios across Social, Workplace, Service/Logistics, Advanced, Healthcare, and Community.
3. Issue register: record findings with severity, location, evidence, why it matters, recommended fix, validation method, and status.
4. Prioritized fix planning: group fixes into small reviewable packets; do not start broad implementation.
5. Verification planning: map each proposed fix to focused verifier plus baseline gates.

Rules:
- Do not weaken validators, tests, or QA gates.
- Do not edit source or scenario data until an explicit implementation write set is approved.
- Distinguish automated validation from human approval.
- Mark product judgement decisions as BLOCKED with the exact decision needed.
- Keep docs/qa/long-horizon/PROGRESS_LOG.md updated.

Validation if implementation is authorized later:
npm run validate:critical
npm run qa-check --strict
npm run audit:report
npm run type-check
npm run build
npm run qa:browser
npm run test:e2e:tier1:local

Do not run full `npm run test:e2e` by default. Use focused E2E reruns for changed or previously failing flows; full-suite E2E requires an explicit time/resource budget.

Stop when:
- Manual visual QA findings are recorded.
- Human content review sample is complete or blocked with exact decisions.
- Prioritized fixes are ready with validation methods.
- No production/human-approval claims are made.
