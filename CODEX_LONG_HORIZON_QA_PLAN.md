# FluentStep Long-Horizon QA Operating Plan

## Operating Packet

**Mode:** Write-capable setup only, then read-only QA until fixes are prioritized.

**Active task:** Prepare a reliable Codex operating loop for a deep QA review and improvement pass across content, UI, UX, and end-to-end browser behaviour.

**Product primitive:** IELTS roleplay learning engine focused on pattern fluency, UK conversational English, blanks, chunk feedback, active recall, audio/pronunciation, and completion flow.

**Allowed write set for setup:**
- `CODEX_LONG_HORIZON_QA_PLAN.md`
- Later evidence only if explicitly created during the QA run: `docs/qa/long-horizon/**` or `tests/reports/**`

**Do-not-touch files during setup:**
- `src/services/staticData.ts`
- `src/components/**`
- `src/hooks/**`
- `src/design-system/**`
- `.env*`, `.vercel/**`, secrets, deploy config, generated production data

**Data boundary:** Use local fixture/app data and repo-visible scenario data only. Do not use external learner data, credentials, paid APIs, production writes, deploys, or external sends.

**Claim boundary:** Setup-ready only. Do not claim content-fixed, UX-fixed, production-ready, buyer-ready, safe-to-deploy, commercially validated, or safe-to-send without later verifier evidence.

**Acceptance criteria for this setup phase:**
- This plan file exists at repo root.
- The local browser QA route is named.
- Command drift is documented.
- Progress log and issue register formats are ready.
- Stopping criteria and founder-only decisions are explicit.
- No product implementation starts before repo state, URL target, and QA route are clear.

## Repo Truth Snapshot

Confirmed from live repo inspection on 2026-06-02:

| Area | Current repo fact | Notes |
| --- | --- | --- |
| App stack | Vite React app | `vite.config.ts`, `src/App.tsx` |
| Local start | `npm run dev` | Vite server config uses `host: 0.0.0.0`, `port: 3000` |
| Local URL | `http://localhost:3000` | Use for implementation QA |
| Build | `npm run build` | `prebuild` runs critical validation, scenario validation, and data-corruption detection |
| Type check | `npm run type-check` | App-focused `tsc -p tsconfig.app.json --noEmit`; repo-wide legacy check preserved as `npm run type-check:repo` |
| Lint | `npm run lint` | ESLint over app, CLI, and scripts |
| Content validation | `npm run validate`, `npm run validate:critical`, `npm run validate:feedback`, `npm run validate:alternatives`, `npm run qa-test` | Do not weaken validation |
| E2E | `npm run test:e2e:tier1`, focused Python `pytest`, budgeted `npm run test:e2e` | Existing Python Playwright suite; full suite is resource-heavy and not the default closeout gate |
| Browser route | Primary: Python Playwright against local app. Fallback: Computer Use/Chrome for manual behaviours Playwright cannot cover. | Browser caches and `.playwright-mcp` artifacts exist |
| Current branch | `main` | Confirm before write/fix work |
| Current dirty state | Inherited dirty `.gitignore` | Do not touch or revert without explicit approval |

### Known Command And Documentation Drift

Resolve or explicitly account for this before browser QA or implementation fixes:

| Drift | Evidence | QA default |
| --- | --- | --- |
| README says local app opens on `http://localhost:5173` | `README.md` | Treat as stale for this run because `vite.config.ts` sets port `3000` |
| Older E2E docs mention `localhost:3001` | `tests/README.md`, `tests/E2E_QUICK_START.md`, `test_homepage_fixes.py` | Treat as stale unless a script explicitly starts that port |
| Current E2E config defaults to live Vercel and supports `E2E_BASE_URL` override | `tests/e2e/config.py` | Use `npm run test:e2e:tier1:local` or `E2E_BASE_URL=http://127.0.0.1:3000` for local QA; live remains comparison baseline |
| Root `AGENTS.md` references root `SHARED_CONTEXT.md` and `rules/*` | Files do not exist at root | Use `.claude/SHARED_CONTEXT.md` and `.claude/rules/*` as project authority unless repaired later |

## Checkpoints

