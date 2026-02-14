# Skills Directory

Reusable, discoverable skills for the FluentStep IELTS Roleplay Engine.

## Registered Skills

### [extract-dialogue.md](./extract-dialogue.md)
**Extract dialogue from PDFs**
- Inputs: PDF file path, optional scenario ID
- Outputs: Structured dialogue array (JSON)
- Agent: pdf-extractor
- Status: Tested and stable

### [validate-scenario.md](./validate-scenario.md)
**Validate scenario structure and content**
- Checks: Schema, chunks, UK spelling, alternatives
- Confidence: ≥85% required for approval
- Agent: content-validator
- Status: Active

### [transform-content.md](./transform-content.md)
**Transform scenarios between schema versions**
- Converts: V1 (deepDive) → V2 (chunkFeedback)
- Features: Dual schema support, validation
- Agent: scenario-transformer
- Status: Production ready

### [generate-pattern-summary.md](./generate-pattern-summary.md)
**Generate pattern summaries for chunk feedback**
- Creates: Pattern reference, common mistakes, key takeaway
- Output: Adds to chunkFeedback.patternSummary
- Agent: content-gen-agent
- Status: Active

### [export-scenario.md](./export-scenario.md)
**Export scenario to Markdown for human review**
- Format: Markdown with frontmatter
- Includes: All metadata, dialogue, feedback, blanks
- Agent: data-services-agent
- Status: Stable

---

## How to Use Skills

### In Settings
Skills are registered in `settings.json` under the `skills` section:
```json
{
  "skills": [
    {
      "name": "extract-dialogue",
      "description": "Extract dialogue from educational PDFs",
      "agent": "pdf-extractor"
    }
    // ... other skills
  ]
}
```

### With Commands
Use skills via Claude Code CLI:
```bash
/extract-dialogue file.pdf
/validate-scenario scenario.json
/transform-content input.json
/generate-pattern-summary scenario.json
/export-scenario scenario.json
```

### In Agent Workflows
Agents call skills internally during their workflows:
```typescript
// content-gen-agent calling generate-pattern-summary skill
await callSkill('generate-pattern-summary', {
  scenarioId: 'social-7-house-rules',
  blankIndex: 0,
});
```

---

## Skill Specifications

Each skill file contains:
1. **Purpose**: What the skill does
2. **Usage**: How to invoke it
3. **Inputs**: Required and optional parameters
4. **Outputs**: Generated artifacts and formats
5. **Agent**: Which agent provides this skill
6. **Examples**: Real-world usage examples
7. **Error Handling**: What can go wrong
8. **Performance**: Time and resource requirements

---

## Adding New Skills

To add a new skill:

1. **Create skill file**: `.claude/skills/my-skill.md`
2. **Document specification**: Follow template (see existing skills)
3. **Register in settings**: Add to `settings.json` under `skills`
4. **Implement in agent**: Add to agent's ROLE.md
5. **Test thoroughly**: Verify with examples
6. **Update this README**: Add entry to Registered Skills

---

**Last Updated**: Feb 14, 2026
