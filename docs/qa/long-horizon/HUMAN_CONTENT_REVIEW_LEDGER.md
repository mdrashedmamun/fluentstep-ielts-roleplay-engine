# Human Content Review Ledger

Updated: 2026-06-03

Claim boundary: this ledger tracks review work only. It does not approve content, claim production readiness, claim buyer readiness, claim deploy safety, or replace a named human reviewer.

## Review States

- `not-reviewed`: no named human review record exists.
- `changes-requested`: reviewer found issues requiring scoped edits.
- `approved`: reviewer completed all checklist items, added reviewer and date, and approved.
- `blocked`: product/founder judgement is needed before approval.

## Required Human Checklist

For `approved`, every item must be true: IELTS relevance, natural spoken English, British English, blank/chunk quality, feedback usefulness, active recall value, speaking relevance, and no unsupported product/exam/legal claims.

## Scenario Ledger

| # | Scenario ID | Category | Topic | Review Priority | Human State | Reviewer | Reviewed At | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `social-1-flatmate` | Social | Meeting a New Flatmate | Post-fix review | not-reviewed |  |  | AI pre-reviewed pass; FS-QA-001 fixed locally; human approval still required. |
| 2 | `service-1-cafe` | Service/Logistics | At a Café (Three Minute Flow) | Representative sample | not-reviewed |  |  | AI pre-reviewed; FS-CONTENT-AI-001 fixed locally for cash alternatives; human approval still required. |
| 3 | `service-2-airport` | Service/Logistics | Airport Check-In Flow | Standard full review | not-reviewed |  |  |  |
| 4 | `service-3-hotel-full` | Service/Logistics | Hotel Check-In | Standard full review | not-reviewed |  |  |  |
| 5 | `service-4-return-no-receipt` | Service/Logistics | Returning a Faulty Item | Standard full review | not-reviewed |  |  |  |
| 6 | `advanced-1-manager-escalation` | Service/Logistics | Manager Escalation (Hard) | Post-default founder signoff | not-reviewed |  |  | AI pre-reviewed; private-beta default applied locally by moving to Service/Logistics escalation. Founder signoff and human approval still required. |
| 7 | `advanced-2-manager-no` | Advanced | When the Manager Says No | Standard full review | not-reviewed |  |  |  |
| 8 | `workplace-1-disagreement` | Workplace | Workplace Disagreement | Representative sample | not-reviewed |  |  | Tier 1 E2E sample and representative Workplace sample candidate. |
| 9 | `advanced-3-manager-pushback` | Advanced | Manager Pushes Back Harder | Standard full review | not-reviewed |  |  |  |
| 10 | `workplace-2-feedback` | Workplace | Negative Feedback on a Report | Standard full review | not-reviewed |  |  |  |
| 11 | `social-2-catch-up` | Social | Catching Up with an Old Friend | Standard full review | not-reviewed |  |  |  |
| 12 | `social-3-weekend-plans` | Social | Changing Weekend Plans | Standard full review | not-reviewed |  |  |  |
| 13 | `workplace-3-disagreement-polite` | Workplace | Polite Disagreement at Work | Standard full review | not-reviewed |  |  |  |
| 14 | `workplace-4-asking-help` | Workplace | Asking for Help (Without Weakness) | Standard full review | not-reviewed |  |  |  |
| 15 | `social-4-daily-routines` | Social | Daily Life & Routines | Standard full review | not-reviewed |  |  |  |
| 16 | `advanced-4-honesty-tact` | Advanced | Honest Opinion (Tactful) | Standard full review | not-reviewed |  |  |  |
| 17 | `social-5-running-into` | Social | Running into Someone | Standard full review | not-reviewed |  |  |  |
| 18 | `service-5-security` | Service/Logistics | Airport Security | Standard full review | not-reviewed |  |  |  |
| 19 | `workplace-5-marketing-sync` | Workplace | Marketing Sync-up | Standard full review | not-reviewed |  |  |  |
| 20 | `social-6-career-decisions` | Social | Talk about Career Decisions | Standard full review | not-reviewed |  |  |  |
| 21 | `social-7-house-rules` | Social | Settling Into a London Shared House | Standard full review | not-reviewed |  |  |  |
| 22 | `social-8-old-friend` | Social | Catching Up with an Old Friend | Standard full review | not-reviewed |  |  |  |
| 23 | `social-9-weekend-plans` | Social | Making Weekend Plans | Standard full review | not-reviewed |  |  |  |
| 24 | `advanced-2-moving-house` | Advanced | Shifting to a New House | Standard full review | not-reviewed |  |  |  |
| 25 | `social-10-new-neighbor` | Social | Meeting a New Neighbour | Standard full review | not-reviewed |  |  | AI pre-reviewed; visible learner copy uses UK spelling while stable ID remains unchanged. |
| 26 | `workplace-6-proposal-feedback` | Workplace | Giving Feedback on a Proposal | Standard full review | not-reviewed |  |  |  |
| 27 | `workplace-7-ask-help` | Workplace | Asking for Help at Work | Standard full review | not-reviewed |  |  |  |
| 28 | `workplace-8-handle-mistake` | Workplace | Handling a Mistake at Work | Standard full review | not-reviewed |  |  |  |
| 29 | `service-8-restaurant-order` | Service/Logistics | Ordering at a Restaurant | Standard full review | not-reviewed |  |  |  |
| 30 | `service-9-return-faulty` | Service/Logistics | Returning a Faulty Item | Standard full review | not-reviewed |  |  |  |
| 31 | `service-10-hotel-checkout` | Service/Logistics | Hotel Checkout with Issues | Standard full review | not-reviewed |  |  |  |
| 32 | `service-31-cafe-full-flow` | Service/Logistics | At a Café (Full 3-Minute Flow) | Standard full review | not-reviewed |  |  |  |
| 33 | `service-32-airport-checkin` | Service/Logistics | Airport Check-In (Full 3-Minute Flow) | Standard full review | not-reviewed |  |  |  |
| 34 | `service-33-hotel-checkin` | Service/Logistics | Hotel Check-In (Fill the Blanks) | Standard full review | not-reviewed |  |  |  |
| 35 | `service-34-shopping-return` | Service/Logistics | Shopping Return / Refund | Standard full review | not-reviewed |  |  |  |
| 36 | `workplace-31-disagreement` | Workplace | Workplace Disagreement (Calm Resolution) | Standard full review | not-reviewed |  |  |  |
| 37 | `social-31-catching-up` | Social | Catching Up with an Old Friend | Standard full review | not-reviewed |  |  |  |
| 38 | `advanced-5` | Advanced | Negotiating Business Partnership Terms | Standard full review | not-reviewed |  |  |  |
| 39 | `workplace-32` | Workplace | Performance Review and Career Advancement | Standard full review | not-reviewed |  |  |  |
| 40 | `advanced-6` | Advanced | Debating Environmental Sustainability | Standard full review | not-reviewed |  |  |  |
| 41 | `advanced-virtual-meetings` | Advanced | Adjusting to Virtual Meeting Culture | Standard full review | not-reviewed |  |  |  |
| 42 | `advanced-ai-displacement` | Advanced | Debating AI and Job Displacement | Standard full review | not-reviewed |  |  |  |
| 43 | `advanced-sustainability` | Advanced | Corporate Sustainability and Profit Tensions | Standard full review | not-reviewed |  |  |  |
| 44 | `advanced-language-learning` | Advanced | Strategies for Effective Language Acquisition | Standard full review | not-reviewed |  |  |  |
| 45 | `youtube-social-english-conversations-1705402200` | Social | English Learning - Real-Life Conversations | Standard full review | not-reviewed |  |  |  |
| 46 | `academic-1-tutorial-discussion` | Academic | University Tutorial - Essay Planning | Representative sample | not-reviewed |  |  | AI pre-reviewed; run-by phrase fixed and Oxford/Cambridge framing generalised locally; human approval still required. |
| 47 | `healthcare-1-gp-appointment` | Healthcare | GP Appointment - Chronic Condition Discussion | Post-disclaimer founder/legal signoff | blocked |  |  | AI pre-reviewed; alternatives fixed and visible learning-only disclaimer implemented with browser screenshot evidence. Keep blocked until founder/legal/human approval. |
| 48 | `cultural-1-theatre-booking` | Cultural | Theatre Box Office - Complex Seating Request | Standard full review | not-reviewed |  |  |  |
| 49 | `community-1-council-meeting` | Community | Council Meeting - Local Development Proposal | Representative sample | not-reviewed |  |  | AI pre-reviewed changes-requested/level check; FS-QA-005 fixed locally; FS-CONTENT-AI-006 difficulty/length judgement remains. |
| 50 | `workplace-1-performance-review` | Workplace | Annual Performance Review - Career Development Discussion | Standard full review | not-reviewed |  |  |  |
| 51 | `service-1-estate-agent-viewing` | Service/Logistics | Estate Agent Property Viewing - Negotiating Terms | Standard full review | not-reviewed |  |  |  |
| 52 | `service-35-landlord-repairs` | Service/Logistics | Negotiating Home Repairs with Your Landlord | Post-fix review | not-reviewed |  |  | AI pre-reviewed; blank 32 feedback now aligns to `commitment`; human approval still required. |
| 53 | `service_1_restaurant_order` | Service/Logistics | Restaurant Ordering | Post-fix review | not-reviewed |  |  | AI pre-reviewed pass/watch; FS-QA-002/003/004/007 fixed locally; allergy wording still requires human review. |

## AI Pre-Review Coverage

- Content/Pedagogy AI pre-review: 53/53 scenarios completed by specialist subagent wave.
- This is not human approval; all scenarios still require named reviewer evidence before `approved`.
- Objective Blocker/High Codex-fixable issues from the AI wave have been fixed locally or kept blocked only where founder/legal/human signoff is required.

## Current Counts

- Total scenarios extracted from `CURATED_ROLEPLAYS`: 53
- Human approved: 0
- Human not reviewed: 52
- Blocked: 1

## Next Review Batch

Founder decision form: use `FOUNDER_PRODUCT_DECISION_FORM.md` to resolve the two currently blocked content rows before approval.


Start with the seven representative/sample or post-fix scenarios: `social-1-flatmate`, `service-1-cafe`, `service_1_restaurant_order`, `workplace-1-disagreement`, `academic-1-tutorial-discussion`, `healthcare-1-gp-appointment`, and `community-1-council-meeting`.
