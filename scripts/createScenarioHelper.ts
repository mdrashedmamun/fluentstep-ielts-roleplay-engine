#!/usr/bin/env tsx

/**
 * Helper script to invoke scenario-creator agent
 * Provides clear instructions for non-technical users
 *
 * Usage: npm run create:scenario
 */

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║        🎯 FluentStep Scenario Creator                              ║
║                                                                    ║
║  Interactive guided workflow for creating IELTS roleplay           ║
║  scenarios with automatic validation                              ║
╚════════════════════════════════════════════════════════════════════╝

📋 HOW TO USE
═════════════════════════════════════════════════════════════════════

SIMPLE METHOD (Recommended for everyone):
─────────────────────────────────────────
1. Open Claude Code
2. Type one of these:
   • "create a new scenario"
   • "make a scenario"
   • "I want to create a scenario"

3. Claude Code will activate the Scenario Creator Agent
4. Answer the interactive questions:
   ✓ Category (Social, Workplace, Service, Healthcare, etc.)
   ✓ Topic/Context (e.g., "Performance review", "At a café")
   ✓ Number of turns (8-20 recommended)
   ✓ Difficulty level (B1, B2, C1, C2)

5. The agent will:
   ✓ Show you a dialogue preview
   ✓ Ask for your approval
   ✓ Generate all data automatically
   ✓ Run validation checks
   ✓ Fix any errors automatically
   ✓ Add the scenario to your project


🤖 WHAT THE AGENT DOES
═════════════════════════════════════════════════════════════════════

✅ GENERATES (All Automatic)
   • Natural UK English dialogue (2-12 turns)
   • Blanks at pedagogically valuable points
   • Answer variations (3 per blank)
   • Chunk feedback (meaning, use cases, examples)
   • Pattern summaries (category breakdowns)
   • Active recall questions (5-15 practice questions)

✅ VALIDATES (All Automatic)
   • Structural integrity (counts match)
   • Content quality (word limits, category diversity)
   • TypeScript compatibility (no build errors)

✅ HANDLES ERRORS (All Automatic)
   • Fixes blank count mismatches
   • Auto-generates missing feedback items
   • Corrects word count overages
   • Suggests fixes in plain English (not technical jargon)

✅ INTEGRATES (All Automatic)
   • Creates backup of staticData.ts
   • Merges scenario at correct position
   • Verifies build succeeds
   • Shows success message with test URL


📊 WHAT YOU NEED TO PROVIDE
═════════════════════════════════════════════════════════════════════

The agent asks you 4 simple questions:

1️⃣  CATEGORY
    Social (everyday conversations)
    Workplace (professional settings)
    Service/Logistics (shops, airports, hotels)
    Healthcare (doctor visits, appointments)
    Community (civic engagement)
    Academic (university contexts)
    Cultural (cross-cultural interactions)

2️⃣  TOPIC/CONTEXT
    Just type what the scenario is about
    Examples: "Performance review", "At a café", "Doctor appointment"

3️⃣  NUMBER OF TURNS
    How many dialogue exchanges?
    Recommended: 8-20 turns

4️⃣  DIFFICULTY LEVEL
    B1 (Band 4-5) - Elementary
    B2 (Band 6-7) - Intermediate
    C1 (Band 7-8) - Advanced
    C2 (Band 8-9) - Mastery


✨ AFTER SCENARIO IS CREATED
═════════════════════════════════════════════════════════════════════

You'll see:
  ✅ Scenario successfully created
  📋 Scenario ID (e.g., workplace-53-performance-review)
  🧪 Test URL (e.g., http://localhost:3004/scenario/workplace-53-...)
  📝 Next steps (test, review, commit)

Then you can:
  1. Test the scenario at the URL shown
  2. Try filling in blanks to verify answers
  3. Review the feedback in the modal
  4. Commit with: git commit -m "feat: Add scenario-id"


🆘 TROUBLESHOOTING
═════════════════════════════════════════════════════════════════════

"I don't see the agent responding"
  → Make sure you're in Claude Code (not the web chat)
  → Wait 2-3 seconds for the agent to initialize
  → Try typing: "create scenario"

"The agent asked for edits"
  → Answer the questions - it's all plain English
  → If you want to change dialogue: type 'edit' and make changes
  → If dialogue isn't working: type 'no' to regenerate

"Build failed or validation error"
  → The agent will explain in plain English what went wrong
  → It will automatically try to fix common issues
  → If it can't fix: follow the suggested options

"I want to see example scenarios first"
  → Ask in Claude Code: "show me example scenarios in the workspace"
  → Or look at: http://localhost:3004/scenario/social-1-flatmate


💡 PRO TIPS
═════════════════════════════════════════════════════════════════════

✓ Start with a simple scenario (8-10 turns, B2 difficulty)
  This helps you understand the system before creating complex ones

✓ Use existing scenarios as inspiration
  Type in Claude Code: "show me social category scenarios"

✓ Test thoroughly after creation
  Fill in all blanks, check feedback quality, read pattern summaries

✓ Commit often
  After each scenario works well, commit to git

✓ Create in batches
  Creating 3-5 related scenarios is easier than one-offs


📚 WHAT MAKES A GOOD SCENARIO
═════════════════════════════════════════════════════════════════════

Good scenarios have:
  ✓ Natural dialogue (sounds like real people talking)
  ✓ Rising tension/purpose (conversation goes somewhere)
  ✓ 8-20 turns (not too short, not too long)
  ✓ Blanks at learning moments (phrases worth learning)
  ✓ Variety of chunk types (openers, repairs, exits, etc.)

Bad scenarios to avoid:
  ✗ Formal/textbook-like ("Good afternoon, how are you today?")
  ✗ Too simple (only basic greetings)
  ✗ Too complex (hard to follow or too many blanks)
  ✗ Missing purpose (just small talk, nothing happens)


🚀 GETTING STARTED RIGHT NOW
═════════════════════════════════════════════════════════════════════

1. You have everything you need - no setup required!

2. Open Claude Code and type:
   "create a new scenario"

3. Answer 4 simple questions

4. Done! The agent handles everything else


Need help? Ask in Claude Code:
"What questions do you have for scenario creation?"
or
"Show me example scenarios first"

Happy creating! 🎉
`);
