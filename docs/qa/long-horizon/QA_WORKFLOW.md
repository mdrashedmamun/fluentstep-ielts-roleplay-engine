# FluentStep Long-Horizon QA Workflow

## Browser QA Route

Primary route: local Playwright against `http://127.0.0.1:3000`.

Run:

```bash
npm run qa:browser
```

The script starts `npm run dev -- --host 127.0.0.1 --port 3000` if the app is not already reachable, captures desktop and mobile screenshots, and writes:

- `docs/qa/long-horizon/browser-qa-report.md`
- `docs/qa/long-horizon/browser-qa-report.json`
- `docs/qa/long-horizon/screenshots/*.png`

Use live Vercel only as a comparison baseline. Python E2E defaults to live deployment but supports `E2E_BASE_URL`; local tier-1 E2E should use `npm run test:e2e:tier1:local` while the local app is running.

## Validation Commands

Baseline gates:

```bash
npm run validate:critical
npm run qa-check --strict
npm run audit:report
npm run type-check
npm run build
npm run qa:browser
```

Additional content gates:

```bash
npm run validate
npm run validate:feedback
npm run validate:alternatives
npm run qa-test
```

Existing E2E:

```bash
npm run test:e2e:tier1:local
npm run test:e2e:tier1
npm run test:e2e
```

Note: `npm run qa-check --strict` is supported by the CLI for the current repo, but npm prints a warning because npm treats `--strict` as npm config. `npm run qa-check -- --strict` avoids that npm warning.

## Pass/Fail Rules

- `validate:critical`, `type-check`, and `build` must exit 0 before implementation claims can move beyond local setup.
- `qa-check --strict` must exit 0 for automated content hard gates. A result of `needs-human-review` is allowed only when findings are suggestions, not warnings or criticals.
- `qa:browser` must exit 0 and produce screenshots. Any Blocker issue in the report blocks closeout.
- `audit:report` is report-only. Do not auto-apply audit fixes without a scoped content-data edit decision.
- Existing Python E2E failures must be classified by target URL and environment before being treated as app regressions.

## Human Reviewer Checklist

For each representative scenario, review:

- IELTS relevance: scenario is broadly speakable without specialist knowledge.
- UK English: spelling, vocabulary, and everyday tone are British and natural.
- Blanks: each blank has one clear answer, valid alternatives, and useful transfer value.
- Chunk feedback: feedback explains when to use the pattern, not just what it means.
- Deep dive fallback: legacy feedback remains understandable and mapped to the right answer.
- Active recall: prompts test reusable patterns and reference valid chunk IDs.
- UI flow: learner can start, reveal, listen, understand feedback, complete, and return.
- Accessibility: controls are discoverable, keyboard-targetable, and readable on mobile.

## Common Fixes

- US spelling or vocabulary: use UK equivalents such as `organised`, `favour`, `holiday`, `recognise`, and `minimise`.
- Duplicate alternatives: replace with a true equivalent that fits the same sentence.
- Blank mismatch: count actual `________` markers and align `answerVariations`, `blanksInOrder`, and feedback arrays.
- Legacy deep dive: do not require V2-only fields on V1 data.
- Heuristic content warnings: keep as suggestions unless the validator has deterministic evidence.
- Browser issue: reproduce locally with `npm run qa:browser`, inspect the screenshot, then write the smallest UI/data fix.
