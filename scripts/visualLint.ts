#!/usr/bin/env tsx

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { execFile as execFileCallback, spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

type Severity = 'Blocker' | 'High' | 'Medium' | 'Low';

interface VisualIssue {
  severity: Severity;
  location: string;
  evidence: string;
  whyItMatters: string;
  recommendedFix: string;
  validationMethod: string;
  status: 'open' | 'closed' | 'needs-human-review';
}

interface PageResult {
  name: string;
  url: string;
  viewport: string;
  checks: string[];
  issues: VisualIssue[];
}

interface BrowserQaScreenshot {
  name: string;
  path: string;
  viewport: string;
}

interface BrowserQaReport {
  generatedAt?: string;
  baseURL?: string;
  screenshots?: BrowserQaScreenshot[];
  issues?: unknown[];
  consoleErrors?: unknown[];
  failedResponses?: unknown[];
}

interface VisualElementOverflow {
  tag: string;
  text: string;
  left?: number;
  right?: number;
  width: number;
  height?: number;
  clientWidth?: number;
  scrollWidth?: number;
  clientHeight?: number;
  scrollHeight?: number;
}

interface VisualOverlap {
  first: string;
  second: string;
  overlapArea: number;
}

interface VisualHeroState {
  tag: string;
  width: number;
  height: number;
  posterComplete: boolean | null;
  posterNaturalWidth: number | null;
  videoReadyState: number | null;
}

interface VisualEvaluation {
  url: string;
  viewport: string;
  horizontalOverflow: number;
  viewportOverflow: VisualElementOverflow[];
  clippedText: VisualElementOverflow[];
  smallTargets: VisualElementOverflow[];
  overlappingTargets: VisualOverlap[];
  heroState: VisualHeroState | null;
}

const cwd = process.cwd();
const baseURL = process.env.FLUENTSTEP_QA_BASE_URL || 'http://127.0.0.1:3000';
const scenarioId = process.env.FLUENTSTEP_QA_SCENARIO || 'service_1_restaurant_order';
const reportDir = path.join(cwd, 'docs/qa/long-horizon');
const fallbackReportDir = path.join('/private/tmp', 'fluentstep-qa-visual-lint');
const results: PageResult[] = [];
let server: ChildProcessWithoutNullStreams | null = null;
const execFile = promisify(execFileCallback);

interface AppIdentity {
  reachable: boolean;
  isFluentStep: boolean;
  evidence: string;
}

function identityFromHtml(html: string, evidencePrefix: string): AppIdentity {
  const title = html.match(/<title>(.*?)<\/title>/i)?.[1]?.trim() || 'missing title';
  const isFluentStep = /FluentStep:\s*IELTS Roleplay Engine/i.test(title);
  return { reachable: true, isFluentStep, evidence: `${evidencePrefix}; title: ${title}` };
}

async function getAppIdentity(): Promise<AppIdentity> {
  try {
    const response = await fetch(baseURL, { signal: AbortSignal.timeout(1500) });
    const html = await response.text();
    const identity = identityFromHtml(html, `HTTP ${response.status}`);
    return { ...identity, reachable: response.ok || response.status < 500 };
  } catch (fetchError) {
    try {
      const { stdout } = await execFile('curl', ['-fsS', '--max-time', '2', baseURL], { maxBuffer: 2_000_000 });
      return identityFromHtml(stdout, 'curl fallback');
    } catch (curlError) {
      const fetchEvidence = fetchError instanceof Error ? fetchError.message : String(fetchError);
      const curlEvidence = curlError instanceof Error ? curlError.message : String(curlError);
      return { reachable: false, isFluentStep: false, evidence: `fetch failed: ${fetchEvidence}; curl failed: ${curlEvidence}` };
    }
  }
}

async function isFluentStepReachable(): Promise<boolean> {
  return (await getAppIdentity()).isFluentStep;
}

async function startLocalApp(): Promise<void> {
  const identity = await getAppIdentity();
  if (identity.isFluentStep) return;

  if (identity.reachable) {
    results.push({
      name: 'local-app-identity',
      url: baseURL,
      viewport: 'n/a',
      checks: [],
      issues: [{
        severity: 'Blocker',
        location: 'Local dev server',
        evidence: `${baseURL} is reachable but does not identify as FluentStep. ${identity.evidence}`,
        whyItMatters: 'Visual lint must exercise FluentStep, not an unrelated localhost app.',
        recommendedFix: 'Stop the conflicting service or set FLUENTSTEP_QA_BASE_URL to a FluentStep route.',
        validationMethod: 'Run npm run qa:visual-lint and confirm it reaches FluentStep.',
        status: 'open',
      }],
    });
    throw new Error(`Wrong app is reachable at ${baseURL}: ${identity.evidence}`);
  }

  server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '3000'], {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, BROWSER: 'none' },
  });

  let logs = '';
  server.stdout.on('data', (chunk: Buffer) => { logs += chunk.toString(); });
  server.stderr.on('data', (chunk: Buffer) => { logs += chunk.toString(); });

  for (let i = 0; i < 10; i++) {
    if (await isFluentStepReachable()) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // In the Codex sandbox, Node loopback probes can be blocked even when
  // Chromium can reach the app. Continue to the browser-level title check,
  // where wrong-app and startup failures become reportable verifier issues.
  if (/EPERM|fetch failed|curl failed/i.test((await getAppIdentity()).evidence)) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return;
  }

  results.push({
    name: 'local-app-startup',
    url: baseURL,
    viewport: 'n/a',
    checks: [],
    issues: [{
      severity: 'Blocker',
      location: 'Local dev server',
      evidence: `Could not reach ${baseURL}. Logs: ${logs.slice(-1200)}`,
      whyItMatters: 'Visual lint cannot run without a local app route.',
      recommendedFix: 'Fix dev server startup or port binding, then rerun npm run qa:visual-lint.',
      validationMethod: 'npm run qa:visual-lint exits 0 and writes visual-lint-report.md.',
      status: 'open',
    }],
  });
  throw new Error(`Local app did not become reachable at ${baseURL}`);
}

