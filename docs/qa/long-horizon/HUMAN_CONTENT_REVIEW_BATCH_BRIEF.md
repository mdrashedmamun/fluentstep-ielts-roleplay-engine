# Human Content Review Batch Brief

Updated: 2026-06-02

Claim boundary: this is a reviewer briefing for the first seven-scenario batch. It does not approve content, replace a named human reviewer, claim IELTS pedagogy approval, claim production readiness, or claim deploy safety.

## How To Use This Brief

Use this with `HUMAN_CONTENT_REVIEW_PLAN.md` and update final review state in `HUMAN_CONTENT_REVIEW_LEDGER.md` only after a named reviewer completes the checklist.

Reviewer output required per scenario:
- Human State: `approved`, `changes-requested`, or `blocked`.
- Reviewer name.
- Reviewed At date/time.
- Short notes with any issue ID or product decision needed.

Do not run full `npm run test:e2e` for this review. If a content fix is requested, use targeted validators and focused browser/E2E checks for the changed scenario only.

## Batch Summary

| Order | Scenario ID | Category | Topic | Schema | Blank Count | Review Focus | Current Gate |
| --- | --- | --- | --- | --- | ---: | --- | --- |
| 1 | `social-1-flatmate` | Social | Meeting a New Flatmate | V1 | 10 | First-meeting naturalness, shared-house tone, `keep clean` feedback fix | Human approval required |
| 2 | `service-1-cafe` | Service/Logistics | At a Cafe (Three Minute Flow) | V1 | 21 | Cafe ordering flow, repair phrase, empty alternatives on `cash` | Human approval required |
| 3 | `service_1_restaurant_order` | Service/Logistics | Restaurant Ordering | V2 | 27 | Post-fix restaurant content, dietary/allergy handling, bill-splitting language | Human approval required |
| 4 | `workplace-1-disagreement` | Workplace | Workplace Disagreement | V1 | 9 | Polite disagreement, risk language, workplace transferability | Human approval required |
| 5 | `academic-1-tutorial-discussion` | Academic | University Tutorial - Essay Planning | V1 | 12 | Academic register, IELTS transferability, overly elite/specific framing risk | Human approval required |
| 6 | `healthcare-1-gp-appointment` | Healthcare | GP Appointment - Chronic Condition Discussion | V2 | 27 | Medical-positioning risk, learning-only disclaimer, symptom/test phrasing | Founder decision before approval |
| 7 | `community-1-council-meeting` | Community | Council Meeting - Local Development Proposal | V2 | 34 | Formal civic tone, British spelling, public-record phrasing, length/difficulty | Human approval required |

## Scenario Review Notes

### `social-1-flatmate`

Source location: `src/services/staticData.ts` near `id: "social-1-flatmate"`.

Automated/post-fix context:
- FS-QA-001 was fixed locally: blank 3 now teaches `clean` / `keep clean` rather than mismatched `keep track` feedback.
- V1 feedback covers `meet`, `clean`, and `friendly`.

Reviewer checks:
- Does the dialogue sound like a realistic UK shared-house first meeting?
- Is `London` as the default answer too narrow, or acceptable as an editable scenario answer with alternatives?
- Are `keep clean`, `Nice to meet you`, and `friendly` valuable enough for IELTS-style speaking practice?
- Do the alternatives preserve sentence meaning without creating odd phrasing?

Decision options:
- Approve if the shared-house tone and blank value are acceptable.
- Request changes if the scenario feels too generic, too scripted, or if `London` should be replaced with a less location-specific answer.

### `service-1-cafe`

Source location: `src/services/staticData.ts` near `id: "service-1-cafe"`.

Automated context:
- Tier 1 E2E sample.
- V1 feedback covers `sorry to bother you` and `really appreciate it` through chunk entries for `bother` and `appreciate`.

Reviewer checks:
- Does the cafe flow feel natural across ordering, payment, problem repair, and thanks?
- Is the blanking strategy too granular in places, such as `flat` + `white` split across two blanks?
- Is answer index 9 `cash` acceptable with no listed alternatives in this V1 scenario?
- Are `sorry to bother you` and `I really appreciate it` strong reusable patterns for learners?

Decision options:
- Approve if the flow is natural and the empty `cash` alternatives are acceptable.
- Request changes if the drink phrase should be treated as a whole chunk or if `cash` needs alternatives.

### `service_1_restaurant_order`

Source location: `src/services/staticData.ts` near `id: "service_1_restaurant_order"`.

Automated/post-fix context:
- FS-QA-002/003/004/007 were fixed locally.
- All 27 blanks now have alternatives through `validate:alternatives` evidence.
- V2 feedback now includes the full service phrase `get you started` and the active-recall phrase `That sounds good`.

