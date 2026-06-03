# Codex Use Case Review For FluentStep Long-Horizon QA

## Purpose

This document translates official Codex use-case guidance into a FluentStep-specific, read-only QA operating system. It uses current repo evidence from `PROGRESS_LOG.md`, `browser-qa-report.md`, `QA_WORKFLOW.md`, `package.json`, `tests/e2e/`, `scripts/qaAgent.ts`, and `scripts/stagingValidateContent.ts`.

Claim boundary: FluentStep is locally verified by automated checks. It is not production-approved and not human content-approved.

## Official Codex Sources Reviewed

- Codex use cases index: https://developers.openai.com/codex/use-cases
- QA your app with Computer Use: https://developers.openai.com/codex/use-cases/qa-your-app-with-computer-use
- Make granular UI changes: https://developers.openai.com/codex/use-cases/make-granular-ui-changes
- Follow a goal: https://developers.openai.com/codex/use-cases/follow-goals
- Run long horizon tasks with Codex: https://developers.openai.com/blog/run-long-horizon-tasks-with-codex

## Relevant Codex Patterns

### 1. Computer-use QA and browser QA

Official guidance frames Computer Use QA as clicking through real product flows and returning severity, repro steps, expected result, actual result, and a short triage summary. For FluentStep, this maps to local browser QA against `http://127.0.0.1:3000`, plus manual review of screenshot evidence.

Applicability:
- Primary route: `npm run qa:browser` for deterministic Playwright screenshots and automated issue capture.
- Secondary route: Computer Use or Chrome only when Playwright cannot inspect a behavior, such as nuanced hover discoverability, perceived mobile text fit, or human visual judgement.
- Current evidence: browser QA generated 12 screenshots, 0 automated issues, 0 console errors, and 0 failed responses; blank integrity validation audited 715 blanks and 2179 substitutions with 0 issues.
- Missing evidence: screenshots still need human visual review; automated browser QA is not a substitute for human design approval.

### 2. Granular UI changes

Official granular UI guidance is best suited to existing apps where one design note becomes one focused code change, verified in a browser before the next iteration. FluentStep should use this only after the next browser/manual review identifies a specific issue.

Applicability:
- Do not start broad redesigns from QA findings.
- Convert each UI finding into one small patch: route, screenshot, severity, expected state, actual state, target file family, focused verifier.
- Reuse existing components, tokens, icons, and layout patterns.
- Stop after one UI fix unless a `/goal` explicitly authorizes a multi-fix implementation run.

### 3. Follow-goals

Official `/goal` guidance is for durable work with a clear stopping condition, required reading, validation commands, checkpoints, and a progress log. FluentStep's prior QA pass fits this pattern because it combined validators, browser evidence, E2E, docs, and progress logs.

Applicability:
- Use `/goal` for the next implementation pass only after the read-only review artifacts define scope.
- Include exact write boundaries and do-not-touch files.
- Keep `docs/qa/long-horizon/PROGRESS_LOG.md` as the restartable audit log.
- A goal may continue across turns, but completion must be proven with current files and command output.

### 4. Long-horizon task loop

The official long-horizon Codex blog describes an effective loop: plan, edit, run tools, observe results, repair failures, update docs/status, and repeat. It emphasizes target/constraints, milestone acceptance criteria, a runbook, continuous verification, and a live status/audit log.

Applicability:
- FluentStep should treat runbooks and progress logs as first-class QA infrastructure.
- Each checkpoint must name the verifier command or evidence artifact before work starts.
- Each implementation change should be small enough to explain, review, and validate.
- Human approval boundaries must stay explicit: automated content gates can pass while human content approval remains pending.

### 5. Subagents and workstreams

Codex docs and surfaces support subagent-oriented work and long-running workflows. FluentStep should use separate read-only workstreams for Content QA, UI QA, UX QA, E2E Browser QA, and Engineering QA, then merge findings into one issue register.

Applicability:
- Read-only subagents may inspect disjoint areas in parallel.
- Write-capable work should not be parallel unless file ownership is disjoint and explicitly authorized.
- One writer should own `src/services/staticData.ts` or UI component families during any implementation run.

### 6. Progress logging

Official long-horizon guidance highlights live status/audit logs. FluentStep already uses `docs/qa/long-horizon/PROGRESS_LOG.md` for checkpoint, commands, screenshots, issues, fixes, and remaining work.

Applicability:
- Every QA run should append a concise log entry.
- The log must distinguish automated validation from human approval.
- The log must capture blockers and product-judgement decisions, not bury them in chat.

## FluentStep Evidence Summary

Current automated evidence:
- `npm run validate:critical`: passed in the latest recorded run with 53 scenarios and 0 critical errors.
- `npm run qa-check --strict`: passed with 53/53 automated pass, but 53 need human review.
- `npm run audit:report`: generated `AUDIT_REPORT.md` with 1409 approval-required suggestions.
- `npm run type-check`: passed using app-focused `tsconfig.app.json`.
- `npm run build`: passed; later chunk splitting removed the prior Vite chunk-size warning in current launch-candidate evidence.
- `npm run qa:browser`: passed with 12 screenshots and 0 automated browser issues.
- `npm run test:e2e:tier1:local`: previously passed with 71 tests and 3 inherited pytest warnings; latest post-blank-integrity rerun is blocked by local Chromium MachPort permissions after the stale multiple-blank test expectation was updated.

Current approval boundary:
- Automated QA has passed locally.
- Human content approval has not happened.
- Manual visual review of screenshots has not happened.
- Full `npm run test:e2e` has not been run after the local tier-1 pass and remains budgeted-only.

## Recommendations

1. Treat `npm run qa:browser` plus manual screenshot review as the next browser QA loop.
2. Treat `npm run qa-check --strict` as an automated gate, not final content approval.
3. Use `scripts/stagingValidateContent.ts` Gate 4 for file-based human approval before moving any scenario to approved.
4. Use granular UI runs for one UI issue at a time after the manual visual review creates an issue register.
5. Use `/goal` only when the objective includes exact files to read, allowed write set, validation commands, stopping criteria, and progress-log requirements.
