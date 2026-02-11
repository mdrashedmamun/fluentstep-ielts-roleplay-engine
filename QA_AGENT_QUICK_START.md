# QA Agent Quick Start Guide

## What Is It?

The QA Agent is a comprehensive quality assurance system for FluentStep roleplay scenarios. It acts as a "bouncer" at the door of content creation, saying **YES** or **NO** with specific, actionable reasons.

## The 4 Gates

```
┌─────────────────────────────────────────────────────────┐
│                   QA AGENT GATES                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1️⃣  STRUCTURAL DISCIPLINE (Hard Gate)                 │
│     └─ Duration, speaker balance, blank density       │
│                                                         │
│  2️⃣  PRAGMATIC SENSITIVITY (Soft Gate)                 │
│     └─ Natural turn-taking, written vs spoken        │
│                                                         │
│  3️⃣  CHUNK AWARENESS (Critical Gate)                   │
│     └─ BUCKET_A/B compliance, chunk reuse            │
│                                                         │
│  4️⃣  REGISTER CONTROL (Register Gate)                  │
│     └─ UK English, formality level, tone             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Using the QA Agent

### Command Line

```bash
# Check all scenarios
npm run qa-test

# Check all scenarios with full suite
npm run qa-test:comprehensive

# Check specific scenario
npm run qa-check -- --scenario=social-1-flatmate

# Strict mode (fail on warnings too)
npm run qa-check:strict

# With help
npm run qa-check -- --help
```

### Programmatic

```typescript
import { runQACheck, formatQAReport } from './scripts/qaAgent';
import { CURATED_ROLEPLAYS } from './src/services/staticData';

const scenario = CURATED_ROLEPLAYS[0];
const report = runQACheck(scenario);
console.log(formatQAReport(report));
```

## Understanding the Report

### Status Badge
```
✅ PASSED (Confidence: 92%) - All gates green
⚠️  WARNING (Confidence: 78%) - Some warnings
❌ FAILED (Confidence: 45%) - Critical issues
```

### Gate Results
```
⚠️ Structural Discipline (94%)
   🔴 4 Critical Issue(s)
   🟡 2 Warning(s)
   💡 3 Suggestion(s)
```

### Critical Issues
```
🔴 Block approval - must be fixed
  📍 Line: dialogue
  Issue: Dialogue too short (2 min, target 5 min)
  Current: "150 words"
  Suggestion: Add 450+ more words to reach target
```

### Warnings
```
🟡 Review recommended - optional fixes
  📍 Line: answerVariations[5].answer
  Issue: Sounds written not spoken
  Current: "Furthermore, I would"
  Alternatives: ["And", "Also", "Plus"]
```

### Suggestions
```
💡 Optional improvements
  📍 Multiple consecutive blanks may disrupt flow
```

## Key Concepts

### Structural Discipline Checks
| Check | Requirement |
|-------|------------|
| Duration | 5-minute target (600-900 words) |
| Exchanges | Minimum 8 exchanges (16 lines) |
| Blank Density | 1 blank per 15-25 words |
| Speaker Balance | No speaker >70% |
| Context | Present and ≥10 words |
| Answer Variations | Must match blank count |

### Written vs Spoken Patterns
Detects and flags:
- Essay linking: "Moreover", "Furthermore", "Nevertheless"
- Overly formal: "I would appreciate if you could..."
- Robotic politeness: "I sincerely apologize"
- Academic hedging: "It could be argued that..."
- Wordy constructions: "Due to the fact that..."

### Exam Language Patterns
Detects and flags:
- "In my opinion" / "I strongly believe"
- "It is important to note"
- IELTS-specific hedging: "To some extent"
- Abstract language: "The general public"
- Formal markers: "A key point is"

### Chunk Reuse
Enforces consistent chunk usage:
- "to be honest" (not "frankly", "candidly")
- "I think" (not "I believe", "in my opinion")
- "quite" (not "rather", "fairly")
- "kind of" (not "sort of")

## Exit Codes

```
0 = ✅ All checks passed
1 = ❌ Some checks failed
2 = ⚠️  Command error
```

## Common Issues & Solutions

### Issue: "Dialogue too short (0.7 min, target 5 min)"
**Solution**: Expand dialogue to 600-900 words with more exchanges

### Issue: "Blanks too sparse (1 per 40 words, target 15-25)"
**Solution**: Increase blank count to achieve 1 blank per 20 words

### Issue: "Imbalanced speakers (You: 75%)"
**Solution**: Add more lines for the other speaker to balance turns

### Issue: "Context is too brief (5 words)"
**Solution**: Expand context to be more descriptive (10+ words)

### Issue: "Uses exam language"
**Solution**: Replace "In my opinion" → "I think", etc.

### Issue: "Sounds written not spoken"
**Solution**: Replace "Furthermore" → "And", "Moreover" → "Also"

## Files & Architecture

### Core Files
- `scripts/qaAgent.ts` - Main orchestrator
- `scripts/structuralDisciplineValidator.ts` - Structure checks
- `scripts/chunkReuseEnforcer.ts` - Cross-scenario consistency
- `cli/qaCheck.ts` - CLI interface

### Rules & Validators
- `src/services/linguisticAudit/rules/writtenVsSpokenPatterns.ts` - 50+ patterns
- `src/services/linguisticAudit/rules/examLanguagePatterns.ts` - 30+ patterns
- `src/services/linguisticAudit/validators/writtenVsSpokenValidator.ts`
- `src/services/linguisticAudit/validators/examLanguageValidator.ts`

### Integration
- Leverages existing 7 validators from `/src/services/linguisticAudit/validators/`
- Reuses confidence scoring system
- Inherits auto-fix infrastructure

## Performance

| Metric | Value |
|--------|-------|
| Per-scenario | <200ms |
| All 52 scenarios | <15 seconds |
| Build time | <3 seconds |
| Memory usage | <50MB |

## Philosophy

> "This is a bouncer, not a teacher. It says YES or NO, with specific reasons. It doesn't improve, it validates."

The QA Agent:
- ✅ Identifies issues
- ✅ Provides specific line numbers
- ✅ Suggests BUCKET-aligned alternatives
- ✅ Maintains consistent standards
- ✅ Never relaxes requirements

The QA Agent does NOT:
- ❌ Rewrite scenarios
- ❌ Introduce new vocabulary
- ❌ Change locked chunks
- ❌ Make creative suggestions
- ❌ Teach or explain grammar

## Next Steps

1. **Immediate**: Run comprehensive test
   ```bash
   npm run qa-test:comprehensive
   ```

2. **Review**: Check the verification report
   ```
   cat QA_AGENT_VERIFICATION_REPORT.md
   ```

3. **Integrate**: Use as pre-commit gate for new scenarios

4. **Monitor**: Track which gates most scenarios fail and adjust content accordingly

## Questions?

See the full verification report: `QA_AGENT_VERIFICATION_REPORT.md`

---

**Built**: February 2026
**Status**: Production-ready ✅
**Coverage**: 4 gates, 80+ pattern rules, 52 scenarios tested
