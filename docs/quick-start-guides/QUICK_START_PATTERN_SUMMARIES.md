# Pattern Summary Enrichment - Quick Start (5 minutes)

## 🎯 One-Time Setup
```bash
npm install
npm run build  # Verify everything compiles
```

## ⚡ Workflow (Per Batch)

### 1. Generate (Automated)
```bash
npx tsx scripts/exportGeneratedSummaries.ts --category Social --batch 1
# Output: exports/generated/Social-batch1-generated.md (6.7 KB)
```

### 2. Review & Edit (Human)
1. Open `exports/generated/Social-batch1-generated.md`
2. For each of 5 scenarios:
   - Read template-generated insights
   - Edit YAML block to refine wording
   - Check QA checkboxes
   - Add author notes
3. Save as `Social-batch1-enriched.md`

### 3. Validate (Quick Check)
```bash
npm run validate:enrichments -- --file=Social-batch1-enriched.md
# Should output: ✅ All validations passed!
```

### 4. Import (Automated)
```bash
npm run import:enrichments -- --file=Social-batch1-enriched.md
# Backs up staticData.ts and merges enrichments
```

### 5. Verify (Quick Tests)
```bash
npm run validate:feedback  # Check all data
npm run build             # TypeScript compilation
npm run dev               # Test in browser
```

## 📊 Categories & Batch Count

| Category | Total | Batches | Command |
|----------|-------|---------|---------|
| Social | 12 | 3 | `--category Social --batch 1` |
| Workplace | 11 | 3 | `--category Workplace --batch 1` |
| Service/Logistics | 14 | 3 | `--category Service/Logistics --batch 1` |
| Advanced | 11 | 3 | `--category Advanced --batch 1` |
| Academic | 1 | 1 | `--category Academic --batch 1` |
| Healthcare | 1 | 1 | `--category Healthcare --batch 1` |
| Cultural | 1 | 1 | `--category Cultural --batch 1` |
| Community | 1 | 1 | `--category Community --batch 1` |

## ✅ Validation Checklist (Per Scenario)

For each of 5 scenarios in the enriched file:

- [ ] **Category breakdown** accurate (2-6 categories)
- [ ] **Overall insight** captures learning outcome (100-300 chars)
- [ ] **Key patterns** show cross-chunk connections (2-4 patterns)
- [ ] **No grammar terminology** (verb, noun, tense, etc.)
- [ ] **Word counts within limits**:
  - Insight: 30-100 chars
  - Overall: 100-300 chars
  - Pattern: 10-50 chars
  - Explanation: 50-150 chars
- [ ] **All chunks exist** in scenario's chunkFeedback

## 🔒 Important Guardrails

**Category Lock** ✅ Enforced by import script
- One category per enriched file
- All scenario IDs must match declared category
- Example: "Social" → all IDs start "social-"

**Batch Size** ✅ Enforced by import script
- Exactly 5 scenarios per enriched file
- Exception: <5 for single-scenario categories
- Rejects >5 scenarios

**No Fabrication** ✅ Enforced by validation
- All chunks must exist in chunkFeedback
- Cannot invent new chunks
- Validation checks every reference

## 📁 File Locations

**Generated**:
```
exports/generated/Social-batch1-generated.md     (Before editing)
exports/Social-batch1-enriched.md                (After editing, before import)
```

**Reference**:
```
scripts/enrichmentTemplate.md                    (Author guide)
PATTERN_SUMMARY_IMPLEMENTATION.md                (Full documentation)
```

## 🚨 If Validation Fails

### "Category lock violation"
- Check that ALL scenario IDs match declared category
- If header says "Social", all IDs must start "social-"

### "Chunk '...' not found"
- Verify chunk text matches exactly (case-sensitive)
- Chunk must exist in scenario's `chunkFeedback` field

### "Invalid category name"
- Check category header spelling (case-sensitive)
- Valid values: Academic, Advanced, Community, Cultural, Healthcare, Service/Logistics, Social, Workplace

### "Batch size violation"
- File must have exactly 5 scenarios
- Exception: <5 allowed for single-scenario categories (Academic, Healthcare, Cultural, Community)

### "YAML parse error"
- Check YAML indentation (2 spaces per level)
- Verify all quotes match (no mismatched quotes)
- Use online YAML validator if unsure

## 💡 Tips

1. **Edit templates, don't rewrite** - Use AI-generated insights as baseline, refine with context
2. **Keep insights concise** - 30-100 chars for category insights (roughly 5-15 words)
3. **Focus on patterns** - Explain WHY chunks work, not WHAT they mean
4. **Verify all chunks** - Copy exact text from chunkFeedback (case matters!)
5. **Check QA boxes** - Ensures quality before import

## 🎯 Success Criteria

Each enriched file should:
- ✅ Have valid category header
- ✅ Contain exactly 5 scenarios
- ✅ Pass `npm run validate:enrichments`
- ✅ Have all QA checkboxes checked
- ✅ Successfully import without errors
- ✅ Build succeeds after import

## 📞 Commands Reference

```bash
# Generate
npx tsx scripts/exportGeneratedSummaries.ts --category Social --batch 1

# Validate
npm run validate:enrichments -- --file=Social-batch1-enriched.md

# Import
npm run import:enrichments -- --file=Social-batch1-enriched.md

# Verify
npm run validate:feedback
npm run build
npm run dev
```

---

**Ready to get started?** 🚀

```bash
# 1. Generate first batch
npx tsx scripts/exportGeneratedSummaries.ts --category Social --batch 1

# 2. Open the file for review
# exports/generated/Social-batch1-generated.md

# 3. Follow the template guide: scripts/enrichmentTemplate.md
```

Estimated time per batch: 45 minutes (review + edit + validate + import)
