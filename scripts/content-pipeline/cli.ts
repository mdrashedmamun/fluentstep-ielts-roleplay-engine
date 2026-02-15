#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PIPELINE_ROOT = path.join(__dirname);
const TRANSCRIPTS_DIR = path.join(PIPELINE_ROOT, "transcripts");
const STAGE1_DIR = path.join(PIPELINE_ROOT, "stage-1-extracted");
const STAGE3_DIR = path.join(PIPELINE_ROOT, "stage-3-verified");
const STAGE2_DIR = path.join(PIPELINE_ROOT, "stage-2-apps");
const QUEUE_DIR = path.join(PIPELINE_ROOT, "_queue");

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

interface PipelineStatus {
  transcript: string;
  stage1: boolean;
  stage3: boolean;
  stage2: boolean;
}

function log(msg: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function getTranscriptName(filename: string): string {
  return path.basename(filename, path.extname(filename));
}

function scanTranscripts(): string[] {
  if (!fs.existsSync(TRANSCRIPTS_DIR)) {
    fs.mkdirSync(TRANSCRIPTS_DIR, { recursive: true });
  }
  const files = fs.readdirSync(TRANSCRIPTS_DIR);
  return files.filter((f) => f.endsWith(".txt"));
}

function checkStageCompletion(transcriptName: string): PipelineStatus {
  const stage1File = path.join(STAGE1_DIR, `${transcriptName}-AGENT1-extracted.json`);
  const stage3File = path.join(STAGE3_DIR, `${transcriptName}-AGENT3-verified.json`);
  const stage2File = path.join(STAGE2_DIR, `${transcriptName}-AGENT2-app.html`);

  return {
    transcript: transcriptName,
    stage1: fs.existsSync(stage1File),
    stage3: fs.existsSync(stage3File),
    stage2: fs.existsSync(stage2File),
  };
}

function getQueueStatus(): PipelineStatus[] {
  const transcripts = scanTranscripts();
  return transcripts.map((t) => checkStageCompletion(getTranscriptName(t)));
}

function printStatus() {
  const statuses = getQueueStatus();

  if (statuses.length === 0) {
    log("\n📭 No transcripts found in /transcripts/", "yellow");
    log(`Add .txt files to: ${TRANSCRIPTS_DIR}\n`, "cyan");
    return;
  }

  log("\n📊 PIPELINE STATUS\n", "blue");
  log("Transcript Name                    Stage 1    Stage 3    Stage 2    Status");
  log("-".repeat(80));

  statuses.forEach((status) => {
    const s1 = status.stage1 ? "✅" : "⏳";
    const s3 = status.stage3 ? "✅" : "⏳";
    const s2 = status.stage2 ? "✅" : "⏳";

    let statusColor: keyof typeof colors = "yellow";
    let statusText = "In Progress";
    if (status.stage1 && !status.stage3) {
      statusText = "Awaiting Agent 3";
      statusColor = "yellow";
    } else if (status.stage3 && !status.stage2) {
      statusText = "Awaiting Agent 2";
      statusColor = "cyan";
    } else if (status.stage2) {
      statusText = "Complete!";
      statusColor = "green";
    } else {
      statusText = "Awaiting Agent 1";
      statusColor = "yellow";
    }

    const line = `${status.transcript.padEnd(34)} ${s1}         ${s3}         ${s2}         ${colors[statusColor]}${statusText}${colors.reset}`;
    console.log(line);
  });

  log("\n✅ = Completed | ⏳ = Pending\n", "cyan");
}

function watchFolder() {
  log("\n👀 PIPELINE WATCHER STARTED", "green");
  log(`Monitoring: ${TRANSCRIPTS_DIR}\n`, "cyan");

  setInterval(() => {
    const transcripts = scanTranscripts();

    transcripts.forEach((transcript) => {
      const name = getTranscriptName(transcript);
      const status = checkStageCompletion(name);
      const transcriptPath = path.join(TRANSCRIPTS_DIR, transcript);

      // Check if newly added (no stage1 yet)
      if (!status.stage1 && fs.existsSync(transcriptPath)) {
        log(`\n🎯 NEW TRANSCRIPT DETECTED`, "green");
        log(`File: ${transcript}`, "cyan");
        log(
          `\n📋 READY FOR AGENT 1 (Content Specialist)\nUsage: Copy the handoff prompt from HANDOFF_TEMPLATES.md`,
          "blue"
        );
      }

      // Check if stage1 complete, awaiting stage3
      if (status.stage1 && !status.stage3) {
        log(`\n✅ AGENT 1 COMPLETE: ${name}`, "green");
        log(`📋 READY FOR AGENT 3 (QA Verifier)\nUsage: Copy the handoff prompt from HANDOFF_TEMPLATES.md`, "blue");
      }

      // Check if stage3 complete, awaiting stage2
      if (status.stage3 && !status.stage2) {
        log(`\n✅ AGENT 3 COMPLETE: ${name}`, "green");
        log(`📋 READY FOR AGENT 2 (App Builder)\nUsage: Copy the handoff prompt from HANDOFF_TEMPLATES.md`, "blue");
      }

      // Check if all complete
      if (status.stage2) {
        log(`\n🎉 PIPELINE COMPLETE: ${name}`, "green");
        log(`Final app ready at: ${path.join(STAGE2_DIR, `${name}-AGENT2-app.html`)}`, "cyan");
      }
    });
  }, 5000); // Check every 5 seconds
}

function parseCommand(cmd: string) {
  if (cmd === "watch" || cmd === "--watch") {
    watchFolder();
    // Keep process alive
    setInterval(() => {}, 1000);
  } else if (cmd === "status" || cmd === "--status") {
    printStatus();
  } else if (cmd === "help" || cmd === "--help" || !cmd) {
    log("\n📦 CONTENT PIPELINE CLI\n", "blue");
    log("Usage: npm run pipeline:[command]\n", "cyan");
    log("Commands:");
    log("  watch          Start watching transcripts/ folder for changes", "green");
    log("  status         Show status of all transcripts in pipeline", "green");
    log("  help           Show this help message\n", "green");
  } else {
    log(`Unknown command: ${cmd}`, "red");
    log("Use 'help' to see available commands", "yellow");
  }
}

const command = process.argv[2] || "help";
parseCommand(command);
