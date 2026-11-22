#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { resolve } from "node:path";
import {
  collectContentFiles,
  defaultContent,
  defaultSafelist,
  extractClassNames,
  pruneStylesheet
} from "./thicket.mjs";

const root = process.cwd();
const css = await readFile(resolve(root, "dist/thicket.css"), "utf8");
const contentFiles = await collectContentFiles(defaultContent, root);
const usedClasses = new Set();
let hasDynamicClasses = false;

for (const file of contentFiles) {
  const source = await readFile(file, "utf8");
  for (const name of extractClassNames(source)) {
    if (name === "__liquid_dynamic__" || name === "__js_dynamic__") {
      hasDynamicClasses = true;
    } else {
      usedClasses.add(name);
    }
  }
}

function measure(mode, safelist) {
  const started = performance.now();
  const output = pruneStylesheet(css, usedClasses, safelist, {
    mode,
    hasDynamicClasses
  });
  return {
    mode,
    bytes: Buffer.byteLength(output),
    milliseconds: Number((performance.now() - started).toFixed(2))
  };
}

const safe = measure("safe", defaultSafelist);
const aggressive = measure("aggressive", []);
const originalBytes = Buffer.byteLength(css);
const reduction = ((originalBytes - aggressive.bytes) / originalBytes) * 100;

console.log(`Content files scanned: ${contentFiles.length}`);
console.log(`Dynamic classes detected: ${hasDynamicClasses}`);
console.log(`Original CSS: ${originalBytes} bytes`);
console.log(`Safe mode: ${safe.bytes} bytes (${safe.milliseconds} ms)`);
console.log(
  `Aggressive mode: ${aggressive.bytes} bytes (${aggressive.milliseconds} ms, ${reduction.toFixed(1)}% reduction)`
);
