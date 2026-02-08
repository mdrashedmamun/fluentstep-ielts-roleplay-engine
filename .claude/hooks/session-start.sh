#!/bin/bash

# FluentStep Extraction Pipeline - Session Start Hook
# Purpose: Display project context and status at session start
# Helps orchestrator understand current state and work priorities

echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║           FluentStep IELTS Roleplay Engine - Extraction Pipeline           ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Current phase
echo -e "${PURPLE}🎯 Current Phase:${NC} Phase 7 - Reusable Extraction Infrastructure"
echo ""

# Project stats
echo -e "${BLUE}📊 Current Status:${NC}"

# Count scenarios in staticData.ts
if [ -f "src/services/staticData.ts" ]; then
    SCENARIO_COUNT=$(grep -c '"id":' src/services/staticData.ts 2>/dev/null || echo "?")
    echo "   • Scenarios integrated: $SCENARIO_COUNT"
fi

# Check if build is clean
if [ -f "package.json" ]; then
    if npm run validate > /dev/null 2>&1; then
        echo -e "   • Data integrity: ${GREEN}✓ PASS${NC}"
    else
        echo -e "   • Data integrity: ${YELLOW}⚠ CHECK${NC}"
    fi
fi

# Phase progress
echo ""
echo -e "${BLUE}📅 Phase 7 Progress:${NC}"
echo "   ✅ Task 7.1 - Subagent Architecture (6 files, 3,280 lines)"
echo "   ✅ Task 7.2 - Reusable Skills Library (3 files, 1,270 lines)"
echo "   ✅ Task 7.3 - Automation Hooks (3 files)"
echo "   ⏳ Task 7.4 - Smoke Test (sample PDF extraction)"
echo ""

# Infrastructure overview
echo -e "${BLUE}🏗️  Extraction Infrastructure:${NC}"
echo "   Agents:  5 subagents (pdf-extractor, blank-inserter, validator, transformer, orchestrator-qa)"
echo "   Skills:  3 reusable skills (/extract-dialogue, /validate-scenario, /transform-content)"
echo "   Hooks:   2 automation hooks (validate-output, session-start)"
echo "   Stages:  10 pipeline steps with 5 quality gates"
echo ""

# Quick reference
echo -e "${YELLOW}⚡ Quick Reference:${NC}"
echo "   Validate scenarios:    npm run validate"
echo "   Build production:      npm run build"
echo "   Audit language:        npm run audit"
echo "   Extract subagents:     .claude/agents/"
echo "   Reusable skills:       ~/.claude/skills/"
echo ""

# Preparation checklist
echo -e "${PURPLE}✓ Next: Task 7.4 - Smoke Test${NC}"
echo "   1. Select New Headway Advanced Unit 4"
echo "   2. Run /extract-dialogue to extract dialogue"
echo "   3. Pipeline orchestrator handles: blank-insert → validate → transform"
echo "   4. Verify all quality gates pass"
echo "   5. Confirm npm run build succeeds"
echo ""

# Helpful context
echo -e "${BLUE}💡 Helpful Context:${NC}"
echo "   • Quality gates prevent bad data from shipping (5 gates total)"
echo "   • Manual intervention target: ≤20% (approval-only, not execution)"
echo "   • All 7 linguistic validators active (UK English, tonality, flow, etc.)"
echo "   • Bundle size limit: 350 KB JS, 45 KB CSS (gzipped)"
echo "   • LOCKED_CHUNKS compliance: 80%+ casual, 60%+ academic"
echo ""

# Tips
echo -e "${GREEN}💭 Working Tips:${NC}"
echo "   • Use --dry-run with skills to preview before executing"
echo "   • Always review MEDIUM confidence validator findings"
echo "   • Character names should be realistic and culturally diverse"
echo "   • Deep dive insights should be 2-3 sentences (not generic)"
echo "   • Batch processing: --parallel=4 for multiple scenarios"
echo ""

# Warnings if issues detected
if [ -f "src/services/staticData.ts" ]; then
    # Check for potential data issues
    if grep -q '城镇\|区间\|[^[:ascii:]]' src/services/staticData.ts 2>/dev/null; then
        echo -e "${YELLOW}⚠️  WARNING: Non-ASCII characters detected in staticData.ts${NC}"
        echo "   Run: npm run validate"
        echo ""
    fi
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Ready to extract! Starting session for Phase 7 content extraction."
echo ""

exit 0
