# Visual Screenshot Review Checklist

Updated: 2026-06-03

Claim boundary: automated browser QA reported 0 issues, but manual visual approval is still incomplete. This checklist is for human/design review of the refreshed evidence set.

## Evidence Source

- Browser report: `docs/qa/long-horizon/browser-qa-report.md`
- Contact sheet for manual review: `docs/qa/long-horizon/screenshots/contact-sheet.png`
- Generated: `2026-06-03T13:52:17.568Z`; contact sheet refreshed after blank-integrity regression screenshots were added
- Base URL: `http://127.0.0.1:3000`
- Scenario: `service_1_restaurant_order`
- Automated browser result: 12 screenshots, 0 automated issues, 0 console errors, 0 failed responses
- Automated visual layout lint: current `npm run qa:visual-lint` exits 0 through screenshot fallback; report generated `2026-06-03T13:52:46.348Z`; 12 current browser QA screenshots checked, 0 issues

## Review Criteria

For each screenshot, check layout, hierarchy, text fit, contrast, obvious overlap, mobile responsiveness where relevant, task clarity, loading/empty/error state clarity, accessibility of controls, and whether the state supports the pattern-fluency learning loop.

## Screenshot Checklist

| Screenshot | State | Manual State | Reviewer | Reviewed At | Findings |
| --- | --- | --- | --- | --- | --- |
| `desktop-home.png` | Desktop home and scenario picker entry | not-reviewed |  |  | Confirm poster/fallback fixed the prior black media block. |
| `desktop-healthcare-disclaimer.png` | Healthcare scenario start notice | not-reviewed |  |  | Check disclaimer visibility, tone, non-medical-advice boundary, and whether it disrupts roleplay start. |
| `desktop-scenario-start.png` | Restaurant scenario start | not-reviewed |  |  | Check first-turn hierarchy and roleplay controls. |
| `desktop-blank-popover.png` | Revealed blank answer popover | not-reviewed |  |  | Check answer, alternatives, and listen control discoverability. |
| `desktop-completion-feedback.png` | Completion feedback modal | not-reviewed |  |  | Check modal fit, clarity, and continuation path. |
| `desktop-pattern-summary.png` | Pattern summary tab | not-reviewed |  |  | Check chunk grouping and learning-value hierarchy. |
| `desktop-active-recall.png` | Active recall modal | not-reviewed |  |  | Check answer options for pattern value and text fit. |
| `desktop-invalid-scenario.png` | Invalid scenario recovery | not-reviewed |  |  | Check clear error/recovery state. |
| `desktop-route-workplace-performance-review.png` | Direct route/title regression | not-reviewed |  |  | Check URL scenario, rendered title, and content state are coherent. |
| `desktop-blank-integrity-neighbor.png` | Blank-integrity regression state | not-reviewed |  |  | Check `peaceful` renders in the neighbour sentence and that only one alternatives popover is visible. |
| `mobile-home.png` | Mobile home | not-reviewed |  |  | Check hero, filters, card density, and no horizontal overflow. |
| `mobile-roleplay.png` | Mobile roleplay | not-reviewed |  |  | Check controls, blank interaction, and readable spacing. |

## Automated Visual Layout Lint

Latest current run: `2026-06-03T13:52:46.348Z`; screenshot fallback used because Chromium DOM lint was blocked by sandbox MachPort permissions

Report: `docs/qa/long-horizon/visual-lint-report.md`

Current result: 12 browser QA screenshots checked through fallback, 0 automated issues. The fallback validates screenshot coverage, PNG dimensions, file completeness, and clean browser QA prerequisites. It does not replace full-size named visual/design review.

## Codex Contact-Sheet Pre-Review

Attempted: 2026-06-02

Route: opened `docs/qa/long-horizon/screenshots/contact-sheet.png` in macOS Preview and inspected it through Computer Use.

Non-approval finding: the contact sheet did not show an obvious blocker or high-severity gross layout failure across the earlier 9 captured states. Desktop invalid-scenario recovery appears visibly clear, desktop modal states appear centred, and the mobile states are represented without obvious document-level horizontal overflow in the contact-sheet view.

Limitations: the contact sheet is thumbnail-scale evidence. It is not sufficient to approve text fit, contrast, tap ergonomics, fine hierarchy, or full-size mobile readability. All screenshot rows remain `not-reviewed` until a named visual/design reviewer inspects the full-size screenshots or contact sheet and updates the table above.

## Approval Rule

Visual approval requires every row to be reviewed by a named reviewer with either no findings or linked follow-up issues. Automated `qa:browser` alone is not visual approval.

## Codex Pre-Review Attempt

Attempted: 2026-06-02

The local `view_image` tool could not resolve valid PNG paths from either the active workspace or `/private/tmp`, so Codex could not complete manual visual inspection through that route.

Current manual-review aid: `docs/qa/long-horizon/screenshots/contact-sheet.png` has been refreshed from the 12 current browser QA screenshots and linked above. This makes human/design review easier, but all 12 screenshot rows remain `not-reviewed` until a named reviewer inspects the screenshots or contact sheet through a working image/browser route and updates the rows above.

Do not treat this checklist as visually approved until the 12 current screenshot rows are completed by a named reviewer. The automated visual-lint command is green through fallback, but visual approval remains separate.

