# Linguistic Blank Inserter - Implementation Guide

## Quick Start

### Installation

```bash
# Navigate to skill directory
cd ~/.claude/skills/linguistic-blank-inserter

# Install dependencies
pip install spacy nltk

# Download spaCy model
python -m spacy download en_core_web_sm

# Download NLTK data
python -m nltk.downloader punkt wordnet
```

### Basic Usage

```bash
# Run on example dialogue
python implementation.py examples/raw_conversation.json \
  --target-density 0.25 \
  --difficulty-level B2 \
  --include-deep-dive

# Output: raw_conversation-blanked-YYYYMMDD-HHMMSS.json
```

## Architecture Overview

The skill implements a 5-phase transformation pipeline:

### Phase 1: Linguistic Analysis (`LinguisticAnalyzer`)
- Uses spaCy for POS tagging and dependency parsing
- Detects phrasal verbs, idioms, collocations
- Extracts linguistic metadata for each word/phrase
- **Output**: Analyzed turns with token-level metadata

### Phase 2: Candidate Scoring (`CambridgeScorer`)
- Scores candidates on 4 dimensions:
  - Grammar value (40%): Verbs +40, idioms +35, adj/adv +25
  - LOCKED_CHUNKS alignment (30%): Bucket A +30, B +20
  - Difficulty calibration (15%): CEFR match
  - Pedagogical value (15%): Learner errors, usage frequency
- **Output**: Scored candidates (0-100 scale)

### Phase 3: Blank Selection (`BlankSelector`)
- Targets 20-30% blank density
- Distribution: 60% grammar, 30% LOCKED_CHUNKS, 10% novel
- Enforces ≥2 word separation between blanks
- **Output**: Ordered list of selected blanks

### Phase 4: Alternative Generation (`AlternativeGenerator`)
- Multi-strategy approach:
  1. Variation mappings (FluentStep predefined)
  2. Grammatical variants (verb forms)
  3. Register shifts (formal/casual)
  4. Collocation-based
- Validation gates: semantic similarity >0.7, POS match, register consistency
- **Output**: 3-5 validated alternatives per blank

### Phase 5: Deep Dive Insights (`DeepDiveGenerator`)
- Generates IELTS-focused insights for 30-40% of blanks
- Components: grammar explanation, usage context, collocations, IELTS band, common errors
- **Output**: JSON deepDive array with enriched insights

## Input Format

**Raw JSON** (RoleplayScript structure):
```json
{
  "id": "conversation-id",
  "dialogue": [
    {"speaker": "Jessica", "text": "Welcome back. It's Jessica here."},
    {"speaker": "Customer", "text": "Yes, I'm trying to make a cake."}
  ]
}
```

## Output Format

**Blanked RoleplayScript** (production-ready):
```json
{
  "id": "conversation-id",
  "dialogue": [
    {"speaker": "Jessica", "text": "Welcome back. It's Jessica here."},
    {"speaker": "Customer", "text": "Yes, I'm ________ to make a cake."}
  ],
  "answerVariations": [
    {
      "index": 0,
      "answer": "trying",
      "alternatives": ["attempting", "planning", "wanting", "hoping"],
      "confidence": "HIGH",
      "pos": "VERB",
      "cefr_level": "B1"
    }
  ],
  "deepDive": [
    {
      "index": 0,
      "phrase": "trying to",
      "grammar_type": "MODAL_INFINITIVE",
      "explanation": "Modal + infinitive expressing ongoing effort toward a goal",
      "usage_context": "Common in IELTS Speaking when describing current activities",
      "collocations": ["trying to understand", "trying to achieve"],
      "ielts_relevance": "Band 6-7 (intermediate-upper intermediate)",
      "common_errors": "❌ 'trying for' (incorrect) | ✓ 'trying to' (correct)",
      "example": "I'm trying to improve my English."
    }
  ],
  "metadata": {
    "blank_density_target": 0.25,
    "blank_density_achieved": 0.27,
    "total_blanks_inserted": 9,
    "grammar_distribution": {"VERB": 6, "IDIOM": 1, "EXPRESSION": 2},
    "locked_chunks_compliance": 0.85,
    "validation_status": "PASS",
    "high_confidence_fixes_applied": 2,
    "medium_confidence_issues": 1,
    "low_confidence_warnings": 0,
    "processing_time_seconds": 2.3
  }
}
```

## Command-Line Parameters

```bash
python implementation.py <dialogue_file> [OPTIONS]

OPTIONS:
  --target-density FLOAT
    Target blank percentage (0.20-0.30, default: 0.25)

  --focus-types STR
    Grammar types: VERB,ADJ,ADV,IDIOM,EXPRESSION,COLLOCATION
    (default: VERB,ADJ,ADV,IDIOM,EXPRESSION)

  --difficulty-level STR
    CEFR target: A1|A2|B1|B2|C1|C2
    (default: B2)

  --min-alternatives INT
    Minimum alternatives per blank (3-5, default: 3)

  --strictness STR
    Validation: lenient|standard|strict
    (default: standard)

  --enable-auto-fix
    Auto-apply HIGH confidence fixes
    (default: True)

  --include-deep-dive
    Generate IELTS insights
    (default: True)
```

## Usage Scenarios

### Scenario 1: Fix Tool 2 Output

```bash
# Tool 2 produced poor-quality blanks
python implementation.py tool2-output.json \
  --target-density 0.25 \
  --focus-types "VERB,IDIOM,EXPRESSION" \
  --difficulty-level B2 \
  --strictness standard \
  --include-deep-dive
```

### Scenario 2: Batch Processing

