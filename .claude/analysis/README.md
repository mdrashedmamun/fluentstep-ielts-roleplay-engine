# Post-Mortems & Incident Analysis

This directory contains detailed analysis of incidents, failures, and architectural issues discovered during development and production operations.

## Purpose

Document root causes, failure modes, and recommendations to prevent recurrence and improve system resilience.

## Contents

### [ROOT_CAUSE_ANALYSIS.md](./ROOT_CAUSE_ANALYSIS.md)

**Incident**: BBC Learning Scenario Deployment Failure (Feb 14, 2026)

**Status**: CRITICAL - Data deployed incomplete, production UI broken

**What Happened**:
- BBC scenario deployed with 47 blanks + answers but ZERO feedback schema
- Missing: `chunkFeedback`, `blanksInOrder`, `patternSummary`, `activeRecall`
- UI showed only 2 dialogues instead of 47 because `blanksInOrder` metadata was required but missing
- All 4 quality gates passed despite incomplete data

**Key Findings**:
1. **5 critical architectural flaws** in multi-agent system (no contracts, no checkpoints, no integration tests, no observability, no compensation logic)
2. **Why quality gates failed**: Gates validated individual aspects but not schema completeness
3. **Why Session 11 seemed successful**: Selective success metrics, tests created but not run, validators documented but not coded
4. **Test-reality gap**: E2E tests expected 40 blanks + feedback, deployment had 47 blanks + zero feedback

**Recommendations**:
- Implement agent output contracts with explicit TypeScript Union types
- Add validation checkpoints at each agent handoff
- Integrate E2E tests as blocking gate before merge
- Add schema enforcement (either full V1 OR full V2, no partial)
- Add detailed execution observability to see which agent failed

**Read**: See full document for timeline, architectural analysis, and actionable improvement plan (immediate/short/medium/long-term)

---

## How to Use This Directory

### For Root Cause Analysis
1. Read the incident section (what happened)
2. Review the timeline (when it happened)
3. Study the architectural analysis (why it happened)
4. Check the recommendations (how to prevent it)

### For Improving Systems
1. Check "Critical Design Flaws" section to understand what broke
2. Review "Why Quality Gates Failed" to see validation gaps
3. Read "Recommendations" section for concrete fixes
4. Reference specific improvement items for your architectural changes

### For Incident Response
1. Check if new incident is similar to previous ones
2. Look for patterns in root causes
3. Apply lessons learned from previous incidents
4. Document new incidents here for team learning

---

## Standards for Adding Analyses

When documenting a new incident:

1. **Title & Date**: Clear incident name and date discovered
2. **Impact Statement**: What broke, how many users affected, business impact
3. **Timeline**: Chronological sequence of events leading to incident
4. **Technical Analysis**: Root causes, why detection systems failed
5. **Architectural Issues**: System-level problems exposed
6. **Recommendations**: Immediate fixes + long-term improvements
7. **Lessons Learned**: What we can do better

---

**Last Updated**: Feb 14, 2026
**Owner**: Architecture Team
