# Linguistic Auditing System - Complete Guide

## Overview

The **Linguistic Auditing Agent System** is a comprehensive content validation framework designed specifically for IELTS roleplay scenarios. It ensures Band 9 quality standards across 8 dimensions:

1. **LOCKED CHUNKS Compliance** (80%+ vocabulary from proven patterns)
2. **British English Consistency** (spelling, vocabulary)
3. **Tonality & Register Matching** (appropriate formality by category)
4. **Natural Language Patterns** (avoiding textbook phrasing)
5. **Dialogue Flow Realism** (natural turn-taking)
6. **Answer Alternatives Quality** (true synonyms with tone matching)
7. **Deep Dive Insights** (explaining WHY phrases are native)
8. *Future*: Deep learning for semantic similarity

## Quick Start

### Run Full Audit with Interactive Review

```bash
npm run audit
```

This will:
1. Run all 7 validators on all 36 scenarios
2. Auto-apply HIGH confidence (≥95%) fixes silently
3. Present MEDIUM/LOW confidence findings for your approval
4. Generate audit report on completion

### Preview without Applying Changes

```bash
npm run audit --dry-run
```

Shows what would change without modifying scenario data.

### Report-Only Mode (No Interaction)

```bash
npm run audit --report-only
```

Generates audit summary without prompts.

### Single Scenario Audit

```bash
npm run audit --scenario=service-4
```

Audit just one scenario by ID.

### By Category

```bash
npm run audit --category=Social
```

Audit all scenarios in a category.

### Verbose Output

```bash
npm run audit --verbose
```

Shows detailed validator output for debugging.

## System Architecture

### Validator Pattern

Each validator is a pure function that:

```typescript
function validateX(scenario: RoleplayScript): ValidationFinding[] {
  // Return array of findings (empty if all pass)
}
```

Validators are registered with the orchestrator:

```typescript
registerValidator({
  name: 'My Validator',
  validate: myValidatorFunction
} as ValidatorFn);
```

### Confidence Scoring

```typescript
enum FixConfidence {
  HIGH = 0.95,      // Auto-fix (≥95%)
  MEDIUM = 0.70,    // Require approval (70-94%)
  LOW = 0.40        // Report as issue (<70%)
}
```

**Example scores**:
- British spelling rules: 100% confidence → AUTO-FIX
- UK vocabulary mapping: 98% confidence → AUTO-FIX
- Tonality mismatch: 75% confidence → ASK FOR APPROVAL
- Dialogue flow issue: 45% confidence → REPORT WITH ALTERNATIVES

### Finding Structure

```typescript
interface ValidationFinding {
  validatorName: string;        // "UK English Spelling"
  scenarioId: string;           // "service-4-return-no-receipt"
  location: string;             // "answerVariations[3].answer"
  issue: string;                // Human-readable description
  currentValue: string;         // What's there now
  suggestedValue?: string;      // (If HIGH/MEDIUM confidence)
  alternatives?: string[];      // Multiple options (LOW confidence)
  context: string;              // Dialogue context
  confidence: number;           // 0-1 confidence score
  reasoning: string;            // Why this is suggested
}
```

## The 7 Validators

### 1. Chunk Compliance Validator

**Purpose**: Enforce 80%+ usage of LOCKED CHUNKS (Bucket A universal + Bucket B topic-specific)

**What it checks**:
- Each answer against UNIVERSAL_CHUNKS from constants.ts
- Flags NOVEL answers (not in LOCKED CHUNKS)
- Suggests closest semantic alternatives

**Example**:
```
Issue: Novel vocabulary (not in LOCKED CHUNKS). Compliance: 78%
Current: "not completely"
Suggested: "somewhat"  (from LOCKED CHUNKS: "not...completely" pattern)
```

**Confidence**: HIGH for exact matches, MEDIUM for semantic similarity

### 2. UK English Spelling Validator

**Purpose**: Enforce British spelling rules

**The 4 Rules**:
1. **-ize → -ise**: "organize" → "organise", "realize" → "realise"
2. **-or → -our**: "color" → "colour", "honor" → "honour"
3. **-er → -re**: "center" → "centre", "theater" → "theatre"
4. **Double L**: "traveling" → "travelling", "canceled" → "cancelled"

