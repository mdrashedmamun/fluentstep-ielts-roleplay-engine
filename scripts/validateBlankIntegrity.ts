#!/usr/bin/env tsx

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { CURATED_ROLEPLAYS, type RoleplayScript } from '../src/services/staticData';
import { countDialogueBlanks, getAnswerDataForBlank, getAnswerIndexBase, getAnswerIndexForBlank } from '../src/services/blankIndexing';

type Severity = 'Blocker' | 'High' | 'Medium' | 'Low';

interface BlankContext {
  renderedBlankIndex: number;
  lineIndex: number;
  occurrenceInLine: number;
  originalSentence: string;
  before: string;
  after: string;
}

interface SubstitutionRecord {
  scenarioId: string;
  topic: string;
  renderedBlankIndex: number;
  answerIndex: number;
  valueType: 'answer' | 'alternative';
  value: string;
  substitutedSentence: string;
}

interface BlankIssue {
  severity: Severity;
  scenarioId: string;
  topic: string;
  renderedBlankIndex: number;
  answerIndex: number | null;
  valueType: 'answer' | 'alternative' | 'mapping';
  value: string;
  originalSentence: string;
  substitutedSentence: string;
  reason: string;
  recommendedFix: string;
}

const reportDir = path.join(process.cwd(), 'docs/qa/long-horizon');
const fallbackReportDir = path.join('/private/tmp', 'fluentstep-blank-integrity');
const records: SubstitutionRecord[] = [];
const issues: BlankIssue[] = [];

function writeOut(message = ''): void {
  process.stdout.write(`${message}\n`);
}

function getBlankContexts(script: RoleplayScript): BlankContext[] {
  const contexts: BlankContext[] = [];
  let renderedBlankIndex = 0;

  script.dialogue.forEach((turn, lineIndex) => {
    const parts = turn.text.split(/_{6,}/);
    for (let occurrenceInLine = 0; occurrenceInLine < parts.length - 1; occurrenceInLine++) {
      contexts.push({
        renderedBlankIndex,
        lineIndex,
        occurrenceInLine,
        originalSentence: turn.text,
        before: parts[occurrenceInLine] || '',
        after: parts[occurrenceInLine + 1] || '',
      });
      renderedBlankIndex += 1;
    }
  });

  return contexts;
}