async function assertFluentStepPage(page: Page): Promise<void> {
  const title = await page.title();
  if (!/FluentStep:\s*IELTS Roleplay Engine/i.test(title)) {
    throw new Error(`Wrong app is reachable at ${baseURL}; browser title: ${title || 'missing title'}`);
  }
}

function isKnownChromiumSandboxFailure(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /MachPortRendezvousServer|bootstrap_check_in|Permission denied|Target page, context or browser has been closed/i.test(message);
}

function readPngSize(buffer: Buffer): { width: number; height: number } | null {
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (buffer.length < 24) return null;
  if (!pngSignature.every((byte, index) => buffer[index] === byte)) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function expectedViewportWidth(viewport: string): number | null {
  const match = viewport.match(/^(\d+)x(\d+)$/);
  return match ? Number(match[1]) : null;
}

async function runScreenshotFallback(runtimeError: unknown): Promise<void> {
  const reportPath = path.join(reportDir, 'browser-qa-report.json');
  const expectedNames = new Set([
    'desktop-home',
    'desktop-healthcare-disclaimer',
    'desktop-scenario-start',
    'desktop-blank-popover',
    'desktop-completion-feedback',
    'desktop-pattern-summary',
    'desktop-active-recall',
    'desktop-invalid-scenario',
    'mobile-home',
    'mobile-roleplay',
  ]);

  let report: BrowserQaReport;
  try {
    report = JSON.parse(await readFile(reportPath, 'utf8')) as BrowserQaReport;
  } catch (error) {
    results.push({
      name: 'visual-lint-screenshot-fallback',
      url: baseURL,
      viewport: 'n/a',
      checks: [],
      issues: [{
        severity: 'Blocker',
        location: 'Screenshot fallback report',
        evidence: `Chromium launch failed and ${reportPath} could not be read: ${error instanceof Error ? error.message : String(error)}`,
        whyItMatters: 'Visual lint needs either DOM checks or fresh browser screenshot evidence.',
        recommendedFix: 'Run npm run qa:browser successfully, then rerun npm run qa:visual-lint.',
        validationMethod: 'npm run qa:visual-lint exits 0 with screenshot fallback checks or DOM page checks.',
        status: 'open',
      }],
    });
    return;
  }

  const screenshots = report.screenshots || [];
  const reportIssues = [
    ...(report.issues || []),
    ...(report.consoleErrors || []),
    ...(report.failedResponses || []),
  ];

  const fallbackIssues: VisualIssue[] = [];
  const checks: string[] = [
    'Mode: screenshot fallback because Chromium DOM visual lint could not launch in this sandbox.',
    `Runtime blocker: ${runtimeError instanceof Error ? runtimeError.message.split('\n')[0] : String(runtimeError)}`,
    `Browser QA report generated: ${report.generatedAt || 'unknown'}`,
    `Browser QA screenshots: ${screenshots.length}`,
    `Browser QA issue/console/network entries: ${reportIssues.length}`,
  ];

  if (report.baseURL !== baseURL) {
    fallbackIssues.push({
      severity: 'High',
      location: 'Browser QA base URL',
      evidence: `Expected ${baseURL}, report has ${report.baseURL || 'missing baseURL'}.`,
      whyItMatters: 'Screenshot fallback must lint the same local app route as the visual gate.',
      recommendedFix: 'Rerun npm run qa:browser against the local FluentStep route, then rerun visual lint.',
      validationMethod: 'browser-qa-report.json baseURL matches qa:visual-lint base URL.',
      status: 'open',
    });
  }

  if (reportIssues.length > 0) {
    fallbackIssues.push({
      severity: 'High',
      location: 'Browser QA prerequisite',
      evidence: `${reportIssues.length} issue/console/network entries exist in browser QA report.`,
      whyItMatters: 'Screenshot fallback relies on clean browser QA evidence.',
      recommendedFix: 'Resolve browser QA issues before using screenshot fallback as visual evidence.',
      validationMethod: 'npm run qa:browser exits 0 with 0 issues, 0 console errors, and 0 failed responses.',
      status: 'open',
    });
  }

  for (const expected of expectedNames) {
    if (!screenshots.some((shot) => shot.name === expected)) {
      fallbackIssues.push({
        severity: 'High',
        location: 'Screenshot coverage',
        evidence: `Missing screenshot ${expected}.`,
        whyItMatters: 'The fallback must cover the full browser QA evidence set, including Healthcare and mobile states.',
        recommendedFix: 'Rerun npm run qa:browser and confirm all expected screenshots are captured.',
        validationMethod: 'qa:visual-lint screenshot fallback reports 10 expected screenshots.',
        status: 'open',
      });
    }
  }

  for (const shot of screenshots) {
    const expectedWidth = expectedViewportWidth(shot.viewport);
    try {
      const [fileStat, buffer] = await Promise.all([stat(shot.path), readFile(shot.path)]);
      const size = readPngSize(buffer);
      if (!size) {
        fallbackIssues.push({
          severity: 'High',
          location: `${shot.name} PNG validity`,
          evidence: `${shot.path} is not a valid PNG with readable IHDR metadata.`,
          whyItMatters: 'Invalid screenshots cannot support visual QA.',
          recommendedFix: 'Rerun browser QA and ensure screenshots are written correctly.',
          validationMethod: 'qa:visual-lint screenshot fallback parses PNG dimensions for every screenshot.',
          status: 'open',
        });
        continue;
      }
      checks.push(`${shot.name}: ${size.width}x${size.height}, ${fileStat.size} bytes`);
      if (expectedWidth && size.width !== expectedWidth) {
        fallbackIssues.push({
          severity: 'High',
          location: `${shot.name} width`,
          evidence: `Expected screenshot width ${expectedWidth}px from viewport ${shot.viewport}; got ${size.width}px.`,
          whyItMatters: 'Width mismatch can indicate the wrong viewport or malformed screenshot evidence.',
          recommendedFix: 'Rerun browser QA for the expected viewport and recapture the screenshot.',
          validationMethod: 'qa:visual-lint screenshot fallback reports matching viewport widths.',
          status: 'open',
        });
      }
      if (size.height < 300 || fileStat.size < 10_000) {
        fallbackIssues.push({
          severity: 'High',
          location: `${shot.name} screenshot completeness`,
          evidence: `${shot.path} is ${size.width}x${size.height} and ${fileStat.size} bytes.`,
          whyItMatters: 'Tiny or truncated screenshots cannot support layout review.',
          recommendedFix: 'Rerun browser QA and inspect the screenshot file.',
          validationMethod: 'qa:visual-lint screenshot fallback reports non-truncated screenshots.',
          status: 'open',
        });
      }
    } catch (error) {
      fallbackIssues.push({
        severity: 'High',
        location: `${shot.name} file`,
        evidence: `${shot.path} could not be inspected: ${error instanceof Error ? error.message : String(error)}`,
        whyItMatters: 'Missing screenshot files break the fallback visual evidence chain.',
        recommendedFix: 'Rerun npm run qa:browser and ensure screenshot files exist.',
        validationMethod: 'qa:visual-lint screenshot fallback reads every screenshot file.',
        status: 'open',
      });
    }
  }

  results.push({
    name: 'screenshot-fallback',
    url: baseURL,
    viewport: 'browser-qa-screenshots',
    checks,
    issues: fallbackIssues,
  });
}

async function prepareContext(browser: Browser, viewport: { width: number; height: number }): Promise<BrowserContext> {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(() => {
    window.localStorage.setItem('fluentstep:skipOnboarding', 'true');
  });
  return context;
}

async function lintPage(page: Page, name: string): Promise<PageResult> {
  const evaluated = await page.evaluate<VisualEvaluation>(`(() => {
    function isVisible(element) {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity) !== 0 && rect.width > 1 && rect.height > 1;
    }

    function shortText(element) {
      const label = element.getAttribute('aria-label') || '';
      const text = (label || element.textContent || '').replace(/\\s+/g, ' ').trim();
      return text.length > 90 ? text.slice(0, 87) + '...' : text;
    }

    function hasHorizontalScrollAncestor(element) {
      let node = element.parentElement;
      while (node && node !== document.body && node !== document.documentElement) {
        const style = window.getComputedStyle(node);
        if ((style.overflowX === 'auto' || style.overflowX === 'scroll') && node.scrollWidth > node.clientWidth + 3) {
          return true;
        }
        node = node.parentElement;
      }
      return false;
    }

    function isIntentionalLineClamp(element) {
      const style = window.getComputedStyle(element);
      return Boolean(style.webkitLineClamp && style.webkitLineClamp !== 'none' && style.webkitLineClamp !== '0');
    }

    function isCoveredByLargeLabel(element) {
      if (!(element instanceof HTMLInputElement)) return false;
      if (element.type !== 'checkbox' && element.type !== 'radio') return false;
      const label = element.closest('label');
      if (!label) return false;
      const rect = label.getBoundingClientRect();
      return rect.width >= 32 && rect.height >= 32;
    }

    const selector = 'button,a,input,select,textarea,[role="button"],[role="link"],h1,h2,h3,h4,h5,h6,p,span,li,label';
    const visibleElements = Array.from(document.querySelectorAll(selector)).filter(isVisible);
    const interactiveElements = Array.from(document.querySelectorAll('button,a,input,select,textarea,[role="button"],[role="link"]')).filter(isVisible);

    const horizontalOverflow = Math.max(
      document.documentElement.scrollWidth,
      (document.body && document.body.scrollWidth) || 0,
    ) - window.innerWidth;

    const viewportOverflow = visibleElements
      .map((element) => ({ element, rect: element.getBoundingClientRect(), text: shortText(element) }))
      .filter(({ element, rect }) => !hasHorizontalScrollAncestor(element) && (rect.right > window.innerWidth + 3 || rect.left < -3))
      .slice(0, 20)
      .map(({ rect, text, element }) => ({
        tag: element.tagName.toLowerCase(),
        text,
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
      }));

    const clippedText = visibleElements
      .filter((element) => {
        const text = shortText(element);
        if (text.length < 3) return false;
        if (element.children.length > 3) return false;
        if (isIntentionalLineClamp(element)) return false;
        const style = window.getComputedStyle(element);
        if (style.overflow === 'visible' && style.textOverflow !== 'ellipsis') return false;
        return element.scrollWidth > element.clientWidth + 3 || element.scrollHeight > element.clientHeight + 3;
      })
      .slice(0, 20)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        text: shortText(element),
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
      }));

    const smallTargets = interactiveElements
      .map((element) => ({ element, rect: element.getBoundingClientRect(), text: shortText(element) }))
      .filter(({ element, rect }) => !isCoveredByLargeLabel(element) && (rect.width < 32 || rect.height < 32))
      .slice(0, 20)
      .map(({ element, rect, text }) => ({
        tag: element.tagName.toLowerCase(),
        text,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      }));

    const overlappingTargets = [];
    for (let i = 0; i < interactiveElements.length; i++) {
      const a = interactiveElements[i].getBoundingClientRect();
      for (let j = i + 1; j < interactiveElements.length; j++) {
        const b = interactiveElements[j].getBoundingClientRect();
        const overlapX = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        const overlapY = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        const overlapArea = Math.round(overlapX * overlapY);
        if (overlapArea > 64) {
          overlappingTargets.push({
            first: shortText(interactiveElements[i]) || interactiveElements[i].tagName.toLowerCase(),
            second: shortText(interactiveElements[j]) || interactiveElements[j].tagName.toLowerCase(),
            overlapArea,
          });
        }
      }
    }

    const heroPoster = document.querySelector('img[alt="Nature journey"]');
    const heroVideo = document.querySelector('video');
    const hero = heroPoster || heroVideo;
    const heroRect = hero && hero.getBoundingClientRect();
    const heroState = hero ? {
      tag: hero.tagName.toLowerCase(),
      width: Math.round((heroRect && heroRect.width) || 0),
      height: Math.round((heroRect && heroRect.height) || 0),
      posterComplete: heroPoster ? heroPoster.complete : null,
      posterNaturalWidth: heroPoster ? heroPoster.naturalWidth : null,
      videoReadyState: heroVideo ? heroVideo.readyState : null,
    } : null;

    return {
      url: window.location.href,
      viewport: window.innerWidth + 'x' + window.innerHeight,
      horizontalOverflow,
      viewportOverflow,
      clippedText,
      smallTargets,
      overlappingTargets: overlappingTargets.slice(0, 20),
      heroState,
    };
  })()`);

  const issues: VisualIssue[] = [];
  const checks: string[] = [];

  checks.push(`Viewport ${evaluated.viewport}; URL ${evaluated.url}`);
  checks.push(`Horizontal overflow delta: ${evaluated.horizontalOverflow}px`);
  checks.push(`Viewport-overflow elements: ${evaluated.viewportOverflow.length}`);
  checks.push(`Clipped-text candidates: ${evaluated.clippedText.length}`);
  checks.push(`Small interactive targets: ${evaluated.smallTargets.length}`);
  checks.push(`Overlapping interactive targets: ${evaluated.overlappingTargets.length}`);
  if (evaluated.heroState) {
    checks.push(`Hero media: ${JSON.stringify(evaluated.heroState)}`);
  }

  if (evaluated.horizontalOverflow > 8) {
    issues.push({
      severity: 'High',
      location: `${name} horizontal layout`,
      evidence: `Document is ${Math.round(evaluated.horizontalOverflow)}px wider than the viewport.`,
      whyItMatters: 'Horizontal scrolling is a strong signal of broken responsive layout, especially on mobile.',
      recommendedFix: 'Find the overflowing element and constrain width, wrapping, or grid tracks for the viewport.',
      validationMethod: 'Run npm run qa:visual-lint and confirm horizontal overflow is <= 8px.',
      status: 'open',
    });
  }

  if (evaluated.viewportOverflow.length > 0) {
    issues.push({
      severity: 'Medium',
      location: `${name} viewport bounds`,
      evidence: JSON.stringify(evaluated.viewportOverflow.slice(0, 5)),
      whyItMatters: 'Visible controls or text outside the viewport can become unreachable or look broken.',
      recommendedFix: 'Inspect the listed elements and constrain their responsive layout.',
      validationMethod: 'Run npm run qa:visual-lint and confirm no visible key elements overflow viewport bounds.',
      status: 'open',
    });
  }

  if (evaluated.clippedText.length > 0) {
    issues.push({
      severity: 'Medium',
      location: `${name} text fit`,
      evidence: JSON.stringify(evaluated.clippedText.slice(0, 5)),
      whyItMatters: 'Clipped text can hide instructions, answers, or feedback in the learning flow.',
      recommendedFix: 'Allow wrapping, increase container size, or reduce local text density for the affected element.',
      validationMethod: 'Run npm run qa:visual-lint and manually inspect the affected screenshot state.',
      status: 'open',
    });
  }

  const meaningfulSmallTargets = evaluated.smallTargets.filter((target) => target.text && !/^×$/.test(target.text));
  if (meaningfulSmallTargets.length > 0) {
    issues.push({
      severity: 'Low',
      location: `${name} target size`,
      evidence: JSON.stringify(meaningfulSmallTargets.slice(0, 5)),
      whyItMatters: 'Small interactive targets are harder to use on mobile and reduce accessibility.',
      recommendedFix: 'Increase hit area to at least 32px, ideally 44px on touch-first controls.',
      validationMethod: 'Run npm run qa:visual-lint and confirm only intentional icon controls remain small.',
      status: 'open',
    });
  }

  if (evaluated.overlappingTargets.length > 0) {
    issues.push({
      severity: 'Medium',
      location: `${name} interactive overlap`,
      evidence: JSON.stringify(evaluated.overlappingTargets.slice(0, 5)),
      whyItMatters: 'Overlapping controls create ambiguous clicks and keyboard/focus confusion.',
      recommendedFix: 'Fix stacking, spacing, or modal layering so controls do not overlap.',
      validationMethod: 'Run npm run qa:visual-lint and confirm no overlapping interactive controls are reported.',
      status: 'open',
    });
  }

  if (name === 'desktop-home' && (!evaluated.heroState || evaluated.heroState.width < 300 || evaluated.heroState.height < 200)) {
    issues.push({
      severity: 'Medium',
      location: 'Desktop home hero media',
      evidence: `Hero media state: ${JSON.stringify(evaluated.heroState)}`,
      whyItMatters: 'The prior visual issue was a broken-looking hero media region; the fallback should visibly occupy the hero area.',
      recommendedFix: 'Ensure the poster image or video renders with stable dimensions before load.',
      validationMethod: 'Run npm run qa:visual-lint and qa:browser; inspect desktop-home.png.',
      status: 'open',
    });
  }

  return { name, url: evaluated.url, viewport: evaluated.viewport, checks, issues };
}

async function run(): Promise<void> {
  await mkdir(reportDir, { recursive: true });
  await startLocalApp();

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({ headless: true });

    const desktop = await prepareContext(browser, { width: 1440, height: 1000 });
    const desktopPage = await desktop.newPage();
    await desktopPage.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await assertFluentStepPage(desktopPage);
    await desktopPage.waitForTimeout(800);
    results.push(await lintPage(desktopPage, 'desktop-home'));

    await desktopPage.goto(`${baseURL}/scenario/${scenarioId}`, { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(500);
    results.push(await lintPage(desktopPage, 'desktop-scenario-start'));

    const nextTurn = desktopPage.getByRole('button', { name: /Next Turn/i });
    if (await nextTurn.first().isVisible().catch(() => false)) {
      await nextTurn.first().click();
      await desktopPage.waitForTimeout(300);
    }
    const blank = desktopPage.getByText(/Tap to discover/i).first();
    if (await blank.isVisible().catch(() => false)) {
      await blank.click();
      await desktopPage.waitForTimeout(500);
    }
    results.push(await lintPage(desktopPage, 'desktop-blank-popover'));

    await desktopPage.goto(`${baseURL}/scenario/not-a-real-scenario`, { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(500);
    results.push(await lintPage(desktopPage, 'desktop-invalid-scenario'));
    await desktop.close();

    const mobile = await prepareContext(browser, { width: 390, height: 844 });
    const mobilePage = await mobile.newPage();
    await mobilePage.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await assertFluentStepPage(mobilePage);
    await mobilePage.waitForTimeout(800);
    results.push(await lintPage(mobilePage, 'mobile-home'));

    await mobilePage.goto(`${baseURL}/scenario/${scenarioId}`, { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(500);
    const mobileNext = mobilePage.getByRole('button', { name: /Next Turn/i });
    if (await mobileNext.first().isVisible().catch(() => false)) {
      await mobileNext.first().click();
      await mobilePage.waitForTimeout(300);
    }
    results.push(await lintPage(mobilePage, 'mobile-roleplay'));
    await mobile.close();
  } catch (error) {
    if (isKnownChromiumSandboxFailure(error)) {
      await runScreenshotFallback(error);
    } else {
      results.push({
        name: 'visual-lint-runtime',
        url: baseURL,
        viewport: 'n/a',
        checks: [],
        issues: [{
          severity: 'Blocker',
          location: 'Visual lint runtime',
          evidence: error instanceof Error ? error.message : String(error),
          whyItMatters: 'The objective visual gate needs repeatable local evidence.',
          recommendedFix: 'Fix Playwright/Chromium or the local route, then rerun npm run qa:visual-lint.',
          validationMethod: 'npm run qa:visual-lint exits 0 and writes visual-lint-report.md.',
          status: 'open',
        }],
      });
    }
  } finally {
    if (browser) await browser.close();
    if (server) server.kill('SIGTERM');
  }

  await writeReports();

  const hasBlockingIssue = results.some((result) => result.issues.some((issue) => issue.severity === 'Blocker' || issue.severity === 'High'));
  if (hasBlockingIssue) process.exitCode = 1;
}

async function writeReports(): Promise<void> {
  const generatedAt = new Date().toISOString();
  const allIssues = results.flatMap((result) => result.issues.map((issue) => ({ page: result.name, ...issue })));

  await writeReportFile('visual-lint-report.json', JSON.stringify({
    generatedAt,
    baseURL,
    scenarioId,
    pages: results,
    issues: allIssues,
  }, null, 2));

  const lines: string[] = [];
  lines.push('# Visual Layout Lint Report');
  lines.push('');
  lines.push(`Generated: ${generatedAt}`);
  lines.push(`Base URL: ${baseURL}`);
  lines.push(`Scenario: ${scenarioId}`);
  lines.push(`Pages checked: ${results.length}`);
  lines.push(`Issues: ${allIssues.length}`);
  lines.push('');
  lines.push('Claim boundary: this is automated layout lint only. It does not replace named human/design screenshot review.');
  lines.push('');
  lines.push('## Checks By Page');
  lines.push('');
  for (const result of results) {
    lines.push(`### ${result.name}`);
    lines.push('');
    lines.push(`- URL: ${result.url}`);
    lines.push(`- Viewport: ${result.viewport}`);
    for (const check of result.checks) lines.push(`- ${check}`);
    if (result.issues.length === 0) lines.push('- Automated layout lint issues: 0');
    lines.push('');
  }

  lines.push('## Issue Register');
  lines.push('');
  if (allIssues.length === 0) {
    lines.push('No automated layout lint issues were detected. Manual visual/design review remains required.');
  } else {
    lines.push('| Severity | Page | Location | Evidence | Why it matters | Recommended fix | Validation method | Status |');
    lines.push('| --- | --- | --- | --- | --- | --- | --- | --- |');
    for (const issue of allIssues) {
      lines.push(`| ${issue.severity} | ${escapeCell(issue.page)} | ${escapeCell(issue.location)} | ${escapeCell(issue.evidence)} | ${escapeCell(issue.whyItMatters)} | ${escapeCell(issue.recommendedFix)} | ${escapeCell(issue.validationMethod)} | ${issue.status} |`);
    }
  }
  lines.push('');
  lines.push('## Remaining Visual Gate');
  lines.push('');
  lines.push('A named visual/design reviewer still needs to inspect the screenshots listed in `VISUAL_SCREENSHOT_REVIEW_CHECKLIST.md`.');
  lines.push('');

  await writeReportFile('visual-lint-report.md', `${lines.join('\n')}\n`);
}

async function writeReportFile(fileName: string, contents: string): Promise<void> {
  try {
    await writeFile(path.join(reportDir, fileName), contents);
  } catch (error) {
    if (!(error instanceof Error) || !/EPERM|EACCES|operation not permitted/i.test(error.message)) {
      throw error;
    }
    await mkdir(fallbackReportDir, { recursive: true });
    await writeFile(path.join(fallbackReportDir, fileName), contents);
    console.warn(`Could not write ${fileName} to repo report dir; wrote fallback to ${fallbackReportDir}/${fileName}`);
  }
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