**Confidence**: 100% (standardized rules)

**Example**:
```
Rule: -ize to -ise
Current: "I would like to organize..."
Fixed: "I would like to organise..."
```

### 3. UK English Vocabulary Validator

**Purpose**: Replace American English with British equivalents

**Example mappings**:
- "elevator" → "lift"
- "apartment" → "flat"
- "truck" → "lorry"
- "vacation" → "holiday"
- "garbage" → "rubbish"

**Confidence**: 95-100% (well-established pairs)

### 4. Tonality & Register Validator

**Purpose**: Ensure formality matches scenario category

**Register Levels**:
- **CASUAL**: "mate", "cheers", "brilliant", "fancy"
- **NEUTRAL**: "quite", "rather", "generally"
- **PROFESSIONAL**: "regarding", "ensure", "facilitate"
- **FORMAL**: "furthermore", "accordingly", "thereupon"

**Category Expectations**:
- Social → CASUAL
- Workplace → PROFESSIONAL
- Service/Logistics → NEUTRAL
- Advanced → PROFESSIONAL/FORMAL

**Confidence**: 70-95% (context-dependent)

**Example**:
```
Issue: Tonality mismatch
Current: "Furthermore, I'd like to state..."
Issue: Too formal for Social category
Suggested: "Actually, I think..."
```

### 5. Natural Patterns Validator

**Purpose**: Detect awkward "textbook English" phrasing

**Textbook Patterns**:
- "very good" → "excellent"
- "I am going to" → "I'm gonna"
- "However, I disagree" → "But I disagree"
- "In conclusion..." → "Anyway..."

**Confidence**: 75-80% (native phrasing is subjective)

### 6. Dialogue Flow Validator

**Purpose**: Validate natural turn-taking and emotional realism

**Checks**:
- No more than 2 consecutive blanks
- Complaints are acknowledged in next turn
- Tone consistency across dialogue

**Confidence**: 45-65% (very subjective)

**Example**:
```
Issue: Multiple consecutive blanks may disrupt coherence
Location: dialogue[12-14]
Suggestion: Consider alternating provided/blank content
```

### 7. Alternatives Validator

**Purpose**: Ensure answer alternatives are true synonyms

**Checks**:
1. Tone consistency (alternative matches primary register)
2. British English (alternatives follow spelling rules too)
3. Semantic similarity (similar length, related meaning)

**Confidence**: 70-95%

**Example**:
```
Primary: "excellent" (FORMAL tone)
Alternative 1: "brilliant" (CASUAL tone) ⚠️ Mismatch
Alternative 2: "wonderful" (FORMAL tone) ✓ Consistent
```

### 8. Deep Dive Insights Validator

**Purpose**: Ensure insights teach WHY phrases are native

**Checks**:
1. Not just definitions ("I think" = "opinion")
2. Explains usage patterns ("softener for disagreement")
3. British English in insights
4. Phrase matches actual answer

**Confidence**: 70-80%

**Example - BAD**:
```
Phrase: "Actually"
Insight: "Means at the present time"  ❌ Definition, not usage
```

**Example - GOOD**:
```
Phrase: "Actually"
Insight: "Softener for disagreement/correction. Signals native-like indirectness."  ✓ Explains why it's native
```

## Interactive Approval Workflow

When you run `npm run audit`, you'll see:

```
Finding 1/8: service-4-return-no-receipt
─────────────────────────────────
Validator: UK English Spelling
Location: answerVariations[3].alternatives[1]
Issue: British spelling rule: -ize to -ise
Confidence: 100%

Current: "utilize"
Suggested: "utilise"

Context: Dialogue: "Can you ________ this for a full refund?"
Reasoning: "utilize" should be "utilise" in British English

[A]pprove | [S]kip | [E]dit | [V]iew dialogue | [Q]uit:
```

### Commands

- **[A] Approve**: Apply the suggested fix and continue
- **[S] Skip**: Leave as-is and continue
- **[E] Edit**: Enter custom value
  ```
  Enter new value: utilise
  ✓ Approved with custom value: "utilise"
  ```
