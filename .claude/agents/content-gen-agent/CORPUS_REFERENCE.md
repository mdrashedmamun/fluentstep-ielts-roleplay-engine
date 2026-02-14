# BNC Corpus Data Reference

**Integrated**: Feb 14, 2026 | **Source**: Cambridge Layer (archived)
**Format**: TSV (tab-separated values) | **Corpus**: BNC Spoken English | **Purpose**: Validate chunk authenticity and frequency

---

## Quick Usage

Use corpus data to validate that dialogue chunks use authentic, high-frequency patterns from the British National Corpus (BNC) spoken registers.

### Quick Lookup
```bash
# Search for 2-gram patterns (most useful for quick checks)
grep "^kind of" corpus-data/bnc_spoken_2grams.txt

# Search for 3-gram patterns
grep "^what do you" corpus-data/bnc_spoken_3grams.txt

# Search for 4-gram patterns
grep "^i think that" corpus-data/bnc_spoken_4grams.txt
```

---

## File Descriptions

### 1. `bnc_spoken_2grams.txt`
**Two-word phrase patterns** (1,900+ phrases)

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| phrase | text | Two-word phrase | `kind of`, `i think`, `you know` |
| frequency_per_million | float | How often in BNC (per 1M words) | `892.4` |
| word_count | int | Always 2 | `2` |
| register | text | Formality level | `informal`, `neutral` |

**Use Case**: Validate common conversational phrases (most frequent patterns)

**Top Patterns**:
- `to be` (12,456.7 freq) - neutral
- `i think` (8,942.3 freq) - informal
- `kind of` (892.4 freq) - informal
- `in a` (7,234.1 freq) - neutral
- `you know` (6,523.4 freq) - informal

### 2. `bnc_spoken_3grams.txt`
**Three-word phrase patterns** (2,100+ phrases)

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| phrase | text | Three-word phrase | `to be honest`, `what do you`, `i want to` |
| frequency_per_million | float | How often in BNC (per 1M words) | `4,872.3` |
| word_count | int | Always 3 | `3` |
| register | text | Formality level | `informal`, `neutral` |

**Use Case**: Validate natural conversational sequences and discourse markers

**Top Patterns**:
- `to be honest` (4,872.3 freq) - informal
- `what do you` (3,456.2 freq) - informal
- `i want to` (2,876.5 freq) - neutral
- `i don't know` (2,654.3 freq) - informal

### 3. `bnc_spoken_4grams.txt`
**Four-word phrase patterns** (1,200+ phrases)

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| phrase | text | Four-word phrase | `i think that is`, `what do you think`, `do you want to` |
| frequency_per_million | float | How often in BNC (per 1M words) | `1,234.5` |
| word_count | int | Always 4 | `4` |
| register | text | Formality level | `informal`, `neutral` |

**Use Case**: Validate complex sentence patterns and idioms

---

## Register Categories

- **informal**: Conversational, colloquial patterns typical of speech
- **neutral**: Used equally in formal and informal contexts
- **formal**: Professional, academic, business contexts (rare in BNC spoken, more formal phrases use low frequency)

---

## Common Validation Workflow

### 1. Extract Phrase from Dialogue
```
Chunk: "You know what I mean?"
Patterns: "you know" (2-gram), "what i mean" (3-gram)
```

### 2. Check Corpus Frequency
```bash
grep "^you know" corpus-data/bnc_spoken_2grams.txt
# Output: you know	6523.4	2	informal
```

### 3. Validate Register
- ✅ HIGH frequency (6,523.4 per million) + informal register = authentic pattern
- ❌ LOW frequency (<100) = may be artificial or specialized jargon

### 4. Document in Feedback
```
"'You know what I mean?' uses authentic BNC patterns:
- 'you know' (6,523 freq, informal)
- Authentic conversational marker appropriate for peer role-play"
```

---

## Search Tips

### Find Phrases Containing a Word
```bash
# All 2-grams with "do"
grep " do" corpus-data/bnc_spoken_2grams.txt

# All 2-grams starting with "you"
grep "^you " corpus-data/bnc_spoken_2grams.txt
```

### Find High-Frequency Patterns (>3000 freq)
```bash
awk -F'\t' '$2 > 3000 { print $1, $2, $4 }' corpus-data/bnc_spoken_2grams.txt | head -20
```

### Find Patterns by Register
```bash
# Only informal patterns
grep -E "informal$" corpus-data/bnc_spoken_2grams.txt | head -20

# Only neutral patterns
grep -E "neutral$" corpus-data/bnc_spoken_2grams.txt | head -20
```

---

## Integration Notes

- **Copied from**: `.claude/agents/cambridge-layer/chunk-curator/corpus-data/` (Feb 11, 2026)
- **Integrated into**: content-gen-agent for scenario enhancement workflows
- **Version**: BNC Spoken English (standard reference corpus)
- **Frequency Unit**: Per 1 million words
- **Register Mapping**: Informal (conversational), Neutral (general use)

---

## When to Reference

✅ **Use corpus data when**:
- Validating chunk authenticity (does it sound natural?)
- Checking conversation registers (is this appropriate for the scenario context?)
- Comparing chunks against real-world frequency
- Building feedback: "This phrase appears in BNC at X frequency"

❌ **Don't use for**:
- Grammar correction (corpus doesn't validate grammar)
- Vocabulary teaching (use other reference sources)
- Formal writing (BNC spoken is conversational only)

---

## Example Validation Script
```bash
# Check if a phrase exists in corpus
check_phrase() {
  local phrase=$1
  local gram_size=${#phrase//[^ ]/}
  ((gram_size++))  # word count = spaces + 1

  grep "^$phrase" "corpus-data/bnc_spoken_${gram_size}grams.txt" | \
    awk -F'\t' '{printf "✓ Found: %s (freq: %s, register: %s)\n", $1, $2, $4}'
}

# Usage: check_phrase "kind of"
```

---

**Last Updated**: Feb 14, 2026 | **Maintained by**: Content-Gen Agent | **Archive Path**: `.claude/agents/archived/cambridge-layer-feb-2026/`
