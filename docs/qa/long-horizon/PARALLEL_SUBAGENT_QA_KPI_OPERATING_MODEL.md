# Parallel Subagent QA KPI Operating Model

Updated: 2026-06-03

Claim boundary: this operating model lets specialised AI/Codex subagents pre-review, score, prioritise, and propose or implement scoped fixes. It does not replace named human content approval, named visual/design approval, founder product decisions, production readiness, buyer readiness, deploy safety, legal safety, or commercial validation.

## Atlas Position

The previous gate wording was too passive. `Human review required` must not mean `Codex stops`. It means:

1. AI subagents do the labour-heavy pre-review in parallel.
2. AI subagents produce evidence, scores, issues, and recommended fixes.
3. Codex implements scoped fixes only after the issue is specific and the write set is narrow.
4. A named human/founder signs the approval rows that require judgement or accountability.

This creates two separate states:

- `ai-reviewed`: a specialist subagent has reviewed the item against this model and produced evidence.
- `human-approved`: a named human reviewer has completed the ledger/checklist with reviewer/date/evidence.

Do not collapse these states.

## Workstream Ownership

| Lane | Subagent role | Owns | Does not own | Primary artifact |
| --- | --- | --- | --- | --- |
| Content/Pedagogy QA | IELTS scenario reviewer | UK English, IELTS relevance, blank/chunk value, alternatives, feedback, active recall, safety wording | Final content approval or founder product judgement | `HUMAN_CONTENT_REVIEW_LEDGER.md`, `HUMAN_CONTENT_REVIEW_BATCH_BRIEF.md` |
| UI/Visual QA | Screenshot/design reviewer | Layout, hierarchy, text fit, responsive fit, obvious accessibility/friction, screenshot issue evidence | Final visual/design approval | `VISUAL_SCREENSHOT_REVIEW_CHECKLIST.md` |
| UX/Journey QA | Learner journey reviewer | First visit to completion, motivation, feedback comprehension, friction, recovery paths | Product strategy rewrites | `NEXT_QA_FINDINGS_AND_FIX_PLAN.md` |
| E2E Browser QA | Focused flow verifier | Local route smoke, changed-flow reruns, screenshot evidence, console/network issues | Routine full-suite E2E without budget | `browser-qa-report.md`, E2E reports |
| Engineering QA | Validation/CI reviewer | Script reliability, validator coverage, type/build/lint gates, flake/resource control | Weakening validation to pass | `ENGINEERING_QA_FOLLOWUPS.md`, `CODEX_LONG_HORIZON_RUNBOOK.md` |
| Founder/Product Gate | Founder or delegated product owner | Category choices, healthcare disclaimer position, product tradeoffs, final claim boundary | Running automation as proof of judgement | `FOUNDER_PRODUCT_DECISION_FORM.md` |

## KPI Scorecard

Use this table at the start and close of each QA pass. Scores are evidence states, not opinions.

| KPI | Target | Evidence | Owner | Blocks approval? |
| --- | --- | --- | --- | --- |
| Content review coverage | 7/7 representative batch `ai-reviewed`; then 53/53 `ai-reviewed` before final review | Scenario rows with subagent notes or linked issue IDs | Content/Pedagogy QA | Blocks AI-ready state |
| Human content approval | 53/53 `approved` or explicitly `blocked/changes-requested` with owner | `Human State`, `Reviewer`, `Reviewed At`, notes | Named human reviewer | Blocks content approval |
| Critical validators | `validate:critical` exit 0 | command output in `PROGRESS_LOG.md` | Engineering QA | Blocks local QA closeout |
| Alternatives validator | `validate:alternatives` exit 0 and no empty alternatives in target scope | command output plus issue register | Content + Engineering QA | Blocks content fix closeout |
| Strict QA | `qa-check -- --strict` exit 0; human-review status not overclaimed | command output | Engineering QA | Blocks local QA closeout |
| Visual automated layout | `qa:visual-lint` exit 0; horizontal overflow delta 0px for checked states | `visual-lint-report.md/json` | UI/Visual QA | Blocks visual-ready state |
| Visual manual review | 10/10 screenshot rows reviewed by named reviewer | `VISUAL_SCREENSHOT_REVIEW_CHECKLIST.md` | Named visual reviewer | Blocks visual approval |
| Browser QA smoke | 10 screenshots, 0 console errors, 0 failed responses for current evidence set | `browser-qa-report.md/json` | E2E Browser QA | Blocks browser-ready state |
| Focused E2E | Changed or previously failing flows pass focused rerun | pytest/E2E command output | E2E Browser QA | Blocks changed-flow closeout |
| Full E2E budget control | No full `npm run test:e2e` unless explicitly budgeted | `PROGRESS_LOG.md` command log | Atlas + Engineering QA | Blocks resource safety if violated |
| Founder decisions | 3/3 decisions filled with founder/date | `FOUNDER_PRODUCT_DECISION_FORM.md` | Founder/Product Gate | Blocks product approval |
| Claim boundary | No docs claim production/human/visual approval without evidence | closeout scan | Atlas | Blocks final closeout |