- **[V] View**: See full dialogue for context
  ```
  [0] Jack: "Hello, I'm Jack. I'm the new flatmate."
  [1] ➤ You: "Hello, my name is Alex. Nice to ________ you."
  [2] Jack: "Nice to meet you too..."
  ```
- **[Q] Quit**: Exit without saving

## Configuration & Rules

### British Spelling Rules

Location: `/services/linguisticAudit/rules/britishSpellingRules.ts`

Each rule has:
- Pattern (regex)
- Fix function
- Confidence (0-1)
- Examples
- Exceptions (e.g., "prize", "size" don't change)

### UK Vocabulary Mappings

Location: `/services/linguisticAudit/rules/britishVocabulary.ts`

Organized by category:
- Transport
- Housing
- Food & Dining
- General
- Education
- Money

### Tonality Levels

Location: `/services/linguisticAudit/rules/tonalityMappings.ts`

Define tone markers per register level. Easily extensible:

```typescript
export const TONE_MARKERS: ToneMarker[] = [
  { register: RegisterLevel.CASUAL, text: 'cheers', examples: [...] },
  // Add more as needed
];
```

## Extending the System

### Adding a New Validator

1. Create file: `/services/linguisticAudit/validators/myValidator.ts`

```typescript
import { RoleplayScript } from '../../staticData';
import { ValidationFinding } from '../types';

export function validateMyThing(scenario: RoleplayScript): ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  // Your validation logic here

  return findings;
}
```

2. Register it in `/cli/auditLanguage.ts`:

```typescript
registerValidator({
  name: 'My Validator',
  validate: validateMyThing
} as ValidatorFn);
```

### Adding a Confidence Scorer

Edit `/services/linguisticAudit/fixers/confidenceScorer.ts`:

```typescript
else if (issueType === 'my-issue-type') {
  score = 0.85;
  factors.push('My specific reasoning');
}
```

## Best Practices

### When Creating Scenarios

1. **Target 80%+ chunk compliance** - Use LOCKED CHUNKS where possible
2. **Use British English consistently** - Check spelling & vocabulary
3. **Match tonality to category** - Don't use formal language in Social
4. **Avoid textbook patterns** - Test phrases for naturalness
5. **Provide quality alternatives** - True synonyms, not just similar words
6. **Write substantive deep dives** - Explain the WHY, not just definitions

### When Running Audits

1. **Start with `--dry-run`** to see what would change
2. **Review HIGH confidence fixes** - Usually safe but always check
3. **Pay attention to MEDIUM findings** - Your domain expertise matters
4. **Consider dialogue context** - Use [V] to view full dialogue
5. **Create backup** - System creates backup before applying (in production)

## Output Files

### Console Output
- Real-time feedback with progress
- Approved/skipped count
- Summary statistics

### Markdown Report (Future)
- Full audit results
- Findings by scenario
- Statistics and graphs
- Recommendations

### JSON Export (Future)
- Machine-readable results
- Integration with other tools
- Archiving and tracking changes

## Troubleshooting

### "Cannot find module" error

Make sure you've run:
```bash
npm install
```

### Dialogue structure errors

All validators expect:
```typescript
dialogue: Array<{ speaker: string; text: string }>
```

Not just string[]. Check your scenario structure.

### Confidence scores not matching

Confidence depends on multiple factors:
- Rule certainty (spelling = 100%, dialogue flow = 50%)
- Context availability
- Category-specific logic

Adjust in `confidenceScorer.ts` if needed.

## Performance

- **Full audit (36 scenarios)**: ~2-3 seconds
- **Single scenario**: <100ms
- **Auto-fix application**: <500ms
- **No external API calls** (all local)

## Future Enhancements

- [ ] Claude API integration for semantic similarity
- [ ] Web UI for audit findings
- [ ] Batch operation support
- [ ] CI/CD integration (fail if compliance <80%)
- [ ] Regression testing (save "golden" scenarios)
- [ ] Advanced NLP pattern detection
- [ ] Learner proficiency adaptation

## Support

For issues or questions:
1. Check verbose output: `npm run audit --verbose`
2. Review validator source code
3. Check specific scenario with: `npm run audit --scenario=ID`
4. Report issues on GitHub