### Checkpoint 0: Setup Gate

Goal: Confirm the working surface before any audit or fix.

Run or verify:
- `git branch --show-current`
- `git status --short --branch -uno`
- `node --version`
- `npm --version`
- `python3 -m pytest --version`

Pass criteria:
- Branch is known.
- Dirty files are classified.
- Tool versions are available.
- Any inherited dirty state is not touched.

Stop if:
- Dirty state cannot be determined.
- A dirty file overlaps the planned write set.
- Required tooling is unavailable.

### Checkpoint 1: Baseline Verification

Goal: Establish the current validation baseline before QA findings or fixes.

Commands:
- `npm run type-check`
- `npm run build`
- `npm run validate:critical`
- `npm run validate`
- `npm run validate:feedback`
- `npm run validate:alternatives`
- `npm run qa-test`

Pass criteria:
- Exit codes and short outputs are recorded in the progress log.
- Failures are recorded as findings, not silently fixed.
- Validation is not weakened.

### Checkpoint 2: Browser Route Reconciliation

Goal: Make local E2E QA target the local app.

Default route:
- Start app with `npm run dev`.
- Confirm app at `http://localhost:3000`.
- Run focused Playwright smoke against local route.

Decision to make before broad E2E:
- Use the `E2E_BASE_URL` override in `tests/e2e/config.py`; do not hardcode a permanent flip from live to local.
- Run `npm run test:e2e:tier1:local` while the local app is serving `http://127.0.0.1:3000`.

Pass criteria:
- Local app route confirmed.
- Browser can navigate home and one scenario route.
- Screenshot capture works.

### Checkpoint 3: Content QA Audit

Representative coverage:
- Social
- Workplace
- Service/Logistics
- Advanced
- Healthcare
- Community

Audit criteria:
- UK native, day-to-day tone.
- Pattern fluency over vocabulary novelty.
- Locked chunk reuse and Bucket A/B relevance.
- Blank answer quality and alternatives.
- Chunk feedback, deep dive fallback, pattern summary, active recall.
- IELTS speaking relevance and learning value.

Authorities:
- `.claude/rules/CORE_RULES.md`
- `.claude/rules/SCHEMA_RULES.md`
- `.claude/rules/QUALITY_GATES.md`
- `src/constants.ts`
- validators under `src/services/linguisticAudit/**`

### Checkpoint 4: UI QA Audit

Screens and states:
- Home and onboarding.
- Search, filters, sort, category tabs.
- Scenario cards and progress state.
- Roleplay viewer.
- Blank reveal popover.
- Deep dive/chunk feedback modal.
- Active recall flow.
- Audio/listen controls.
- Completion state.
- Invalid scenario/error state.
- Desktop and mobile viewports.

Audit criteria:
- Layout hierarchy and scanning.
- Responsiveness and text fit.
- Loading, empty, error, and partial states.
- Accessibility, focus states, keyboard navigation, touch target size.
- Visual consistency with existing design system.

### Checkpoint 5: UX QA Audit

Journey:
- First visit.
- Choose scenario.
- Start roleplay.
- Advance through dialogue.
- Reveal blanks.
- Understand answer feedback.
- Use audio/pronunciation controls.
- Open deep dive/chunk feedback.
- Complete scenario.
- Return or continue learning.

Audit criteria:
- Friction and confusion.
- Clarity of next action.
- Learner motivation.
- Feedback timing and usefulness.
- Recovery from mistakes.
- Progress persistence and trust.

### Checkpoint 6: E2E Browser QA Audit

Primary route: Playwright against `http://localhost:3000`.

Minimum flows:
- Home load.
- Scenario selection.
- Direct scenario route.
- Roleplay start.
- Blank reveal and close.
- Answer alternatives/feedback.
- Audio/listen button.
- Deep dive/chunk feedback.
- Active recall.
- Completion.
- Invalid scenario.
- Mobile viewport.

Screenshot requirements:
- Desktop home.
- Desktop scenario start.
- Blank popover.
- Deep dive/chunk feedback.
- Completion.
- Invalid scenario/error.
- Mobile home.
- Mobile roleplay.

