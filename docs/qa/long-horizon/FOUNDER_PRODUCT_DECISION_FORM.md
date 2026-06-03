# Founder Product Decision Form

Updated: 2026-06-03

Claim boundary: this form records founder/product decisions needed before content or visual approval. It does not approve content, visuals, production readiness, buyer readiness, deploy safety, legal safety, or commercial validation.

## How To Use

For each decision, select one option, add founder name/date, and update the linked artifact:
- `FOUNDER_AND_REVIEWER_DECISION_PACKET.md`
- `HUMAN_CONTENT_REVIEW_LEDGER.md`
- `VISUAL_SCREENSHOT_REVIEW_CHECKLIST.md` where relevant

No full E2E run is required to make these decisions. After a resulting source/content/UI change, run only the focused verifier listed for that decision plus the relevant baseline validator.

## Decision Summary

| ID | Decision Needed | Recommended Default | Blocks | Status |
| --- | --- | --- | --- | --- |
| PROD-001 | Category/positioning for `advanced-1-manager-escalation` | Move or label as Service/Logistics escalation unless Advanced explicitly means high-friction service negotiation | Human content approval for that scenario | private-beta default applied locally; founder signoff open |
| PROD-002 | Keep or reduce desktop media-first hero | Keep current fixed fallback for now; revisit after visual reviewer notes task-entry friction | Visual approval and any home redesign | default kept; named visual review open |
| PROD-003 | Healthcare learning-only disclaimer | Add lightweight learning-only disclaimer before approving or expanding healthcare scenarios | Healthcare scenario approval | private-beta default applied locally; founder/legal signoff open |

## PROD-001: Advanced vs Service/Logistics Escalation

Decision: Should `advanced-1-manager-escalation` remain in Advanced, or be moved/labelled as Service/Logistics escalation?

Current local state:
- Private-beta default has been applied in source: the scenario category is now `Service/Logistics`.
- This does not fill the founder decision fields below or mark the scenario human-approved.

Why it matters:
- Category controls learner expectations before they start the roleplay.
- If Advanced means complex language across any domain, the current category may be acceptable.
- If Service/Logistics owns customer-service escalation, the current category can misroute learners.

Recommended default:
- Move or label it as Service/Logistics escalation unless Advanced is intentionally defined as high-friction negotiation across domains.

Options:
- [ ] Keep as Advanced: Advanced means difficult negotiation/escalation regardless of domain.
- [ ] Move to Service/Logistics: service escalation belongs with other customer/service flows.
- [ ] Dual-label in UI later: keep source category but expose a secondary tag if supported.

Implementation effect:
- Keep as Advanced: no source change; content reviewer can evaluate under Advanced criteria.
- Move to Service/Logistics: update scenario category and rerun content validators plus focused scenario browser check.
- Dual-label: requires UI/data model decision and is not a quick QA fix unless secondary tags already exist.

Validation method if changed:
- `npm run validate:critical`
- `npm run validate:alternatives`
- `npm run qa-check -- --strict`
- Focused browser check for scenario card/category display.

Founder decision:
- Selected option:
- Founder:
- Decided at:
- Notes:

## PROD-002: Desktop Home Media-First Hero

Decision: Should desktop home keep the large media-first hero after the fallback fix, or should the product reduce/defer the media area to prioritise task entry?

Why it matters:
- Product primitive is fast IELTS roleplay practice and pattern fluency.
- Large media can create emotional polish, but it can also delay scenario selection if it dominates the first viewport.
- Automated browser and layout lint are clean, but manual visual approval is still incomplete.

Recommended default:
- Keep the current fixed fallback for now, and only redesign if the visual reviewer says the hero slows task entry or weakens hierarchy.

Options:
- [ ] Keep current hero/fallback: no immediate UI change; proceed to manual visual review.
- [ ] Reduce hero prominence: make scenario selection more dominant on desktop.
- [ ] Defer media until after scenario selection: prioritise utility over ambience.

Implementation effect:
- Keep current: no code change; visual reviewer decides approval or issue.
- Reduce/defer: source changes likely in home/layout/media components and require screenshot refresh.

Validation method if changed:
- `npm run type-check`
- `npm run build`
- `npm run qa:browser`
- `npm run qa:visual-lint`
- Manual review of refreshed `desktop-home.png` and `mobile-home.png`.

Founder decision:
- Selected option:
- Founder:
- Decided at:
- Notes:

## PROD-003: Healthcare Learning-Only Disclaimer

Decision: Should Healthcare scenarios display a visible learning-only disclaimer before approval or expansion?

Current local state:
- Private-beta default has been applied in UI: Healthcare scenario start displays a visible learning-only disclaimer.
- Browser QA captured `desktop-healthcare-disclaimer.png` and reported 0 automated issues.
- This does not fill founder/legal/human approval fields below.

Why it matters:
- Healthcare roleplays can be misconstrued as medical advice even when intended for language practice.
- `healthcare-1-gp-appointment` includes symptoms, tests, referral timing, prescription language, and follow-up instructions.
- Approval should not rely on automation alone because the risk is product/legal positioning.

Recommended default:
- Add a lightweight learning-only disclaimer before approving or expanding healthcare content.

Options:
- [ ] Add scenario-level disclaimer for Healthcare scenarios.
- [ ] Add global learning-only disclaimer covering all roleplays, with Healthcare examples called out where needed.
- [ ] Do not add disclaimer; keep healthcare as ordinary language-practice content.
- [ ] Block Healthcare category until legal/product review.

Implementation effect:
- Scenario-level disclaimer: likely UI/data change to show a short notice on Healthcare scenario start/detail.
- Global disclaimer: broader product copy and layout decision.
- No disclaimer: reviewer may still request phrasing changes inside Healthcare dialogue.
- Block category: keep healthcare rows blocked and exclude from approval claims.

Validation method if changed:
- `npm run type-check`
- `npm run build`
- `npm run validate:critical`
- Focused browser check for Healthcare scenario start.
- Manual reviewer confirmation that disclaimer is visible and not overbearing.

Founder decision:
- Selected option:
- Founder:
- Decided at:
- Notes:

## Completion Rule

This form is complete only when all three decisions have selected options, founder/date fields are filled, and linked ledgers/checklists are updated. Until then, the relevant content and visual gates remain open or blocked.
