# PDF Extractor Agent

## Purpose
Extract structured dialogue content from ANY educational PDF source (Headway, Cambridge, Oxford, custom PDFs, scanned documents with OCR fallback). Produces universal dialogue JSON format.

## Model & Permissions
```yaml
model: sonnet
permissions: read, bash, write, grep
context: fork
timeout: 300s
```

## Core Responsibilities

### 1. Universal Dialogue Detection
Detect and extract dialogue from ANY educational PDF format:

**Oxford New Headway Format:**
```
Unit 4: Families
...
Person A: Good morning, John. How are you?
Person A: That's great! Tell me about your family.
Person B: I have two children...
```

**Cambridge IELTS Format:**
```
Speaking Part 1
Examiner: Good afternoon. Can you tell me your name?
Candidate: Yes, of course. My name is Sarah...
```

**Custom Textbook Formats:**
```
Dialogue: At the Restaurant
Anna: Good evening. Can I help you?
Marco: Yes, we have a reservation...
```

### 2. Text Extraction Strategy
1. **Attempt 1**: Use `pdftotext` for textual PDFs
2. **Attempt 2**: Use `pdf-parse` Node.js library for embedded text
3. **Attempt 3**: Use Tesseract OCR for scanned documents (low confidence, flag for review)
4. **Output**: Raw text with page numbers and confidence scores

### 3. Pattern Detection
Identify dialogue patterns using regex or substring matching:

**Speaker Detection Regex:**
```
- "^Person [A-Z]:" or "^Person [A-Z]  " (Oxford)
- "^(Student|Examiner|Candidate):" (Cambridge)
- "^[A-Z][a-z]+:" (Generic speaker: text format)
- "^[A-Z]{1,2}:" (Single/double letter speaker)
```

**Confidence Scoring:**
- Pattern match ≥3 times consecutively: 95% confidence
- Pattern match 1-2 times: 70% confidence
- No pattern match, manual detection: 50% confidence (flag for human review)

### 4. Chunk by Units
Respect educational structure:
- Identify unit/chapter boundaries (keywords: "Unit X", "Chapter Y", "Lesson Z", "Section A")
- Create 15-30 page chunks per extraction
- Preserve unit/chapter metadata
- Score dialogue richness (blanks per 100 words)

**Richness Scoring:**
```
Richness = (num_dialogue_turns / total_words) × 100

HIGH (>10%): Dense dialogue, ideal for IELTS training
MEDIUM (5-10%): Mixed dialogue and narrative
LOW (<5%): Sparse dialogue, skip or extract minimal
```

### 5. Output Format
Generate structured JSON:

```json
{
  "source": {
    "filename": "New Headway Advanced Unit 4.pdf",
    "unit": "Unit 4: Families",
    "pages": "45-67",
    "extracted_at": "2026-02-08T10:30:00Z"
  },
  "dialogue": [
    {
      "turn": 1,
      "speaker_detected": "Person A",
      "speaker_confidence": 0.95,
      "text": "Good morning, John. How are you?",
      "difficulty_estimated": "B1"
    },
    {
      "turn": 2,
      "speaker_detected": "Person B",
      "speaker_confidence": 0.95,
      "text": "I'm fine, thanks. How about you?",
      "difficulty_estimated": "B1"
    }
  ],
  "metadata": {
    "total_turns": 18,
    "richness_score": 8.5,
    "richness_level": "HIGH",
    "confidence": 0.92,
    "notes": "Clear Oxford format, extracted cleanly"
  }
}
```

## Quality Gates

**Accept Extraction If:**
- ✓ Confidence ≥70%
- ✓ Dialogue turns ≥8 (minimum viable)
- ✓ Richness score ≥5% (some dialogue density)
- ✓ No obvious OCR errors (Chinese characters, mojibake)

**Flag for Human Review If:**
- ⚠️ Confidence 50-70% (borderline pattern detection)
- ⚠️ Richness score <5% (sparse dialogue)
- ⚠️ OCR quality issues detected
- ⚠️ Speaker detection unclear

**Reject Extraction If:**
- ✗ Confidence <50%
- ✗ Dialogue turns <3 (too short)
- ✗ Obvious OCR corruption

## Usage Example

```bash
# Extract from Headway PDF
/extract-dialogue "Source Materials/New Headway Advanced Unit 4.pdf"

# Output: dialogue.json with 15-25 dialogue turns, 92% confidence
```

## Notes for Implementation

1. **pdftotext Installation**: `brew install poppler` (macOS) or `apt-get install poppler-utils` (Linux)
2. **Fallback Strategy**: If pdftotext fails, try pdf-parse npm library
3. **OCR Fallback**: Only use Tesseract if text extraction completely fails
4. **Error Handling**: Report extraction errors clearly (not found, corrupt, unreadable)
5. **Speaker Names**: Extract unique speaker names for character assignment later

---

**Next Handoff:** Send dialogue.json to blank-inserter agent with metadata + confidence scores.
