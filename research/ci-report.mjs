#!/usr/bin/env node
// Surfaces research CI results as GitHub check annotations, which are readable
// through the checks API even where the raw job logs are not.
//
//   node research/ci-report.mjs <name> <log-file> <exit-code-file>
//
// Emits one summary notice per command and, for a failed command, up to nine
// further notices carrying the most relevant part of its log.

import { existsSync, readFileSync } from "node:fs";

const [name, logPath, codePath] = process.argv.slice(2);
const CHUNK = 6000;
const MAX_CHUNKS = 9;

function escape(value) {
  return value.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}
function annotate(level, title, message) {
  console.log(`::${level} title=${escape(title).replace(/,/g, "%2C").replace(/:/g, "%3A")}::${escape(message)}`);
}

const code = existsSync(codePath) ? readFileSync(codePath, "utf8").trim() : "missing";
// Node prints the whole (minified, single-line) Emscripten loader as the
// source line of an uncaught error; shorten such lines so the message fits.
const log = (existsSync(logPath) ? readFileSync(logPath, "utf8") : "")
  .replace(/\x1b\[[0-9;]*m/g, "")
  .split("\n")
  .map((line) => (line.length > 400 ? `${line.slice(0, 160)} …[${line.length} chars truncated]` : line))
  .join("\n");
const lines = log.split("\n");

// Node's test runner prints a "failing tests:" section with full details.
function relevant() {
  const failing = log.lastIndexOf("failing tests:");
  if (failing >= 0) return log.slice(failing);
  const keep = new Set();
  lines.forEach((line, index) => {
    if (/✖|not ok|Error|error TS|assert|Assertion|expected|actual|FAIL|abort/i.test(line)) {
      for (let k = Math.max(0, index - 3); k < Math.min(lines.length, index + 25); k += 1) keep.add(k);
    }
  });
  if (keep.size) {
    let out = "";
    let last = -2;
    for (const index of [...keep].sort((a, b) => a - b)) {
      if (index !== last + 1) out += "…\n";
      out += `${lines[index]}\n`;
      last = index;
    }
    return out;
  }
  return lines.slice(-200).join("\n");
}

const summaryLines = lines.filter((line) =>
  /^(ℹ|# )(tests|suites|pass|fail|cancelled|skipped|todo|duration_ms)\b/.test(line.trim()),
);
annotate(
  "notice",
  `${name}: exit ${code}`,
  [`exit code: ${code}`, ...summaryLines, "", "tail:", ...lines.slice(-25)].join("\n"),
);

if (code !== "0") {
  const body = relevant();
  for (let index = 0; index < MAX_CHUNKS && index * CHUNK < body.length; index += 1) {
    annotate("notice", `${name} detail ${index + 1}`, body.slice(index * CHUNK, (index + 1) * CHUNK));
  }
}
