#!/bin/bash

# FluentStep Extraction Pipeline - Auto-Validation Hook
# Triggered after Write operations to critical files
# Purpose: Ensure data integrity before scenarios are committed

# Parse input from stdin (JSON format from Claude Code)
INPUT=$(cat)

# Extract file path from input
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function: Run validation on modified file
run_validation() {
    local file="$1"

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" >&2
    echo -e "${BLUE}🔍 Auto-Validation Hook Triggered${NC}" >&2
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" >&2
    echo "📄 File modified: $(basename "$file")" >&2
    echo "" >&2

    # Run npm run validate (from project root)
    cd "$(dirname "$(dirname "$file")")" || exit 1

    if npm run validate > /tmp/validation_output.txt 2>&1; then
        echo -e "${GREEN}✓ Validation PASSED${NC}" >&2
        echo "  All scenarios are data-integrity clean" >&2
        cat /tmp/validation_output.txt | tail -5 >&2
        echo "" >&2
        echo -e "${GREEN}✓ Safe to commit this change${NC}" >&2
        return 0
    else
        echo -e "${RED}✗ Validation FAILED${NC}" >&2
        echo "  Data integrity issues detected:" >&2
        echo "" >&2
        cat /tmp/validation_output.txt | grep -A 20 "error\|Error\|ERROR" >&2 || cat /tmp/validation_output.txt >&2
        echo "" >&2
        echo -e "${RED}✗ BLOCKING: Fix errors before commit${NC}" >&2
        return 2  # Return 2 to block operation
    fi
}

# Function: Check bundle size after build
check_bundle_size() {
    local js_size=""
    local css_size=""

    echo -e "${BLUE}📦 Checking bundle size...${NC}" >&2

    # Get file sizes (gzipped if available)
    if [ -f "dist/index.js.gz" ]; then
        js_size=$(du -h "dist/index.js.gz" | cut -f1)
        local js_bytes=$(stat -f%z "dist/index.js.gz" 2>/dev/null || stat -c%s "dist/index.js.gz")
        echo "  JavaScript: $js_size (gzipped)" >&2

        # Check against 350 KB limit
        if [ "$js_bytes" -gt 368640 ]; then  # 350 KB in bytes
            echo -e "${RED}✗ Bundle size EXCEEDED: $js_size > 350 KB${NC}" >&2
            return 2
        fi
    fi

    if [ -f "dist/index.css.gz" ]; then
        css_size=$(du -h "dist/index.css.gz" | cut -f1)
        local css_bytes=$(stat -f%z "dist/index.css.gz" 2>/dev/null || stat -c%s "dist/index.css.gz")
        echo "  CSS: $css_size (gzipped)" >&2

        # Check against 45 KB limit
        if [ "$css_bytes" -gt 47000 ]; then  # 45 KB in bytes
            echo -e "${RED}✗ Bundle size EXCEEDED: $css_size > 45 KB${NC}" >&2
            return 2
        fi
    fi

    echo -e "${GREEN}✓ Bundle size acceptable${NC}" >&2
    return 0
}

# Main logic: Route based on file modified

if [ -z "$FILE" ]; then
    # No file path detected - pass through
    exit 0
fi

# Case 1: staticData.ts modified (scenario data)
if [[ "$FILE" == *"staticData.ts"* ]]; then
    echo "Scenario data file modified: Running comprehensive validation..." >&2

    run_validation "$FILE"
    validation_result=$?

    if [ $validation_result -ne 0 ]; then
        echo -e "${YELLOW}⚠️  HOOK: Blocking write due to validation failure${NC}" >&2
        echo -e "${YELLOW}Action: Fix the data integrity issues and retry${NC}" >&2
        exit 2
    fi

    exit 0
fi

# Case 2: answerVariations or deepDiveInsights modified
if [[ "$FILE" == *"answerVariations"* ]] || [[ "$FILE" == *"deepDiveInsights"* ]]; then
    echo "Scenario metadata modified: Running validation..." >&2

    run_validation "$FILE"
    validation_result=$?

    if [ $validation_result -ne 0 ]; then
        echo -e "${YELLOW}⚠️  HOOK: Blocking write due to validation failure${NC}" >&2
        exit 2
    fi

    exit 0
fi

# Case 3: TypeScript files in services/ (new services)
if [[ "$FILE" == *"/services/"*.ts* ]]; then
    echo "Service file modified: Checking TypeScript compilation..." >&2

    cd "$(git rev-parse --show-toplevel)" 2>/dev/null || cd "$(dirname "$(dirname "$FILE")")" || exit 1

    if npm run build > /tmp/build_output.txt 2>&1; then
        echo -e "${GREEN}✓ Build successful${NC}" >&2
        check_bundle_size
        exit 0
    else
        echo -e "${RED}✗ Build failed${NC}" >&2
        cat /tmp/build_output.txt | tail -10 >&2
        exit 2
    fi
fi

# Case 4: scripts/ modified (extraction orchestration)
if [[ "$FILE" == *"/scripts/"*.ts* ]] && [[ "$FILE" == *"extract"* || "$FILE" == *"orchestrate"* ]]; then
    echo "Extraction script modified: Checking TypeScript compilation..." >&2

    cd "$(git rev-parse --show-toplevel)" 2>/dev/null || cd "$(dirname "$(dirname "$FILE")")" || exit 1

    if npm run build > /tmp/build_output.txt 2>&1; then
        echo -e "${GREEN}✓ Build successful${NC}" >&2
        exit 0
    else
        echo -e "${RED}✗ Build failed${NC}" >&2
        cat /tmp/build_output.txt | tail -10 >&2
        exit 2
    fi
fi

# Default: No validation needed
exit 0