## Subagent Review Output Schema

Every specialist subagent must report findings in this format:

```markdown
## Lane
Content/Pedagogy | UI/Visual | UX/Journey | E2E Browser | Engineering

## Scope
Files/screens/scenarios inspected:

## KPI Scores
- KPI name: pass | fail | partial | blocked | not checked

## Findings
| ID | Severity | Location | Evidence | Why it matters | Recommended fix | Validation method | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |

## Approval Boundary
What this review can claim:
What it cannot claim:

## Next Gate
Exact next action and owner:
```

## Severity Rules

Blocker:
- App cannot load, scenario cannot start/complete, data integrity breaks, critical validator fails, wrong feedback teaches a different answer, unsafe healthcare/product claim exists, or approval ledger is falsely upgraded.

High:
- Major learner trust or flow harm, severe mobile layout issue, inaccessible core control, incorrect answer alternatives, misleading feedback, or E2E failure on a changed core flow.

Medium:
- Confusing but recoverable UX, weak hierarchy, overly long/abstract feedback, questionable scenario category, missing helpful alternative, or non-blocking validation warning with learner impact.

Low:
- Polish, copy tightening, optional warning cleanup, minor spacing consistency, or documentation clarity.

## Parallel Review Workflow

1. Atlas opens a pass with scope, write boundary, and KPI targets.
2. Spawn specialist read-only subagents in parallel for Content, UI/Visual, UX/Journey, E2E Browser, and Engineering.
3. Each subagent writes or returns lane findings using the schema above.
4. Atlas deduplicates findings into `NEXT_QA_FINDINGS_AND_FIX_PLAN.md`.
5. Fix only Blocker/High issues first, with one narrow write set per fix.
6. Run focused validators/browser/E2E for the changed scope.
7. Update `PROGRESS_LOG.md` with commands, exit codes, screenshots, fixes, and remaining risks.
8. Named human/founder reviewers update approval artifacts only after reviewing the evidence.

## First Batch KPI Targets

For the first seven scenarios in `HUMAN_CONTENT_REVIEW_BATCH_BRIEF.md`:

| KPI | Target |
| --- | --- |
| Scenario coverage | 7/7 AI-reviewed by Content/Pedagogy lane |
| Category coverage | Social, Service/Logistics, Workplace, Academic, Healthcare, Community represented |
| Blank/chunk alignment | 0 High mismatches between answer, alternatives, and feedback |
| UK English issues | 0 unresolved High/Blocker UK English issues |
| Feedback usefulness | Each reviewed scenario has pass/fail notes for feedback transfer value |
| Healthcare safety | `healthcare-1-gp-appointment` remains blocked unless `PROD-003` is decided |
| Fix readiness | Every issue has location, evidence, recommended fix, and validation method |

## Visual Review KPI Targets

| KPI | Target |
| --- | --- |
| Screenshot coverage | 10/10 screenshots reviewed by AI pre-review and then named visual reviewer |
| Automated layout lint | 0 issues and mobile overflow delta 0px |
| Gross blocker scan | 0 obvious blocker/high layout failures in contact-sheet pre-review |
| Full-size review | Named reviewer checks full-size screenshots before visual approval |
| Accessibility prompt | Each screenshot row considers text fit, contrast, controls, and state clarity |

## Founder Gate KPIs

| Decision | KPI target | Blocks |
| --- | --- | --- |
| `PROD-001` | Selected option, founder, date, note | Advanced/service scenario approval |
| `PROD-002` | Selected option, founder, date, note | Desktop home visual/product direction |
| `PROD-003` | Selected option, founder, date, note | Healthcare scenario approval |

## Done Definitions

AI-ready:
- Specialist lanes have completed their review scope.
- Findings are in the issue schema.
- Blocker/High issues are fixed or explicitly blocked.
- Focused verifiers pass for changed scopes.

Human-approved:
- Named reviewer filled required ledger/checklist rows.
- Reviewer/date/evidence are present.
- Founder decisions are filled where required.

Production-ready:
- Out of scope for this QA operating model unless separately authorised with deployment, security, release, and production verification gates.
