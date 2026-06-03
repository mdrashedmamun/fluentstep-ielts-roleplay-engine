# Next Browser QA Plan

## Scope

This plan defines the next manual-plus-automated browser QA pass for FluentStep. It does not authorize source-code changes. Current automated browser QA has 10 screenshots and 0 automated issues, but manual visual review is still required.

## Environment

Primary local URL:

```bash
npm run qa:browser
```

Manual or E2E setup:

```bash
npm run dev -- --host 127.0.0.1 --port 3000
npm run test:e2e:tier1:local
```

Use live Vercel only as a comparison baseline, not the primary QA target.

## Exact Flows To Test

### Flow 1: Home and scenario discovery

Steps:
1. Load `http://127.0.0.1:3000`.
2. Verify home renders without console errors.
3. Inspect category tabs, filters/search/sort if visible, scenario cards, progress indicators, and empty states.
4. Confirm visible copy does not claim production readiness or human approval.

Screenshots:
- `desktop-home.png`
- `mobile-home.png`

### Flow 2: Scenario start

Steps:
1. Open `/scenario/service_1_restaurant_order`.
2. Verify title/context, characters, first dialogue state, and `Next Turn` control.
3. Check loading/onboarding skip state if present.
4. Confirm layout does not overlap at desktop or mobile widths.

Screenshots:
- `desktop-scenario-start.png`
- `mobile-roleplay.png`

### Flow 3: Blank reveal and answer feedback

Steps:
1. Advance to the first user blank.
2. Reveal the blank.
3. Confirm answer text, alternatives, close affordance, and feedback popover placement.
4. Confirm the answer shown matches the blank and is not `??`.
5. Check keyboard/touch target discoverability.

Screenshots:
- `desktop-blank-popover.png`

### Flow 4: Audio/pronunciation

Steps:
1. Locate listen/pronunciation control on a dialogue line.
2. Click it.
3. Check for console errors or failed `/api/tts` responses.
4. Confirm local fallback behavior does not break the flow.

Evidence:
- Browser report `consoleErrors` and `failedResponses`.
- Manual note if the control is hover-only or hard to discover.

### Flow 5: Completion and feedback

Steps:
1. Advance through the scenario until completion.
2. Click completion/mastery control.
3. Confirm completion feedback modal opens.
4. Inspect chunk feedback: relevance, readability, no overflow, no misleading claims.

Screenshots:
- `desktop-completion-feedback.png`

### Flow 6: Pattern summary and active recall

Steps:
1. Open Pattern Summary after completion.
2. Confirm pattern summary text fits and is scannable.
3. Start Active Recall.
4. Confirm modal opens, questions are readable, and exit/return behavior is clear.

Screenshots:
- `desktop-pattern-summary.png`
- `desktop-active-recall.png`

### Flow 7: Invalid scenario and error state

Steps:
1. Navigate to a non-existent scenario route.
2. Confirm error state is visible, understandable, and gives a recovery path.
3. Confirm no console errors or broken layout.

Screenshots:
- `desktop-invalid-scenario.png`

### Flow 8: Mobile viewport

Steps:
1. Use 390x844 viewport.
2. Repeat home and one roleplay start/reveal path.
3. Check text fit, tap targets, modal placement, and scroll behavior.

Screenshots:
- `mobile-home.png`
- `mobile-roleplay.png`

## Viewports

Desktop:
- 1440x1000 for main browser QA screenshots.
- Optional 1280x720 to match Python E2E fixture.

Mobile:
- 390x844 for iPhone-sized portrait review.
- Optional 360x740 for tighter text-fit review.

## Severity Definitions

Blocker:
- App route cannot load, local browser QA cannot run, scenario cannot start, blank reveal is broken, completion is unreachable, or critical console/network failure blocks learning.

High:
- Wrong answer/blank mapping, missing alternatives, inaccessible core control, severe mobile overflow, broken feedback modal, or audio/pronunciation flow breaks trust.

Medium:
- Confusing flow, weak visual hierarchy, hard-to-find control, inconsistent state, non-blocking console warning, awkward modal placement, or unclear recovery path.

Low:
- Minor spacing, copy polish, small inconsistency, non-critical visual mismatch, or documentation drift.

## Manual Visual Review Checklist

For every required screenshot, review:

- Layout: no overlap, clipping, or unreadable text.
- Hierarchy: next action is obvious.
- Responsiveness: desktop and mobile keep usable spacing and scroll behavior.
- Accessibility: buttons are visible, labelled, and targetable; text contrast appears adequate.
- State clarity: loading, empty, error, completed, and modal states are understandable.
- Roleplay flow: learner can move from scenario start to blank reveal to completion.
- Feedback clarity: answer, alternatives, chunk feedback, pattern summary, and active recall are readable.
- Motivation: progress and completion states feel useful without overclaiming.
- Claim boundary: no screenshot implies production approval or human content approval.

## Report Template

```markdown
# Browser QA Report: [date]

- Base URL:
- Browser/tool:
- Viewports:
- Scenario IDs:
- Commands run:
- Screenshots reviewed:
- Console errors:
- Failed responses:

## Summary

- Blocker:
- High:
- Medium:
- Low:

## Issues

### [Severity] [Short title]

- Location:
- Evidence:
- Expected:
- Actual:
- Why it matters:
- Recommended fix:
- Validation method:
- Status:

## Screenshots

- [name]: [path]

## Remaining Manual Decisions

- [decision needed]
```

## Stop Rules

Stop the browser QA pass if:

- Local app cannot start on `127.0.0.1:3000`.
- Browser tool cannot launch after an approved escalation attempt.
- A Blocker prevents the rest of the flow from being meaningfully tested.
- Any finding requires product judgement; record it rather than guessing.
