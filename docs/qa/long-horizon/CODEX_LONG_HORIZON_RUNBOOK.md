# Codex Long-Horizon Runbook For FluentStep QA

## Scope

This runbook defines how Codex should run the next long-horizon FluentStep QA or implementation pass. It is a planning artifact only. It does not authorize source-code, validator, test, or scenario-data changes.

Current state: locally verified by automated checks. Not production-approved. Not human content-approved.

## Parallel Subagent KPI Loop

For broad QA passes, use `PARALLEL_SUBAGENT_QA_KPI_OPERATING_MODEL.md` before implementation. Spawn bounded read-only specialist lanes for Content/Pedagogy, UI/Visual, UX/E2E, and Engineering; merge their findings into the issue register; then implement only scoped fixes with focused verifiers.

## Standard Codex Workflow

### 1. Files to read first

Read in this order before changing anything:

1. `docs/qa/long-horizon/PROGRESS_LOG.md`
2. `docs/qa/long-horizon/browser-qa-report.md`
3. `docs/qa/long-horizon/browser-qa-report.json`
4. `docs/qa/long-horizon/QA_WORKFLOW.md`
5. `CODEX_LONG_HORIZON_QA_PLAN.md`
6. `README.md`
7. `package.json`
8. `docs/`
9. `tests/e2e/`
10. `scripts/qaAgent.ts`
11. `scripts/stagingValidateContent.ts`
12. For implementation only: the exact component, service, validator, or scenario file named by the approved issue.

### 2. Workstreams

Use these workstreams, preferably read-only until findings are prioritized:

- Codex use-case review: translate official Codex practices into repo-specific run rules.
- Browser/computer-use QA planning: define exact flows, screenshots, severity, and report format.
- Granular UI change workflow: one UI issue, one patch, one browser verifier.
- Human content review workflow: scenario review process, approval states, and founder-only decisions.
- Long-horizon runbook design: checkpoints, validations, progress logging, and stop conditions.

For implementation goals, use these QA workstreams:

- Content QA: IELTS relevance, British English, spoken naturalness, blank/chunk quality, feedback, recall.
- UI QA: layout, hierarchy, responsiveness, accessibility, visual consistency, state handling.
- UX QA: journey clarity, friction, motivation, recovery, feedback comprehension.
- E2E Browser QA: local browser flows, screenshots, console errors, failed responses.
- Engineering QA: scripts, build, type-check, E2E, CI readiness, validator coverage.

### 3. Checkpoints

Checkpoint 0: Repo state and authority
- Run `git status --short --branch -uno`.
- Classify dirty files.
- Stop if source-code dirty state conflicts with the intended write set.

Checkpoint 1: Evidence baseline
- Inspect current QA docs and reports.
- Confirm whether current evidence is fresh enough for the task.
- Do not claim readiness from stale evidence without saying it is stale.

Checkpoint 2: Read-only audit
- Inspect target routes, screenshots, content samples, or test failures.
- Record issues with severity, evidence, why it matters, recommended fix, validation method, and status.

Checkpoint 3: Prioritization gate
- Convert findings into a small ordered fix list.
- Mark product-judgement items as `BLOCKED`.
- Do not start broad implementation until the approved write set is clear.

Checkpoint 4: Granular implementation, if authorized
- Patch one issue or one file family at a time.
- Avoid unrelated cleanup.
- Preserve existing validation and do not weaken gates.

Checkpoint 5: Verification
- Run focused verifier first.
- Then run required baseline commands.
- Re-run `npm run qa:browser` after UI or route changes.

Checkpoint 6: Closeout
- Update `docs/qa/long-horizon/PROGRESS_LOG.md`.
- Report files touched, commands run, exit codes, screenshots, remaining risks, repo state, and claim boundary.

## Browser QA Route

Primary automated browser route:

```bash
npm run qa:browser
```

This starts or reuses local `http://127.0.0.1:3000`, captures screenshots, and writes:

- `docs/qa/long-horizon/browser-qa-report.md`
- `docs/qa/long-horizon/browser-qa-report.json`
- `docs/qa/long-horizon/screenshots/*.png`

Primary Python E2E local route:

```bash
npm run dev -- --host 127.0.0.1 --port 3000
npm run test:e2e:tier1:local
```

Live Vercel is comparison-only unless the task explicitly asks for live QA.

Computer Use or Chrome route:
- Use only for manual behaviors Playwright cannot evaluate well: visual fit, hover discoverability, perceived hierarchy, audio UX, mobile tap ergonomics, or screenshot review.
- Always record issue severity, evidence, expected result, actual result, and validation method.

## Command Safety Guardrails

- Do not put Markdown backticks inside double-quoted shell patterns; the shell can treat them as command substitution. Use single-quoted `rg` patterns when searching for text such as `npm run test:e2e`.
- If a command accidentally starts a long E2E/dev process, stop the spawned process tree immediately and record it in `PROGRESS_LOG.md`.
- Full `npm run test:e2e` remains budgeted-only and must not be triggered by search/check commands.

## Validation Commands

Baseline commands:

```bash
npm run validate:critical
npm run qa-check --strict
npm run audit:report
npm run type-check
npm run build
npm run qa:browser
```

Additional content commands:

```bash
npm run validate
npm run validate:feedback
npm run validate:alternatives
npm run qa-test
```

E2E commands:

```bash
npm run test:e2e:tier1:local
npm run test:e2e:tier1
# Full suite only when explicitly budgeted; prefer focused batch reruns.
npm run test:e2e
```

Notes:
- `npm run qa-check --strict` works but npm prints a warning. `npm run qa-check -- --strict` avoids the npm warning.
- `npm run test:e2e:tier1` defaults to live Vercel through `tests/e2e/config.py`; local route uses `test:e2e:tier1:local`.
- Full `npm run test:e2e` is resource-heavy in this local workspace. Do not run it as a default closeout gate; use focused E2E batches for changed or previously failing flows unless a full run is explicitly budgeted.
- `npm run audit:report` is report-only and must not auto-fix content.

## Screenshot Evidence

Required screenshot set for browser QA:

- Desktop home
- Desktop scenario start
- Desktop blank popover
- Desktop completion feedback
- Desktop pattern summary
- Desktop active recall
- Desktop invalid scenario
- Mobile home
- Mobile roleplay

Each screenshot review must classify findings as Blocker, High, Medium, or Low.

## Severity Levels

Blocker:
- App cannot load, primary flow cannot start, scenario cannot complete, validation blocks, or data integrity is broken.

High:
- Major learner flow harm, wrong blank/answer feedback, inaccessible core control, broken audio/pronunciation affordance, severe mobile layout issue, or trust-damaging content mismatch.

Medium:
- Visible friction with a workaround, confusing copy, weak hierarchy, inconsistent state, minor accessibility gap, or non-blocking feedback issue.

Low:
- Polish, spacing, minor copy clarity, small consistency issue, non-blocking warnings, or documentation drift.

## Human Approval Boundary

Automated validation can prove only local machine checks. It cannot prove:

- Human content approval
- IELTS pedagogical approval
- Production readiness
- Buyer readiness
- Safe-to-deploy status
- Commercial validation

Human review is required when:

- `qa-check` final approval is `needs-human-review`.
- `audit:report` produces approval-required suggestions.
- A scenario is moving from staging `ready-for-review` to `approved`.
- A product judgement is required for tone, difficulty, pedagogy, or learner motivation.

## Stopping Conditions

Stop and write a `BLOCKED` note when:

- Dirty repo state cannot be classified.
- Browser route cannot start or Chromium cannot launch.
- Required evidence is missing and cannot be generated read-only.
- A proposed fix needs product judgement.
- A requested write would modify files outside the allowed write set.
- Source-code changes are needed but the current mode is read-only.

## BLOCKED Note Format

```markdown
BLOCKED

Decision needed: [exact decision]
Why it blocks: [specific dependency]
Evidence: [file, command, screenshot, or source]
Options:
- Option A: [tradeoff]
- Option B: [tradeoff]
Recommended next gate: [who/what should decide]
```

## Closeout Format

Use this closeout shape:

- Files inspected
- Files created/updated
- Commands run
- Results and exit codes
- Screenshots reviewed or captured
- Findings by severity
- Remaining decisions
- Repo state
- Claim boundary
- Next safe gate
