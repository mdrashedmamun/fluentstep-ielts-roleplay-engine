#!/usr/bin/env tsx

import { chromium, type Browser, type BrowserContext, type Locator, type Page } from 'playwright';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { CURATED_ROLEPLAYS } from '../src/services/staticData';

type Severity = 'Blocker' | 'High' | 'Medium' | 'Low';

interface BrowserIssue {
  severity: Severity;
  location: string;
  evidence: string;
  whyItMatters: string;
  recommendedFix: string;
  validationMethod: string;
  status: 'open' | 'closed' | 'needs-product-judgement';
}

interface ScreenshotEvidence {
  name: string;
  path: string;
  viewport: string;
}

const cwd = process.cwd();
const baseURL = process.env.FLUENTSTEP_QA_BASE_URL || 'http://127.0.0.1:3000';
const scenarioId = process.env.FLUENTSTEP_QA_SCENARIO || 'service_1_restaurant_order';
const reportDir = path.join(cwd, 'docs/qa/long-horizon');
const screenshotDir = path.join(reportDir, 'screenshots');
const issues: BrowserIssue[] = [];
const screenshots: ScreenshotEvidence[] = [];
const consoleErrors: string[] = [];
const failedResponses: string[] = [];
let server: ChildProcessWithoutNullStreams | null = null;

function recordIssue(issue: BrowserIssue): void {
  issues.push(issue);
}

interface AppIdentity {
  reachable: boolean;
  isFluentStep: boolean;
  evidence: string;
}

async function getAppIdentity(): Promise<AppIdentity> {
  try {
    const response = await fetch(baseURL, { signal: AbortSignal.timeout(1500) });
    const html = await response.text();
    const title = html.match(/<title>(.*?)<\/title>/i)?.[1]?.trim() || 'missing title';
    const isFluentStep = response.status < 500 && /FluentStep:\s*IELTS Roleplay Engine/i.test(title);

    return {
      reachable: response.ok || response.status < 500,
      isFluentStep,
      evidence: `HTTP ${response.status}; title: ${title}`,
    };
  } catch (error) {
    return {
      reachable: false,
      isFluentStep: false,
      evidence: error instanceof Error ? error.message : String(error),
    };
  }
}

async function isFluentStepReachable(): Promise<boolean> {
  return (await getAppIdentity()).isFluentStep;
}

