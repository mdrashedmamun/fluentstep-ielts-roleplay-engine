# Human Content Review Plan

## Scope

This plan defines human review for all 53 FluentStep scenarios. Automated validators currently pass locally, but they do not approve IELTS quality, learner usefulness, or final content quality.

Claim boundary: no scenario is human-approved until it has an explicit approved review record.

## Current Evidence

Automated evidence recorded in `PROGRESS_LOG.md`:
- 53 scenarios passed `qa-check --strict`.
- Final approval summary remains `0 approved, 53 needs human review, 0 blocked`.
- `audit:report` generated 1409 approval-required suggestions.
- `validate:critical` has 0 critical errors and 14 non-blocking `social-7-house-rules` chunk ID warnings.

## Approval States

Use these states consistently:

- `not-reviewed`: no human review started.
- `sample-reviewed`: included in representative sample; notes exist, but not final approval.
- `changes-requested`: reviewer found issues requiring scoped edits.
- `approved`: reviewer completed checklist, added reviewer name and date, and approved.
- `blocked`: product judgement needed before approval.

For staging scenarios, `scripts/stagingValidateContent.ts` Gate 4 expects a JSON review file with:

- `status: approved`
- non-empty `reviewer`
- non-empty `reviewedAt`
- all checklist booleans true

## Parallel AI Pre-Review

Before named human approval, use `PARALLEL_SUBAGENT_QA_KPI_OPERATING_MODEL.md` to run Content/Pedagogy AI pre-review. AI may mark scenarios `ai-reviewed` in notes or linked issue packets, but only a named human reviewer can set `approved`.

## Review Strategy

Reviewer batch brief: use `HUMAN_CONTENT_REVIEW_BATCH_BRIEF.md` for the first seven-scenario review surface before updating ledger states.


### Phase 1: Representative sampling

Review at least one scenario from each major category before full review:

- Social
- Workplace
- Service/Logistics
- Advanced
- Healthcare
- Community

Suggested sample based on current E2E and product coverage:

- `social-1-flatmate`
- `service-1-cafe`
- `service_1_restaurant_order`
- `workplace-1-disagreement`
- `academic-1-tutorial-discussion`
- `healthcare-1-gp-appointment`
- `community-1-council-meeting`

Sampling goal:
- Find systemic issues before reviewing all 53 scenarios.
- Calibrate reviewer standards for IELTS relevance, spoken tone, British English, blanks, feedback, and recall.

### Phase 2: Full scenario review

Review all 53 scenarios after sampling rules are stable.

Full review order:
1. Scenarios with browser/E2E coverage.
2. V2 scenarios with `blanksInOrder`, `chunkFeedbackV2`, `patternSummary`, and `activeRecall`.
3. Legacy V1 scenarios with deep dive/chunk feedback.
4. Any scenarios flagged by `audit:report` or `qa-check` suggestions.
5. Remaining scenarios by category.

## Review Criteria

### IELTS relevance

Check:
- Scenario is plausible for IELTS-style speaking practice.
- Topic is broadly speakable without specialist knowledge.
- Learner can transfer phrases into real speaking contexts.
- Scenario does not drift into obscure professional, legal, medical, or technical advice.

Reject or request changes if:
- The scenario is too niche for IELTS speaking practice.
- It teaches memorized scripts rather than reusable speaking patterns.
- It makes unsupported claims about exam outcomes.

### Natural spoken English

Check:
- Learner lines sound like real spoken responses.
- Conversation has turn-by-turn coherence.
- Repairs, softening, disagreement, and exits sound natural.
- Dialogue avoids stiff written phrases unless context demands formality.

Reject or request changes if:
- Lines sound translated, robotic, over-formal, or unnatural.
- The answer fits grammar but not conversation.
- Speaker emotion or response timing feels implausible.

### British English

Check:
- British spelling and vocabulary are used where relevant.
- Register fits UK conversational norms.
- Terms such as `holiday`, `organised`, `favour`, `recognise`, and `minimise` are used correctly.

Reject or request changes if:
- US vocabulary or spelling appears in learner-facing text without reason.
- British terms are forced or unnatural.
- Tone does not match everyday UK conversation.

### Blank and chunk quality

Check:
- Each blank has one clear target answer.
- Alternatives fit the exact sentence and keep the same pragmatic function.
- Blanks teach reusable patterns, not random low-value vocabulary.
- Chunk IDs and feedback references map to the correct blank.

Reject or request changes if:
- A blank can be filled many unrelated ways.
- Alternatives change meaning or grammar.
- Feedback points to the wrong answer.
- The blank teaches a throwaway word instead of a pattern.

### Feedback quality

Check:
- Chunk feedback explains when and why to use the phrase.
- Examples are short, natural, and transferable.
- Non-native contrast is accurate and not patronizing.
- Deep-dive fallback is understandable for legacy scenarios.

Reject or request changes if:
- Feedback merely defines vocabulary.
- Feedback is too long, abstract, or academic.
- It gives misleading usage guidance.

### Active recall quality

Check:
- Recall prompts test reusable chunk knowledge.
- Target chunk IDs are valid.
- Expected answers and hints are aligned.
- The task reinforces speaking patterns, not trivia.

Reject or request changes if:
- Recall prompt is ambiguous.
- Answer cannot be inferred from taught material.
- Prompt teaches content outside the scenario.

## Review Record Template

```markdown
# Human Content Review: [scenario ID]

- Reviewer:
- Reviewed at:
- Category:
- Status: not-reviewed | sample-reviewed | changes-requested | approved | blocked

## Checklist

- IELTS relevance:
- Natural spoken English:
- British English:
- Blank/chunk quality:
- Feedback quality:
- Active recall quality:
- No unsupported claims:

## Findings

### [Severity] [Short title]

- Location:
- Evidence:
- Why it matters:
- Recommended fix:
- Validation method:
- Product judgement needed: yes/no

## Approval Decision

- Decision:
- Conditions:
- Follow-up owner:
```

## Founder/Product Judgement Boundaries

Mark `BLOCKED` when deciding:

- Whether a scenario belongs in the product at all.
- Whether difficulty level matches target learner segment.
- Whether a phrase is pedagogically worth teaching.
- Whether tone should be casual, neutral, formal, or exam-like.
- Whether an IELTS scenario should be removed, rewritten, or reframed.

## Completion Criteria

Human content review is complete only when:

- All 53 scenarios have a review state.
- Every `changes-requested` scenario has a scoped follow-up issue.
- Every `approved` scenario has reviewer, date, checklist, and evidence.
- All `blocked` scenarios have exact decisions needed.
- No automated pass is described as human approval.
