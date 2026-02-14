# Rules Index

Modular rules for the FluentStep IELTS Roleplay Engine. Each rule file addresses a specific domain.

## Core Rules

### [CORE_RULES.md](./CORE_RULES.md)
**Language constraints and pedagogical principles**
- Global non-negotiable rules (train patterns, not vocab)
- Language style (UK English, day-to-day tone)
- Locked Universal Chunks reference
- Chunk priority system

### [SCHEMA_RULES.md](./SCHEMA_RULES.md)
**Data structure and schema compliance**
- V1/V2 dual schema support
- chunkFeedback vs deepDive structures
- Data validation requirements
- Breaking schema changes

### [QUALITY_GATES.md](./QUALITY_GATES.md)
**Quality assurance pipeline**
- 4-gate architecture (Build → Validate → Test → QA)
- Quality thresholds and confidence scoring
- Validation requirements per stage
- Gate bypass procedures

### [DATA_INTEGRITY.md](./DATA_INTEGRITY.md)
**Code safety and performance guardrails**
- Defensive fallback patterns
- O(1) lookup requirements
- File locking and race condition prevention
- Security and vulnerability checks

---

## How to Use

1. **For New Features**: Check relevant rule file before implementation
2. **For Code Review**: Validate against all applicable rules
3. **For Disputes**: Use rule file as source of truth
4. **For Overrides**: Create `.local.md` variant (gitignored)

**Last Updated**: Feb 14, 2026