Evidence location:
- Prefer `tests/reports/screenshots/` if produced by tests.
- If manual screenshots are needed, use `docs/qa/long-horizon/screenshots/` only after creating that evidence folder explicitly.

### Checkpoint 7: Prioritized Fix Packet

Goal: Convert findings into small, reviewable fixes.

Rules:
- Do not start fixes during audit unless separately authorized.
- Group fixes by subsystem and file ownership.
- Keep `src/services/staticData.ts` protected; only one writer can touch it with explicit approval.
- Product judgment decisions must be marked `BLOCKED`.

Prioritization:
- Blocker: prevents primary learning flow, app load, data integrity, or validation.
- High: harms major scenario completion, feedback trust, accessibility, or browser reliability.
- Medium: visible friction or quality issue with workaround.
- Low: polish, copy clarity, minor consistency.

### Checkpoint 8: Regression Verification

Run after approved fixes:
- Focused verifier for touched area.
- `npm run type-check`.
- `npm run build`.
- Relevant validators.
- Focused Playwright smoke.
- `npm run test:e2e:tier1` for broad confidence.
- Full `npm run test:e2e` only for explicitly budgeted final regression or when E2E infrastructure changes require it. Prefer focused batch reruns for changed or previously failing flows.

### Checkpoint 9: Closeout

Close with:
- What changed.
- Files touched.
- Verifier commands.
- Exit codes.
- Screenshots captured.
- Repo state.
- Claim boundary.
- Remaining risks.
- Next safe gate.

## Workstreams

### Content QA Agent

Scope:
- Audit scenario quality, pedagogy, British English, blanks, alternatives, chunk feedback, active recall, and speaking relevance.

Read set:
- `.claude/rules/CORE_RULES.md`
- `.claude/rules/SCHEMA_RULES.md`
- `.claude/rules/QUALITY_GATES.md`
- `src/services/staticData.ts`
- `src/constants.ts`
- `docs/architecture/content-scenarios.md`
- `docs/architecture/audit-qa-checklist.md`

Output:
- Findings in the issue register.
- No direct content edits unless a later fix packet grants explicit write access.

### UI QA Agent

Scope:
- Audit screens, layout, hierarchy, responsiveness, empty/error/loading states, accessibility, and visual consistency.

Read set:
- `src/App.tsx`
- `src/components/**`
- `src/design-system/**`
- `src/index.css`
- `tailwind.config.js`
- `docs/screenshots/**`

Output:
- UI issue findings with screenshot evidence when possible.
- No direct UI edits during audit.

### UX QA Agent

Scope:
- Audit user journey, friction, clarity, onboarding, roleplay flow, feedback flow, learner motivation, and recovery paths.

Read set:
- `src/App.tsx`
- `src/components/TopicSelector.tsx`
- `src/components/RoleplayViewer.tsx`
- `src/components/OnboardingModal.tsx`
- `src/services/progressService.ts`
- `docs/testing/**`

Output:
- UX journey notes and prioritized findings.
- Product decisions marked `BLOCKED` where needed.

### E2E Browser QA Agent

Scope:
- Exercise local browser flows and capture evidence.

Read/run set:
- `npm run dev`
- `tests/e2e/**`
- `test_homepage_fixes.py`
- `tests/reports/**`

Output:
- Screenshots.
- Console/network/browser friction notes.
- Severity-classified findings.

### Engineering QA Agent

Scope:
- Inspect tests, scripts, build stability, validator coverage, and CI-readiness.

Read set:
- `package.json`
- `vite.config.ts`
- `pytest.ini`
- `tests/**`
- `scripts/**`
- `cli/**`
- `.claude/rules/DATA_INTEGRITY.md`
- `.claude/rules/WORKFLOW_RULES.md`

Output:
- Reliability risks and validator/test coverage gaps.
- No weakening validation.

## Command Matrix