function substituteBlank(context: BlankContext, value: string): string {
  let seen = 0;
  return context.originalSentence.replace(/________/g, (match) => {
    if (seen === context.occurrenceInLine) {
      seen += 1;
      return value;
    }
    seen += 1;
    return match;
  });
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function addIssue(issue: BlankIssue): void {
  issues.push(issue);
}

function evaluateSubstitution(
  script: RoleplayScript,
  context: BlankContext,
  answerIndex: number,
  valueType: 'answer' | 'alternative',
  value: string
): void {
  const substitutedSentence = substituteBlank(context, value);
  records.push({
    scenarioId: script.id,
    topic: script.topic,
    renderedBlankIndex: context.renderedBlankIndex,
    answerIndex,
    valueType,
    value,
    substitutedSentence,
  });

  const substituted = normalize(substitutedSentence);
  const normalizedValue = normalize(value);
  const words = substituted.split(/\s+/).filter(Boolean);
  const allowedRepeats = new Set(['yes', 'no', 'very', 'really', 'so']);

  if (normalizedValue.length === 0) {
    addIssue({
      severity: 'High',
      scenarioId: script.id,
      topic: script.topic,
      renderedBlankIndex: context.renderedBlankIndex,
      answerIndex,
      valueType,
      value,
      originalSentence: context.originalSentence,
      substitutedSentence,
      reason: 'Empty answer or alternative cannot teach a usable spoken chunk.',
      recommendedFix: 'Replace the empty value with a natural answer that fits this blank context.',
    });
  }

  for (let i = 0; i < words.length - 1; i++) {
    if (words[i] === words[i + 1] && !allowedRepeats.has(words[i] || '')) {
      addIssue({
        severity: 'High',
        scenarioId: script.id,
        topic: script.topic,
        renderedBlankIndex: context.renderedBlankIndex,
        answerIndex,
        valueType,
        value,
        originalSentence: context.originalSentence,
        substitutedSentence,
        reason: `Duplicate adjacent word "${words[i]}" after substitution.`,
        recommendedFix: 'Adjust the answer or surrounding dialogue so the substituted sentence is grammatical.',
      });
      break;
    }
  }

  const deterministicGrammarIssues: Array<[RegExp, string]> = [
    [/\ba few of issues\b/, 'Use "a few issues" rather than "a few of issues".'],
    [/\ba several\b/, 'Use "several" rather than "a several".'],
    [/\bsort out me\b/, 'Use "sort me out" or "sort out" rather than "sort out me".'],
    [/\bfewer urgent\b/, 'Use "less urgent" rather than "fewer urgent".'],
    [/\blower urgent\b/, 'Use "less urgent" rather than "lower urgent".'],
  ];

  for (const [pattern, reason] of deterministicGrammarIssues) {
    if (pattern.test(substituted)) {
      addIssue({
        severity: 'High',
        scenarioId: script.id,
        topic: script.topic,
        renderedBlankIndex: context.renderedBlankIndex,
        answerIndex,
        valueType,
        value,
        originalSentence: context.originalSentence,
        substitutedSentence,
        reason,
        recommendedFix: 'Replace the value with a grammatically valid spoken alternative for this exact sentence.',
      });
    }
  }

  const greetingPhrase = /\b(nice to meet|pleasure to meet|good to meet|lovely to meet)\b/;
  const descriptorSlot = /\b(quite|very|really|fairly|rather|so|seems|sounds|looks|feels|is|are|was|were)\s+$/i.test(context.before.trim());
  const placeOrStateAfter = /^\s+(here|there|so far|today|at the moment|now)\b/i.test(context.after);

  if (greetingPhrase.test(normalizedValue) && (descriptorSlot || placeOrStateAfter)) {
    addIssue({
      severity: 'High',
      scenarioId: script.id,
      topic: script.topic,
      renderedBlankIndex: context.renderedBlankIndex,
      answerIndex,
      valueType,
      value,
      originalSentence: context.originalSentence,
      substitutedSentence,
      reason: 'Greeting phrase is being substituted into an adjective/place-description slot.',
      recommendedFix: 'Use a descriptor such as peaceful, quiet, busy, friendly, or another context-fitting adjective.',
    });
  }

  if (/\bquite\s+(nice to meet|pleasure to meet|good to meet|lovely to meet)\s+(here|there)\b/.test(substituted)) {
    addIssue({
      severity: 'High',
      scenarioId: script.id,
      topic: script.topic,
      renderedBlankIndex: context.renderedBlankIndex,
      answerIndex,
      valueType,
      value,
      originalSentence: context.originalSentence,
      substitutedSentence,
      reason: 'Substituted sentence creates an impossible phrase like "quite nice to meet here".',
      recommendedFix: 'Fix answer mapping or replace the answer with a place descriptor.',
    });
  }
}

function assertIndexingSelfCheck(): void {
  const zeroBased = {
    answerVariations: [
      { index: 0, answer: 'zero', alternatives: [] },
      { index: 1, answer: 'one', alternatives: [] },
    ],
  } as Pick<RoleplayScript, 'answerVariations'>;
  const oneBased = {
    answerVariations: [
      { index: 1, answer: 'first', alternatives: [] },
      { index: 2, answer: 'second', alternatives: [] },
    ],
  } as Pick<RoleplayScript, 'answerVariations'>;

  if (getAnswerIndexBase(zeroBased) !== 0 || getAnswerDataForBlank(zeroBased, 1)?.answer !== 'one') {
    throw new Error('Blank indexing self-check failed for zero-based answer indexes.');
  }

  if (getAnswerIndexBase(oneBased) !== 1 || getAnswerDataForBlank(oneBased, 1)?.answer !== 'second') {
    throw new Error('Blank indexing self-check failed for one-based answer indexes.');
  }
}

async function writeReportFile(fileName: string, content: string): Promise<void> {
  const repoPath = path.join(reportDir, fileName);
  try {
    await writeFile(repoPath, content);
    return;
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
    if (code !== 'EPERM' && code !== 'EACCES') {
      throw error;
    }
  }

  await mkdir(fallbackReportDir, { recursive: true });
  await writeFile(path.join(fallbackReportDir, fileName), content);
}

async function main(): Promise<void> {
  assertIndexingSelfCheck();

  for (const script of CURATED_ROLEPLAYS) {
    const contexts = getBlankContexts(script);
    const answerCount = script.answerVariations.length;
    const blankCount = countDialogueBlanks(script);

    if (contexts.length !== blankCount || blankCount !== answerCount) {
      addIssue({
        severity: 'Blocker',
        scenarioId: script.id,
        topic: script.topic,
        renderedBlankIndex: -1,
        answerIndex: null,
        valueType: 'mapping',
        value: '',
        originalSentence: '',
        substitutedSentence: '',
        reason: `Blank mapping mismatch: ${blankCount} dialogue blanks, ${contexts.length} contexts, ${answerCount} answers.`,
        recommendedFix: 'Align visible dialogue blanks with answerVariations before auditing substitutions.',
      });
      continue;
    }

    for (const context of contexts) {
      const answerData = getAnswerDataForBlank(script, context.renderedBlankIndex);
      const answerIndex = getAnswerIndexForBlank(script, context.renderedBlankIndex);

      if (!answerData) {
        addIssue({
          severity: 'Blocker',
          scenarioId: script.id,
          topic: script.topic,
          renderedBlankIndex: context.renderedBlankIndex,
          answerIndex,
          valueType: 'mapping',
          value: '',
          originalSentence: context.originalSentence,
          substitutedSentence: context.originalSentence,
          reason: `No answerVariation found for rendered blank ${context.renderedBlankIndex} / answer index ${answerIndex}.`,
          recommendedFix: 'Fix answerVariations indexes or blank indexing base for this scenario.',
        });
        continue;
      }

      evaluateSubstitution(script, context, answerData.index, 'answer', answerData.answer);
      for (const alternative of answerData.alternatives || []) {
        evaluateSubstitution(script, context, answerData.index, 'alternative', alternative);
      }
    }
  }

  await mkdir(reportDir, { recursive: true });
  await writeReportFile('blank-integrity-report.json', JSON.stringify({
    generatedAt: new Date().toISOString(),
    scenarioCount: CURATED_ROLEPLAYS.length,
    blankCount: CURATED_ROLEPLAYS.reduce((count, script) => count + countDialogueBlanks(script), 0),
    substitutionRecordCount: records.length,
    issues,
    records,
  }, null, 2));

  const lines: string[] = [];
  lines.push('# Blank Integrity Report');
  lines.push('');
  lines.push(`- Generated: ${new Date().toISOString()}`);
  lines.push(`- Scenarios: ${CURATED_ROLEPLAYS.length}`);
  lines.push(`- Blanks audited: ${CURATED_ROLEPLAYS.reduce((count, script) => count + countDialogueBlanks(script), 0)}`);
  lines.push(`- Substitutions audited: ${records.length}`);
  lines.push(`- Issues: ${issues.length}`);
  lines.push('');
  if (issues.length === 0) {
    lines.push('No automated blank integrity issues were detected. Human content review is still required for pedagogy and nuance.');
  } else {
    lines.push('| Severity | Scenario | Blank | Value | Evidence | Recommended fix |');
    lines.push('| --- | --- | ---: | --- | --- | --- |');
    for (const issue of issues) {
      lines.push(`| ${issue.severity} | ${issue.scenarioId} | ${issue.renderedBlankIndex + 1} | ${escapeCell(issue.value)} | ${escapeCell(issue.reason + ' Evidence: ' + issue.substitutedSentence)} | ${escapeCell(issue.recommendedFix)} |`);
    }
  }
  lines.push('');
  await writeReportFile('blank-integrity-report.md', `${lines.join('\n')}\n`);

  writeOut('=== Blank Integrity Validation ===');
  writeOut(`Scenarios: ${CURATED_ROLEPLAYS.length}`);
  writeOut(`Blanks audited: ${CURATED_ROLEPLAYS.reduce((count, script) => count + countDialogueBlanks(script), 0)}`);
  writeOut(`Substitutions audited: ${records.length}`);
  writeOut(`Issues: ${issues.length}`);

  if (issues.some((issue) => issue.severity === 'Blocker' || issue.severity === 'High')) {
    process.exitCode = 1;
  }
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