Reviewer checks:
- Does the restaurant flow feel like a plausible UK service conversation rather than a scripted training dialogue?
- Are allergy phrases careful enough without becoming medical/legal advice?
- Are phrases like `get you started`, `tell me about`, `That sounds good`, `prepare`, `split`, and `splitting it` worth teaching?
- Are alternatives semantically safe in context, especially `allergy`, `carefully`, `safely`, `separately`, and bill-splitting variants?

Decision options:
- Approve if the revised service chunks and allergy handling are acceptable.
- Request changes if allergy safety needs stronger wording or if any alternatives create unsafe/awkward meaning.

### `workplace-1-disagreement`

Source location: `src/services/staticData.ts` near `id: "workplace-1-disagreement"`.

Automated context:
- Tier 1 E2E sample.
- V1 feedback covers `different view` and `flag a concern`.

Reviewer checks:
- Does the disagreement flow model polite but clear workplace speech?
- Are the blanks useful patterns rather than abstract business vocabulary?
- Does `I just wanted to flag this concern before we commit` feel transferable to IELTS speaking and workplace conversation?
- Are risk/rollout terms too corporate for general IELTS learners, or useful as advanced speaking practice?

Decision options:
- Approve if workplace register and transfer value are acceptable.
- Request changes if it is too business-specific or if phrase difficulty should be lowered.

### `academic-1-tutorial-discussion`

Source location: `src/services/staticData.ts` near `id: "academic-1-tutorial-discussion"`.

Automated context:
- Representative Academic sample.
- V1 feedback covers `in two minds` and `bear in mind`.

Reviewer checks:
- Is the `Oxford/Cambridge` context too elite/specific for broad IELTS speaking practice?
- Does the tutor dialogue sound natural, or too stylised/formal?
- Is `Would you mind awfully if I run you my draft next week?` useful British English or too unnatural for target learners?
- Are academic phrases such as `in two minds`, `unpacking`, `incorporate`, `bear in mind`, and `run ... draft` well-targeted?

Decision options:
- Approve if the scenario is intentionally higher-register academic practice.
- Request changes if the context should be made more general, e.g. `university tutorial` without Oxford/Cambridge framing.
- Block if product direction needs to decide how specialised Academic scenarios should be.

### `healthcare-1-gp-appointment`

Source location: `src/services/staticData.ts` near `id: "healthcare-1-gp-appointment"`.

Automated context:
- Representative Healthcare sample.
- V2 feedback covers symptom duration, patterns, stress, nausea, investigations, referral process, follow-up, diary tracking, and next steps.

Reviewer checks:
- This scenario should not be approved until founder/product decides whether Healthcare scenarios need a visible learning-only disclaimer.
- Does the dialogue avoid giving medical advice while still teaching clear appointment language?
- Are phrases like `rule anything serious out`, `referral`, `hear back within a fortnight`, `keep a diary`, and `take it from there` useful and safe?
- Is `issue this prescription for a mild option` too advice-like without specifying context/disclaimer?
- Are symptom descriptions realistic but not alarming or diagnostic?

Decision options:
- Block pending `PROD-003` if no healthcare disclaimer/product position exists.
- Request changes if medical phrasing should be softened or if explicit learning-only framing is needed inside the scenario.
- Approve only after product/legal positioning is resolved and reviewer checklist passes.

### `community-1-council-meeting`

Source location: `src/services/staticData.ts` near `id: "community-1-council-meeting"`.

Automated/post-fix context:
- FS-QA-005 was fixed locally: British spelling contrast now uses `organized` -> `organised`.
- V2 feedback includes formal civic phrases such as `outline`, `opportunity`, `organised`, `feedback`, `cope with`, `raised`, `submitted`, `reject outright`, and `send it back`.

Reviewer checks:
- Does the public-record tone feel respectful and firm without becoming legalistic?
- Is the scenario too long or difficult for the target learner level?
- Are the civic phrases reusable for IELTS speaking, especially describing opinions, objections, and community issues?
- Does the fixed British spelling explanation for `organised` feel useful rather than pedantic?

Decision options:
- Approve if the formal civic tone and length are acceptable.
- Request changes if it needs shortening, simplification, or more conversational phrasing.

## Reviewer Completion Checklist For This Batch

For each scenario, record:
- `Human State`
- `Reviewer`
- `Reviewed At`
- One-line decision note in `HUMAN_CONTENT_REVIEW_LEDGER.md`

If changes are requested, create or record a scoped issue with:
- Severity
- Location
- Evidence
- Why it matters
- Recommended fix
- Validation method

If blocked, record the exact founder/product decision needed.