| Command | Purpose | When to run | Expected result |
| --- | --- | --- | --- |
| `npm run dev` | Start local Vite app | Browser QA | Serves `http://localhost:3000` |
| `npm run type-check` | TypeScript verifier | Baseline and after fixes | Exit code 0 |
| `npm run lint` | ESLint verifier | Baseline if lint config works; after code fixes | Exit code 0 or documented current baseline |
| `npm run build` | Production build plus prebuild checks | Baseline and after fixes | Exit code 0 |
| `npm run validate:critical` | Critical content/data checks | Baseline and after data/content fixes | Exit code 0 |
| `npm run validate` | Scenario validation | Baseline and after content/schema changes | Exit code 0 |
| `npm run validate:feedback` | Chunk feedback validation | Baseline and after feedback/content changes | Exit code 0 |
| `npm run validate:alternatives` | Answer alternative quality | Baseline and after blank/answer changes | Exit code 0 |
| `npm run qa-test` | QA agent test | Baseline and closeout | Exit code 0 |
| `npm run test:e2e:tier1` | Focused high-value E2E | After browser route is local-ready | Exit code 0 or documented findings |
| `npm run test:e2e` | Full E2E suite | Explicitly budgeted final regression only | Meets quality gate threshold, with retry-pass agents recorded |
| `python3 -m pytest tests/e2e/meta_tests.py -v` | E2E structure check | Before broad E2E changes | Exit code 0 |

## Issue Register Format

Use this schema for every finding:

| Field | Required | Format |
| --- | --- | --- |
| ID | Yes | `LHQ-001`, incrementing |
| Severity | Yes | `Blocker`, `High`, `Medium`, `Low` |
| Workstream | Yes | `Content`, `UI`, `UX`, `E2E`, `Engineering` |
| Location | Yes | File path, route, scenario ID, viewport, or command |
| Evidence | Yes | Screenshot path, command output summary, code reference, or observed behaviour |
| Why it matters | Yes | User/learner risk or verifier risk |
| Recommended fix | Yes | Concrete, scoped action |
| Validation method | Yes | Command, browser flow, or review gate |
| Status | Yes | `Open`, `Blocked`, `Fix proposed`, `Fixed`, `Verified`, `Won't fix` |
| Owner | Optional | Workstream or file owner |

Template:

```markdown
| ID | Severity | Workstream | Location | Evidence | Why it matters | Recommended fix | Validation method | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LHQ-001 | High | E2E | `tests/e2e/config.py` | Base URL points to live Vercel while local QA requires `localhost:3000`. | Local fixes could be missed because tests exercise deployed code. | Add a local URL override or document one-off config update before E2E. | Run focused Playwright smoke against `http://localhost:3000`. | Open |
```

## Progress Log Format

Use this format at every checkpoint:

```markdown
## Progress Log

### 2026-06-02 Checkpoint N: Name

**Files inspected:**
- `path/to/file`

**Commands run:**
- `command` -> exit code N; short result

**Screenshots captured:**
- `path/to/screenshot.png` or `None`

**Issues found:**
- `LHQ-###`: one-line summary

**Fixes made:**
- None during audit, or exact file/path summary after approved fix packet

**Remaining work:**
- Next checkpoint or blocker
```

## Founder-Only Decisions

Mark `BLOCKED` and stop before proceeding if any of these are required:

- Change product direction, pedagogy, or claim boundaries.
- Remove, downgrade, or bypass validation gates.
- Bulk-edit scenario content or `src/services/staticData.ts`.
- Deploy, push, create PR, change remote state, or alter secrets.
- Use real learner/customer data.
- Make production-ready, buyer-ready, commercially validated, or safe-to-send claims.
- Choose between conflicting content/UX philosophies not settled by `.claude/rules/*`.

## Stopping Criteria

Stop and write `BLOCKED` with the exact decision needed when:

- Dirty repo state cannot be determined.
- Dev server cannot start on `localhost:3000`.
- Playwright cannot launch Chromium.
- E2E target cannot be reconciled between live and local.
- Authority docs conflict in a way that changes QA gates.
- A proposed fix needs product judgment.
- A verifier fails repeatedly and the failure cause is unclear.
- A change would touch files outside the authorized write set.

## Next Safe Gate

The next long-horizon run should begin at **Checkpoint 0: Setup Gate**, then proceed to **Checkpoint 1: Baseline Verification**. It should not begin product fixes until browser route reconciliation and prioritized findings are complete.