async function startLocalApp(): Promise<void> {
  const identity = await getAppIdentity();
  if (identity.isFluentStep) {
    return;
  }

  if (identity.reachable) {
    recordIssue({
      severity: 'Blocker',
      location: 'Local dev server',
      evidence: `${baseURL} is reachable but does not identify as FluentStep. ${identity.evidence}`,
      whyItMatters: 'Browser QA must exercise the FluentStep app, not whichever local service happens to own the port.',
      recommendedFix: 'Stop the conflicting local service or set FLUENTSTEP_QA_BASE_URL to a running FluentStep instance, then rerun npm run qa:browser.',
      validationMethod: 'npm run qa:browser fails on non-FluentStep routes and exits 0 only against a FluentStep route.',
      status: 'open',
    });
    throw new Error(`Wrong app is reachable at ${baseURL}: ${identity.evidence}`);
  }

  server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '3000'], {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, BROWSER: 'none' },
  });

  let logs = '';
  server.stdout.on('data', (chunk: Buffer) => {
    logs += chunk.toString();
  });
  server.stderr.on('data', (chunk: Buffer) => {
    logs += chunk.toString();
  });

  for (let i = 0; i < 80; i++) {
    if (await isFluentStepReachable()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  recordIssue({
    severity: 'Blocker',
    location: 'Local dev server',
    evidence: `Could not reach ${baseURL}. Logs: ${logs.slice(-1200)}`,
    whyItMatters: 'Browser QA cannot run without a local app route.',
    recommendedFix: 'Fix dev server startup or port binding, then rerun npm run qa:browser.',
    validationMethod: 'npm run qa:browser exits 0 and writes screenshots.',
    status: 'open',
  });
  throw new Error(`Local app did not become reachable at ${baseURL}`);
}

async function screenshot(page: Page, name: string, viewport: string): Promise<void> {
  const filePath = path.join(screenshotDir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  screenshots.push({ name, path: filePath, viewport });
}

async function visible(locator: Locator, timeout = 3000): Promise<boolean> {
  try {
    await locator.first().waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

async function requireVisible(page: Page, locator: Locator, location: string, evidence: string): Promise<void> {
  if (!(await visible(locator))) {
    recordIssue({
      severity: 'High',
      location,
      evidence,
      whyItMatters: 'A primary user-flow element was not visible during automated browser QA.',
      recommendedFix: 'Inspect the route and ensure the expected state renders with accessible visible text.',
      validationMethod: 'Rerun npm run qa:browser and confirm the issue is absent from browser-qa-report.md.',
      status: 'open',
    });
  }
}

async function prepareContext(browser: Browser, viewport: { width: number; height: number }): Promise<BrowserContext> {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(() => {
    window.localStorage.setItem('fluentstep:skipOnboarding', 'true');
  });
  return context;
}


async function advanceUntilBlankCount(page: Page, minimumCount: number): Promise<void> {
  for (let i = 0; i < 20; i++) {
    if (await page.getByText(/Tap to discover/i).count() >= minimumCount) {
      return;
    }

    const nextTurn = page.getByRole('button', { name: /Next Turn/i });
    if (await visible(nextTurn, 500)) {
      await nextTurn.click();
      await page.waitForTimeout(150);
      continue;
    }

    return;
  }
}

async function assertScenarioRoute(page: Page, scenarioIdToCheck: string): Promise<void> {
  const expectedScenario = CURATED_ROLEPLAYS.find((scenario) => scenario.id === scenarioIdToCheck);
  if (!expectedScenario) {
    recordIssue({
      severity: 'Blocker',
      location: `Scenario route /scenario/${scenarioIdToCheck}`,
      evidence: 'Scenario id was not found in CURATED_ROLEPLAYS.',
      whyItMatters: 'Browser QA cannot verify route identity for missing scenario data.',
      recommendedFix: 'Fix the browser QA sample list or restore the missing scenario data.',
      validationMethod: 'Rerun npm run qa:browser.',
      status: 'open',
    });
    return;
  }

  await page.goto(`${baseURL}/scenario/${scenarioIdToCheck}`, { waitUntil: 'domcontentloaded' });
  if (!page.url().includes(`/scenario/${scenarioIdToCheck}`)) {
    recordIssue({
      severity: 'High',
      location: `Scenario route /scenario/${scenarioIdToCheck}`,
      evidence: `URL after navigation: ${page.url()}`,
      whyItMatters: 'Scenario route and rendered scenario must not drift during learner practice.',
      recommendedFix: 'Fix scenario routing so URL ids remain stable.',
      validationMethod: 'Rerun npm run qa:browser and inspect the blank-integrity regression section.',
      status: 'open',
    });
  }

  await requireVisible(page, page.getByText(expectedScenario.topic), `Scenario title ${scenarioIdToCheck}`, `Expected topic was not visible: ${expectedScenario.topic}`);
}

async function runBlankIntegrityRegression(browser: Browser): Promise<void> {
  const context = await prepareContext(browser, { width: 1440, height: 1000 });
  const page = await context.newPage();

  await assertScenarioRoute(page, 'workplace-1-performance-review');
  await screenshot(page, 'desktop-route-workplace-performance-review', '1440x1000');

  await assertScenarioRoute(page, 'social-10-new-neighbor');
  await advanceUntilBlankCount(page, 2);
  const blanks = page.getByText(/Tap to discover/i);
  if (await blanks.count() < 2) {
    recordIssue({
      severity: 'High',
      location: 'social-10-new-neighbor blank regression',
      evidence: `Expected at least 2 visible blanks, found ${await blanks.count()}.`,
      whyItMatters: 'The known regression depends on revealing the first two blanks in the neighbour scenario.',
      recommendedFix: 'Check scenario progression and blank rendering for social-10-new-neighbor.',
      validationMethod: 'Rerun npm run qa:browser and confirm the regression screenshot shows blank 2.',
      status: 'open',
    });
  } else {
    await blanks.nth(0).click();
    await page.waitForTimeout(250);
    await page.getByText(/Tap to discover/i).first().click();
    await page.waitForTimeout(350);

    const peacefulVisible = await visible(page.getByText(/^peaceful$/i), 1500);
    if (!peacefulVisible) {
      recordIssue({
        severity: 'High',
        location: 'social-10-new-neighbor blank 2',
        evidence: 'After revealing the second blank, the answer "peaceful" was not visible.',
        whyItMatters: 'This is the exact learner-trust regression: the UI previously showed "Nice to meet" in an adjective slot.',
        recommendedFix: 'Fix rendered blank index to answerVariation index mapping.',
        validationMethod: 'Rerun npm run qa:browser; blank 2 must show "peaceful".',
        status: 'open',
      });
    }

    const popoverCount = await page.getByText(/Native Alternatives/i).count();
    if (popoverCount !== 1) {
      recordIssue({
        severity: 'Medium',
        location: 'Blank alternatives popover',
        evidence: `Expected exactly 1 open alternatives popover after opening a second blank, found ${popoverCount}.`,
        whyItMatters: 'Overlapping popovers obscure learning content and make the flow feel broken.',
        recommendedFix: 'Track revealed answers separately from the single active popover.',
        validationMethod: 'Rerun npm run qa:browser; only one Native Alternatives panel should be visible.',
        status: 'open',
      });
    }
  }
  await screenshot(page, 'desktop-blank-integrity-neighbor', '1440x1000');

  for (const scenarioIdToCheck of ['service_1_restaurant_order', 'community-1-council-meeting']) {
    await assertScenarioRoute(page, scenarioIdToCheck);
    await advanceUntilBlankCount(page, 1);
    const firstBlank = page.getByText(/Tap to discover/i).first();
    if (await visible(firstBlank, 1500)) {
      await firstBlank.click();
      await page.waitForTimeout(250);
      await requireVisible(page, page.getByText(/Native Alternatives|Answer/i), `${scenarioIdToCheck} first blank`, 'First blank did not open an answer popover.');
    } else {
      recordIssue({
        severity: 'High',
        location: `${scenarioIdToCheck} first blank`,
        evidence: 'No revealable blank appeared in the sampled browser regression flow.',
        whyItMatters: 'The blank integrity gate needs coverage for zero-based and dense V2 scenarios.',
        recommendedFix: 'Fix scenario progression or adjust the browser sample to a stable blank-bearing state.',
        validationMethod: 'Rerun npm run qa:browser.',
        status: 'open',
      });
    }
  }

  await context.close();
}

async function runDesktopFlow(browser: Browser): Promise<void> {
  const context = await prepareContext(browser, { width: 1440, height: 1000 });
  const page = await context.newPage();
  page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));
  page.on('response', (response) => {
    if (response.status() >= 400) {
      failedResponses.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on('console', (message) => {
    if (message.type() === 'error') {
      const text = message.text();
      if (!/Google TTS|TTS|speech|audio/i.test(text)) {
        consoleErrors.push(`console: ${text}`);
      }
    }
  });

  await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('domcontentloaded');
  await screenshot(page, 'desktop-home', '1440x1000');

  await page.goto(`${baseURL}/scenario/healthcare-1-gp-appointment`, { waitUntil: "domcontentloaded" });
  await requireVisible(page, page.getByText(/Learning-only healthcare roleplay/i), "Healthcare learning notice", "Healthcare scenario did not show the learning-only disclaimer.");
  await screenshot(page, "desktop-healthcare-disclaimer", "1440x1000");

  await page.goto(`${baseURL}/scenario/${scenarioId}`, { waitUntil: 'domcontentloaded' });
  await requireVisible(page, page.getByText(/Restaurant Ordering|Next Turn/i), 'Scenario start', `Scenario route /scenario/${scenarioId} did not render expected controls.`);
  await screenshot(page, 'desktop-scenario-start', '1440x1000');

  const nextTurn = page.getByRole('button', { name: /Next Turn/i });
  if (await visible(nextTurn)) {
    await nextTurn.click();
  }
  await requireVisible(page, page.getByText(/Tap to discover/i), 'Blank reveal', 'No interactive blank appeared after advancing the scenario.');

  const firstBlank = page.getByText(/Tap to discover/i).first();
  if (await visible(firstBlank)) {
    await firstBlank.click();
    await page.waitForTimeout(400);
  }
  await requireVisible(page, page.getByText(/Native Alternatives|Answer/i), 'Blank feedback popover', 'Blank popover did not show answer feedback.');
  await screenshot(page, 'desktop-blank-popover', '1440x1000');

  const listen = page.locator('button[title="Listen to native pronunciation"]').first();
  if (await visible(listen, 1500)) {
    await listen.click({ force: true });
    await page.waitForTimeout(300);
  } else {
    recordIssue({
      severity: 'Medium',
      location: 'Audio/pronunciation control',
      evidence: 'No listen button was visible or targetable on the revealed roleplay line.',
      whyItMatters: 'Pronunciation practice is a named product primitive.',
      recommendedFix: 'Ensure listen controls are keyboard and pointer discoverable without hover-only dependency.',
      validationMethod: 'Rerun npm run qa:browser and confirm the audio control step passes.',
      status: 'open',
    });
  }

  for (let i = 0; i < 40; i++) {
    const complete = page.getByRole('button', { name: /Complete Mastery/i });
    if (await visible(complete, 400)) {
      await complete.click();
      break;
    }
    const next = page.getByRole('button', { name: /Next Turn/i });
    if (await visible(next, 400)) {
      await next.click();
      await page.waitForTimeout(80);
    }
  }

  await page.waitForTimeout(2200);
  await requireVisible(page, page.getByText(/Learning Insights|Your Results|Chunk Feedback/i), 'Completion and feedback', 'Completion did not open the feedback/deep-dive modal.');
  await screenshot(page, 'desktop-completion-feedback', '1440x1000');

  const summaryTab = page.getByRole('button', { name: /Pattern Summary/i });
  if (await visible(summaryTab, 1500)) {
    await summaryTab.click();
    await page.waitForTimeout(400);
    await screenshot(page, 'desktop-pattern-summary', '1440x1000');
  } else {
    recordIssue({
      severity: 'Medium',
      location: 'Pattern summary tab',
      evidence: 'Pattern Summary tab was not visible after completion.',
      whyItMatters: 'Pattern summary is part of the deep-dive/chunk-feedback learning loop.',
      recommendedFix: 'Verify V2 scenarios expose patternSummary in the completed feedback modal.',
      validationMethod: 'Rerun npm run qa:browser and inspect desktop-pattern-summary.png.',
      status: 'open',
    });
  }

  const activeRecall = page.getByRole('button', { name: /Start Active Recall/i });
  if (await visible(activeRecall, 1500)) {
    await activeRecall.click();
    await page.waitForTimeout(500);
    await requireVisible(page, page.getByText(/Active Recall Test/i), 'Active recall modal', 'Active recall modal did not open from pattern summary.');
    await screenshot(page, 'desktop-active-recall', '1440x1000');
  } else {
    recordIssue({
      severity: 'Medium',
      location: 'Active recall CTA',
      evidence: 'Start Active Recall was not visible after scenario completion.',
      whyItMatters: 'Active recall is a named retention flow for the product.',
      recommendedFix: 'Ensure completed V2 scenarios show the active recall CTA in the pattern summary tab.',
      validationMethod: 'Rerun npm run qa:browser and inspect desktop-active-recall.png.',
      status: 'open',
    });
  }

  await page.goto(`${baseURL}/scenario/not-a-real-scenario`, { waitUntil: 'domcontentloaded' });
  await requireVisible(page, page.getByText(/Invalid Scenario|Back to Home/i), 'Invalid scenario state', 'Invalid scenario route did not show a clear recovery state.');
  await screenshot(page, 'desktop-invalid-scenario', '1440x1000');

  await context.close();
}

async function runMobileFlow(browser: Browser): Promise<void> {
  const context = await prepareContext(browser, { width: 390, height: 844 });
  const page = await context.newPage();
  page.on('response', (response) => {
    if (response.status() >= 400) {
      failedResponses.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('domcontentloaded');
  await screenshot(page, 'mobile-home', '390x844');

  await page.goto(`${baseURL}/scenario/${scenarioId}`, { waitUntil: 'domcontentloaded' });
  const nextTurn = page.getByRole('button', { name: /Next Turn/i });
  if (await visible(nextTurn)) {
    await nextTurn.click();
  }
  await page.waitForTimeout(500);
  await requireVisible(page, page.getByText(/Tap to discover|Next Turn|Complete Mastery/i), 'Mobile roleplay', 'Mobile roleplay route did not show expected controls.');
  await screenshot(page, 'mobile-roleplay', '390x844');

  await context.close();
}

function formatMarkdown(): string {
  const lines: string[] = [];
  lines.push('# Long-Horizon Browser QA Report');
  lines.push('');
  lines.push(`- Generated: ${new Date().toISOString()}`);
  lines.push(`- Base URL: ${baseURL}`);
  lines.push(`- Scenario: ${scenarioId}`);
  lines.push(`- Screenshots: ${screenshots.length}`);
  lines.push(`- Issues: ${issues.length}`);
  lines.push('');
  lines.push('## Screenshots');
  lines.push('');
  for (const shot of screenshots) {
    lines.push(`- ${shot.name} (${shot.viewport}): ${shot.path}`);
  }
  lines.push('');
  lines.push('## Issues');
  lines.push('');
  if (issues.length === 0) {
    lines.push('No automated browser QA issues were detected. Manual visual review is still required against the screenshots.');
  } else {
    lines.push('| Severity | Location | Evidence | Why it matters | Recommended fix | Validation method | Status |');
    lines.push('| --- | --- | --- | --- | --- | --- | --- |');
    for (const issue of issues) {
      lines.push(`| ${issue.severity} | ${escapeCell(issue.location)} | ${escapeCell(issue.evidence)} | ${escapeCell(issue.whyItMatters)} | ${escapeCell(issue.recommendedFix)} | ${escapeCell(issue.validationMethod)} | ${issue.status} |`);
    }
  }
  lines.push('');
  if (failedResponses.length > 0) {
    lines.push('## Failed Responses');
    lines.push('');
    for (const response of [...new Set(failedResponses)].slice(0, 20)) {
      lines.push(`- ${response}`);
    }
    lines.push('');
  }
  if (consoleErrors.length > 0) {
    lines.push('## Console Errors');
    lines.push('');
    for (const error of consoleErrors.slice(0, 20)) {
      lines.push(`- ${error}`);
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

async function main(): Promise<void> {
  await mkdir(screenshotDir, { recursive: true });
  await startLocalApp();

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({ headless: true });
    await runDesktopFlow(browser);
    await runBlankIntegrityRegression(browser);
    await runMobileFlow(browser);
  } catch (error) {
    recordIssue({
      severity: 'Blocker',
      location: 'Playwright browser route',
      evidence: error instanceof Error ? error.message : String(error),
      whyItMatters: 'The QA route must support local browser flow coverage and screenshots.',
      recommendedFix: 'Fix Playwright/Chromium availability or use the Codex in-app Browser fallback and record manual evidence.',
      validationMethod: 'npm run qa:browser exits 0 and writes browser-qa-report.md.',
      status: 'open',
    });
  } finally {
    if (browser) {
      await browser.close();
    }
    if (server) {
      server.kill('SIGTERM');
    }
  }

  await writeFile(path.join(reportDir, 'browser-qa-report.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    baseURL,
    scenarioId,
    screenshots,
    issues,
    consoleErrors,
    failedResponses,
  }, null, 2));
  await writeFile(path.join(reportDir, 'browser-qa-report.md'), formatMarkdown());

  const hasBlocker = issues.some((issue) => issue.severity === 'Blocker');
  if (hasBlocker) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
