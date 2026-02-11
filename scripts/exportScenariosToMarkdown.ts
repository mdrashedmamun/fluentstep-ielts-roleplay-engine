import { CURATED_ROLEPLAYS, RoleplayScript, ChunkFeedback } from '../src/services/staticData'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Group scenarios by category
function groupByCategory(scenarios: RoleplayScript[]): Map<string, RoleplayScript[]> {
  const groups = new Map<string, RoleplayScript[]>()
  scenarios.forEach(scenario => {
    const category = scenario.category
    if (!groups.has(category)) {
      groups.set(category, [])
    }
    groups.get(category)!.push(scenario)
  })
  return groups
}

// Format metadata section
function formatMetadata(scenario: RoleplayScript): string {
  let md = `**ID**: \`${scenario.id}\`\n\n`
  md += `**Context**: ${scenario.context}\n\n`
  return md
}

// Format characters section
function formatCharacters(scenario: RoleplayScript): string {
  if (!scenario.characters || scenario.characters.length === 0) {
    return ''
  }
  let md = `### Characters\n\n`
  scenario.characters.forEach(char => {
    md += `- **${char.name}**: ${char.description}\n`
  })
  md += '\n'
  return md
}

// Format dialogue in conversational blocks
function formatDialogue(scenario: RoleplayScript): string {
  if (!scenario.dialogue || scenario.dialogue.length === 0) {
    return ''
  }
  let md = `### Dialogue\n\n`
  scenario.dialogue.forEach(line => {
    md += `**${line.speaker}**: ${line.text}\n\n`
  })
  return md
}

// Format answer variations
function formatAnswers(scenario: RoleplayScript): string {
  if (!scenario.answerVariations || scenario.answerVariations.length === 0) {
    return ''
  }
  let md = `### Answers (Blank-by-Blank)\n\n`
  scenario.answerVariations.forEach(variation => {
    md += `**Blank ${variation.index}**: \`${variation.answer}\`\n`
    if (variation.alternatives && variation.alternatives.length > 0) {
      md += `- Alternatives: ${variation.alternatives.map(alt => `\`${alt}\``).join(', ')}\n`
    } else {
      md += `- Alternatives: _(none)_\n`
    }
    md += '\n'
  })
  return md
}

// Format legacy deepDive feedback
function formatDeepDive(scenario: RoleplayScript): string {
  if (!scenario.deepDive || scenario.deepDive.length === 0) {
    return ''
  }
  let md = `### Legacy Feedback (deepDive)\n\n`
  scenario.deepDive.forEach(item => {
    md += `**Blank ${item.index}** - "${item.phrase}":\n`
    md += `${item.insight}\n\n`
  })
  return md
}

// Format chunk feedback with full detail
function formatChunkFeedback(scenario: RoleplayScript): string {
  if (!scenario.chunkFeedback || scenario.chunkFeedback.length === 0) {
    return ''
  }
  let md = `### Pattern Recognition / Chunk Feedback\n\n`

  scenario.chunkFeedback.forEach((chunk, idx) => {
    md += `#### Chunk ${idx + 1}: "${chunk.chunk}" (Category: ${chunk.category})\n\n`
    md += `**Blank Index**: ${chunk.blankIndex}\n\n`

    md += `**Core Function**:\n`
    md += `${chunk.coreFunction}\n\n`

    md += `**Real-Life Situations**:\n`
    chunk.situations.forEach((sit, i) => {
      md += `${i + 1}. **${sit.context}**: "${sit.example}"\n`
    })
    md += '\n'

    md += `**Native Usage Notes**:\n`
    chunk.nativeUsageNotes.forEach(note => {
      md += `- ${note}\n`
    })
    md += '\n'

    md += `**Non-Native vs Native Contrast**:\n\n`
    chunk.nonNativeContrast.forEach((contrast, i) => {
      md += `${i + 1}. ❌ **Non-Native**: "${contrast.nonNative}"\n`
      md += `   ✅ **Native**: "${contrast.native}"\n`
      md += `   **Why?** ${contrast.explanation}\n\n`
    })

    md += '---\n\n'
  })

  return md
}

// Format complete scenario
function formatScenario(scenario: RoleplayScript, index: number): string {
  let md = `## Scenario ${index + 1}: ${scenario.topic}\n\n`
  md += formatMetadata(scenario)
  md += formatCharacters(scenario)
  md += formatDialogue(scenario)
  md += formatAnswers(scenario)

  // Combine both feedback systems
  const deepDive = formatDeepDive(scenario)
  const chunkFeedback = formatChunkFeedback(scenario)

  if (deepDive || chunkFeedback) {
    md += '### Feedback\n\n'
    if (deepDive) {
      md += deepDive
    }
    if (chunkFeedback) {
      md += chunkFeedback
    }
  }

  return md
}

// Get sanitized filename from category
function getCategoryFilename(category: string): string {
  return category.replace(/\//g, '-').replace(/\s+/g, '-') + '.md'
}

// Main export function
function main() {
  // Create exports directory
  const exportsDir = path.join(__dirname, '..', 'exports')
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true })
  }

  // Group all scenarios by category
  const categoryGroups = groupByCategory(CURATED_ROLEPLAYS)

  // Export each category to its own file
  const exportedFiles: string[] = []
  let totalScenarios = 0

  categoryGroups.forEach((scenarios, category) => {
    let markdown = `# ${category} Scenarios - FluentStep Content Export\n\n`
    markdown += `**Export Date**: ${new Date().toISOString().split('T')[0]}\n`
    markdown += `**Category**: ${category}\n`
    markdown += `**Total Scenarios**: ${scenarios.length}\n\n`
    markdown += '---\n\n'

    scenarios.forEach((scenario, idx) => {
      markdown += formatScenario(scenario, idx)
      if (idx < scenarios.length - 1) {
        markdown += '\n---\n\n'
      }
    })

    // Sanitize category name for filename
    const filename = getCategoryFilename(category)
    const outputPath = path.join(exportsDir, filename)
    fs.writeFileSync(outputPath, markdown, 'utf-8')

    console.log(`✅ Exported ${scenarios.length} scenarios to exports/${filename}`)
    exportedFiles.push(filename)
    totalScenarios += scenarios.length
  })

  console.log(`\n🎉 Export complete! ${totalScenarios} scenarios exported to ${exportedFiles.length} files.`)
  console.log(`\nFiles created:`)
  exportedFiles.sort().forEach(file => {
    console.log(`  - exports/${file}`)
  })
}

main()
