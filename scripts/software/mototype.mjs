#!/usr/bin/env node
import { readFileSync, statSync } from "node:fs";
import { basename } from "node:path";
import { createHash } from "node:crypto";
import {
  defaults,
  restoreRecord,
  runRecord,
} from "../../src/contents/software/engine/runtime.ts";
import { parseCSV } from "../../src/contents/software/engine/mototype.ts";
try {
  const args = process.argv.slice(2),
    path = args.shift();
  if (!path || path === "--help") {
    process.stdout.write(
      "Mototype: node --experimental-strip-types scripts/software/mototype.mjs <input.csv|run.json> [--stage early|learn|verify] [--threshold 100] [--tolerance 5] [--wait-cost 0.15]\nCSV uses the fixed B1–B3 identity, a switch at experimental time 2 h, and RFU / reader-demo-01. Output is a recomputed JSON run record.\n",
    );
    if (!path) process.exitCode = 1;
  } else {
    if (statSync(path).size > 5 * 1024 * 1024)
      throw new Error("Input exceeds the 5 MiB file limit.");
    const text = readFileSync(path, "utf8");
    const fromJSON = path.toLowerCase().endsWith(".json");
    let dataset, settings;
    if (fromJSON) ({ dataset, settings } = restoreRecord(JSON.parse(text)));
    else {
      dataset = {
        id: "cli-input",
        name: basename(path),
        source: "local",
        hash: createHash("sha256").update(text).digest("hex"),
        rawCSV: text,
        rows: parseCSV(text),
      };
      settings = { ...defaults };
    }
    const flags = {
      "--stage": "stage",
      "--threshold": "threshold",
      "--tolerance": "tolerance",
      "--wait-cost": "waitCost",
    };
    while (args.length) {
      const flag = args.shift(),
        value = args.shift();
      if (!Object.hasOwn(flags, flag) || value === undefined)
        throw new Error("Unknown or missing option: " + flag);
      settings[flags[flag]] = flag === "--stage" ? value : Number(value);
    }
    if (
      !["early", "learn", "verify"].includes(settings.stage) ||
      ![settings.threshold, settings.tolerance, settings.waitCost].every(
        Number.isFinite,
      ) ||
      settings.threshold < 0 ||
      settings.threshold > 1e6 ||
      settings.tolerance < 1 ||
      settings.tolerance > 20 ||
      settings.waitCost < 0 ||
      settings.waitCost > 1
    )
      throw new Error("Settings outside the workbench's supported range.");
    process.stdout.write(
      JSON.stringify(runRecord(dataset, settings), null, 2) + "\n",
    );
  }
} catch (error) {
  process.stderr.write(
    (error instanceof Error ? error.message : String(error)) + "\n",
  );
  process.exitCode = 1;
}
