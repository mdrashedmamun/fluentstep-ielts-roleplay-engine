# Documentation Navigation Guide

After the codebase reorganization (Feb 14, 2026), all documentation is organized into clear categories.

## Quick Navigation

### 🏗️ Architecture & Design
**Start here to understand the project**

- **[.claude/README.md](../.claude/README.md)** - Complete agent architecture, quality gates, validation pipeline, scaling roadmap
- **[docs/implementation-reports/IMPLEMENTATION_SUMMARY.md](./implementation-reports/IMPLEMENTATION_SUMMARY.md)** - High-level implementation overview

### 🧪 Testing & Quality
**Understand how the system is validated**

- **[docs/test-reports/](./test-reports/)** - All test and verification reports
  - E2E test reports, active recall testing, QA verification
  - Deployment verification, feedback testing

### 🚀 Getting Started
**Learn how to use and develop the system**

- **[docs/quick-start-guides/](./quick-start-guides/)** - Quick start guides for features
  - Pattern summaries, chunk feedback, QA agent guides
  - Site testing and roadmap guides

### 📋 Scenarios & Features
**Deep dives into specific implementations**

- **[docs/scenario-docs/](./scenario-docs/)** - Scenario specifications and guides
  - Landlord repair scenario, B2 scenarios, quick summaries

### 📸 Test Evidence
**Screenshots used in testing and verification**

- **[docs/screenshots/](./screenshots/)** - All archived screenshots (21 MB)
- **[docs/screenshots/README.md](./screenshots/README.md)** - Screenshot archive guidelines

---

## Finding Specific Documents

### Implementation Details
Looking for how a feature was implemented?
→ Check `docs/implementation-reports/`

Examples:
- Content package generation system
- Pattern summary workflow
- Scenario creator agent
- Post-roleplay feedback system
- Cambridge design layer
- Chunk feedback system

### Testing Results
Looking for test execution results?
→ Check `docs/test-reports/`

Examples:
- E2E test reports (Tier 1, Tier 2)
- Active recall testing playbook
- QA agent verification reports
- Deployment verification

### How-To Guides
Looking for instructions on using features?
→ Check `docs/quick-start-guides/`

Examples:
- How to use chunk feedback
- How to test on live site
- How to use QA agent
- Pattern summary quick start
- Error-free development roadmap

### Root Documentation
Essential project files that stay in root:

- **README.md** - Project overview
- **RULES.md** - Coding standards and patterns
- **QUICK_REFERENCE.md** - Quick command reference
- **REORGANIZATION_COMPLETE.md** - This reorganization details

---

## File Statistics

| Category | Files | Size | Purpose |
|----------|-------|------|---------|
| Implementation Reports | 15 | ~6 MB | Feature documentation |
| Test Reports | 20 | ~5 MB | Testing & verification |
| Quick Start Guides | 6 | ~1.5 MB | How-to documentation |
| Scenario Docs | 6 | ~800 KB | Scenario specifications |
| Screenshots | 39 | ~21 MB | Test evidence |
| **Total** | **86** | **~34 MB** | Organized docs |

---

## Navigation Tips

1. **Use Ctrl+P (or Cmd+P) in your editor** to search for specific files by name
2. **Use the sidebar** in your code editor to browse the organized structure
3. **Start with .claude/README.md** for architecture understanding
4. **Use README.md in each category** for category overview
5. **Sort by date modified** to find recently updated documents

---

## Adding New Documentation

When adding new documentation:

1. **Implementation details?** → Add to `docs/implementation-reports/`
2. **Testing/verification?** → Add to `docs/test-reports/`
3. **How-to guide?** → Add to `docs/quick-start-guides/`
4. **Scenario spec?** → Add to `docs/scenario-docs/`
5. **Screenshot evidence?** → Add to `docs/screenshots/archive/`

See `.gitignore` for prevention patterns that will automatically exclude temp files.

---

## Key Resources

| Resource | Location | Purpose |
|----------|----------|---------|
| Architecture Guide | .claude/README.md | Agents, pipeline, quality gates |
| Agent Specs | .claude/agents/*/SKILL.md | Individual agent documentation |
| Build Status | .claude/settings.json | Current build configuration |
| Code Standards | RULES.md | Coding patterns and conventions |
| Quick Commands | QUICK_REFERENCE.md | Common commands and shortcuts |

---

**Last Updated**: Feb 14, 2026
**Status**: Post-reorganization (all documentation organized and navigable)
