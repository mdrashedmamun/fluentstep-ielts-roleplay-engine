# Skill: Extract Dialogue from PDFs

## Purpose
Extracts dialogue lines from IELTS roleplay PDFs using pattern recognition and AI analysis.

## Usage

```bash
/extract-dialogue [file-path] [options]
```

## Inputs

### Required
- **file-path** (string): Absolute path to PDF file
  - Example: `/Users/name/Documents/headway-advanced-unit-3.pdf`
  - Formats accepted: `.pdf` only

### Optional
- **scenario-id** (string): Override auto-detected scenario ID
  - Format: `{category}-{number}-{slug}` (e.g., `social-7-house-rules`)
  - Auto-detected from filename if not provided
- **source** (string): Specify source type
  - Values: `headway`, `cambridge`, `oxford`, `custom`
  - Auto-detected if not provided
- **confidence-threshold** (number): Minimum confidence score (0-100)
  - Default: 70
  - Higher = stricter extraction

## Outputs

### Primary Output
**Structured dialogue array** (JSON format):
```json
{
  "scenarioId": "social-7-house-rules",
  "source": "New Headway Advanced",
  "dialogue": [
    {
      "speaker": "Person A",
      "text": "Hello, nice to meet you.",
      "confidence": 0.92
    },
    {
      "speaker": "Person B",
      "text": "How is it going?",
      "confidence": 0.88
    }
  ],
  "metadata": {
    "turns": 12,
    "extractionConfidence": 0.89,
    "warnings": []
  }
}
```

### Secondary Output
**Staging file**: `.staging/{scenarioId}/dialogue.json`
- Automatically created for later processing
- Can be manually edited before transformation
- Validated before merge to staticData.ts

### Quality Metrics
- **Extraction Confidence**: ≥70% required for use
- **Dialogue Turns**: Minimum 8 for viable practice
- **Speaker Recognition**: 100% consistent speaker names

---

## Agent
- **Primary**: pdf-extractor
- **Dependencies**: blank-inserter, content-validator

---

## Examples

### Example 1: Extract with auto-detection
```bash
/extract-dialogue /Users/md/Documents/headway-unit-3.pdf

# Output: dialogue.json with scenarioId auto-detected
```

### Example 2: Extract with explicit scenario ID
```bash
/extract-dialogue /Users/md/Documents/lesson.pdf \
  --scenario-id social-7-house-rules \
  --source oxford

# Output: Treats as Oxford English File source
```

### Example 3: Strict extraction (higher confidence)
```bash
/extract-dialogue /Users/md/Documents/custom.pdf \
  --confidence-threshold 85

# Output: Only extracts lines with ≥85% confidence
```

---

## Supported Sources

| Source | Pattern | Test Status |
|--------|---------|------------|
| New Headway Advanced | "Person A:", "Person B:" | ✅ Tested |
| Cambridge IELTS | "Examiner:", "Candidate:" | ✅ Tested |
| Oxford English File | "Speaker 1:", "Speaker 2:" | ⏳ Ready |
| Custom PDFs | Auto-detect consistent format | ⏳ Ready |

---

## Error Handling

### Common Errors

**Error**: "PDF is not searchable"
- **Cause**: Scanned PDF without OCR
- **Solution**: Run PDF through OCR tool first, or use manual extraction

**Error**: "Cannot detect speaker pattern"
- **Cause**: Unusual or inconsistent speaker format
- **Solution**: Provide `--source` flag or manually specify speaker names

**Error**: "Extraction confidence too low (<70%)"
- **Cause**: Unclear or corrupted PDF
- **Solution**: Lower confidence threshold or check PDF quality

### Recovery

All outputs are saved to `.staging/` before merging:
1. Extract dialogue to `.staging/{scenarioId}/dialogue.json`
2. Review and edit manually if needed
3. Validate with `npm run validate:feedback`
4. Merge to staticData.ts when ready

---

## Performance

- **Typical extraction**: 2-5 seconds per PDF
- **PDF size**: Tested up to 50 MB
- **Dialogue length**: No practical limit
- **Confidence scoring**: Machine learning model, 100ms per turn

---

## Related Skills

- **[validate-scenario.md](./validate-scenario.md)** - Validate extracted dialogue
- **[transform-content.md](./transform-content.md)** - Transform dialogue to code
- **[export-scenario.md](./export-scenario.md)** - Export for human review

---

**Last Updated**: Feb 14, 2026
**Agent**: pdf-extractor
**Status**: Tested and stable