```bash
#!/bin/bash
for file in ../raw_transcripts/*.json; do
  python implementation.py "$file" \
    --target-density 0.25 \
    --difficulty-level B2 \
    --include-deep-dive
done
```

### Scenario 3: Exam-Grade (Strictest)

```bash
python implementation.py exam_dialogue.json \
  --target-density 0.28 \
  --focus-types "VERB,IDIOM,EXPRESSION,COLLOCATION" \
  --difficulty-level B2 \
  --min-alternatives 4 \
  --strictness strict \
  --include-deep-dive
```

## Key Classes

### LinguisticAnalyzer
- **Methods**:
  - `analyze_dialogue()`: POS tagging + metadata extraction
  - `extract_candidates()`: Create blank candidates
- **Uses**: spaCy NLP pipeline

### CambridgeScorer
- **Methods**:
  - `score_candidate()`: 0-100 comprehensive scoring
- **Weights**: Grammar (40%), LOCKED_CHUNKS (30%), Difficulty (15%), Pedagogy (15%)

### BlankSelector
- **Methods**:
  - `select_blanks()`: Intelligent selection with distribution balancing
  - `_enforce_adjacency()`: Prevent adjacent blanks
- **Distribution**: 60% grammar, 30% LOCKED_CHUNKS, 10% novel

### AlternativeGenerator
- **Methods**:
  - `generate_alternatives()`: Multi-strategy generation
  - `_validate_alternative()`: Quality gates
- **Validation**: Semantic similarity, POS match, register consistency

### DeepDiveGenerator
- **Methods**:
  - `generate_insight()`: Create IELTS-focused insights
- **Components**: Grammar, usage, collocations, IELTS band, errors, examples

### LinguisticBlankInserter
- **Main orchestrator** coordinating all 5 phases
- **Methods**:
  - `process_dialogue()`: Full pipeline execution

## Quality Metrics

Verify output meets:

✅ **Density**: 20-30% (actual vs target)
✅ **Grammar Focus**: ≥60% verbs/idioms/expressions
✅ **Alternatives**: 3-5 per blank, 100% validated
✅ **LOCKED_CHUNKS**: ≥80% compliance (Bucket A/B)
✅ **CEFR Match**: Within ±1 level of target
✅ **British English**: 100% (spelling & vocabulary)
✅ **Confidence**: Clear HIGH/MEDIUM/LOW scores
✅ **IELTS Insights**: 30-40% of blanks with deep dive

## Troubleshooting

### Low Blank Density

**Problem**: Fewer blanks than target
**Causes**:
- Short dialogue (too few sentences)
- Low vocabulary variety
- High `min-alternatives` threshold rejecting blanks

**Solutions**:
```bash
# 1. Reduce min-alternatives
--min-alternatives 3

# 2. Expand focus types
--focus-types "VERB,ADJ,ADV,IDIOM,EXPRESSION,COLLOCATION"

# 3. Lower difficulty level
--difficulty-level A2
```

### Poor Alternative Quality

**Problem**: Alternatives don't match original well
**Causes**:
- POS mismatch
- Semantic similarity too strict
- Register mismatch

**Solutions**:
```bash
# 1. Use lenient strictness
--strictness lenient

# 2. Reduce alternative count requirement (fallback generation)
--min-alternatives 3

# 3. Enable auto-fix for medium confidence
# (handled internally, review before deploy)
```

### Low LOCKED_CHUNKS Compliance

**Problem**: <80% compliance with Cambridge corpus
**Causes**:
- Specialized/technical vocabulary
- Non-standard collocations
- Dialogue uses rare expressions

**Solutions**:
```bash
# 1. Increase density (select higher-scoring candidates)
--target-density 0.28

# 2. Manually extend LOCKED_CHUNKS in implementation.py
# Edit LOCKED_CHUNKS_BUCKET_A and BUCKET_B

# 3. Use standard strictness (allows 80%)
--strictness standard
```

## Performance

- **Speed**: 2-3 seconds per 30-turn dialogue
- **Memory**: <50 MB
- **Model Size**: spaCy model = 40 MB (one-time download)

## Files Generated

1. **Primary Output**: `[filename]-blanked-YYYYMMDD-HHMMSS.json`
   - Production-ready RoleplayScript
   - Ready for FluentStep deployment

2. **Logs**: Console output with phase summaries
   - Candidate extraction
   - Scoring statistics
   - Selection distribution
   - Processing time

## Integration with FluentStep

After generating blanks:

1. **Load into FluentStep**:
   ```bash
   # Copy blanked JSON to FluentStep project
   cp output.json /path/to/fluentstep/scenarios/
   ```

2. **Validate with Linguistic Audit**:
   ```bash
   /validate-scenario output.json --strictness strict
   ```

3. **Test in Browser**:
   - Load scenario in FluentStep UI
   - Verify blanks display correctly
   - Test alternative selection
   - Check deep dive insights load

4. **Deploy**:
   - Push to production
   - Monitor learner interactions
   - Iterate on parameters if needed

## Reference Documents

- **SKILL.md**: Complete skill documentation (800+ lines)
- **implementation.py**: Full Python source (1,000+ lines)
- **examples/**: Before/after transformation samples

## Success Criteria

Output should achieve:

✅ 25% blank density (±2%)
✅ 8-10 blanks in typical 33-turn dialogue
✅ 100% verb/idiom/expression focus
✅ 3-5 alternatives per blank
✅ 85%+ LOCKED_CHUNKS compliance
✅ 2-4 deep dive insights
✅ All British English compliance
✅ Ready for production deployment

## Support

See SKILL.md for:
- Detailed algorithm explanations
- Example transformations (before/after)
- Troubleshooting guide
- Time savings analysis
- Integration workflows
