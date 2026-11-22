#!/usr/bin/env node

/**
 * Thicket CSS purge CLI
 *
 * Conservative selector pruning for Thicket UI stylesheets.
 * Designed to fail-safe: prefer keeping a class over removing a needed rule.
 *
 * Limitations (documented):
 * - Regex-based class extraction is not a full Liquid/JS parser.
 * - Dynamic template interpolations and computed class names may be missed;
 *   default safelist covers framework prefixes (c-, l-, u-, is-, has-, js-).
 * - Always verify purged output against critical pages before shipping.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { glob } from "glob";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const defaultContent = [
  "**/*.{html,htm,md,liquid,js,jsx,ts,tsx,vue}",
  "!**/node_modules/**",
  "!**/_site/**",
  "!**/vendor/**",
  "!**/dist/**"
];

/** Framework prefixes always retained (components, layouts, utilities, state). */
export const defaultSafelist = [
  /^c-/,
  /^l-/,
  /^u-/,
  /^is-/,
  /^has-/,
  /^js-/,
  /^data-/
];

/**
 * Extract class names from source content.
 * Handles static attributes, classList mutations, and simple Liquid interpolations.
 */
export function extractClassNames(content) {
  const classNames = new Set();

  // class="..." / className='...' / class=`...`
  const classAttributes = /(?:class|className)\s*=\s*(["'`])([\s\S]*?)\1/g;
  // classList.add/remove/toggle/contains("...")
  const classMutations = /classList\.(?:add|remove|toggle|contains)\(([^)]*)\)/g;
  const quotedValues = /(["'`])([^"'`]+)\1/g;

  for (const match of content.matchAll(classAttributes)) {
    const raw = match[2];
    const containsLiquid = /\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/.test(raw);
    const withoutLiquid = raw.replace(/\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/g, " ");
    withoutLiquid
      .split(/\s+/)
      .filter(Boolean)
      .forEach((name) => {
        if (!name.includes("{") && !name.includes("}")) {
          classNames.add(name);
        }
      });
    if (containsLiquid) classNames.add("__liquid_dynamic__");
  }

  for (const match of content.matchAll(classMutations)) {
    const values = [...match[1].matchAll(quotedValues)];
    const dynamicExpression = match[1].replace(quotedValues, "").trim();
    for (const value of values) {
      value[2]
        .split(/\s+/)
        .filter(Boolean)
        .forEach((name) => classNames.add(name));
    }
    if (dynamicExpression) classNames.add("__js_dynamic__");
  }

  for (const match of content.matchAll(/\bclassName\s*=\s*([^;\n]+)/g)) {
    const expression = match[1].trim();
    const values = [...expression.matchAll(quotedValues)];
    for (const value of values) {
      value[2]
        .split(/\s+/)
        .filter(Boolean)
        .forEach((name) => classNames.add(name));
    }
    if (!/^(['"])[\s\S]*\1$/.test(expression)) {
      classNames.add("__js_dynamic__");
    }
  }

  // Template literals in JS: `is-${state}` / `c-button--${variant}`
  const templateLiterals = /`([^`]*\$\{[^}]+\}[^`]*)`/g;
  for (const match of content.matchAll(templateLiterals)) {
    const staticParts = match[1].replace(/\$\{[^}]+\}/g, " ");
    staticParts
      .split(/\s+/)
      .filter((t) => t && !t.includes("$"))
      .forEach((name) => classNames.add(name));
    classNames.add("__js_dynamic__");
  }

  return classNames;
}

export async function collectContentFiles(patterns, workingDirectory) {
  const matches = await Promise.all(
    patterns.map((pattern) =>
      glob(pattern, {
        cwd: workingDirectory,
        nodir: true,
        ignore: [
          "**/node_modules/**",
          "**/_site/**",
          "**/vendor/**",
          "**/dist/**"
        ]
      })
    )
  );

  return [...new Set(matches.flat())].map((file) =>
    resolve(workingDirectory, file)
  );
}

export function printHelp() {
  console.log(`Usage: thicket purge [options]

Options:
  -i, --input <file>       Input CSS (defaults to Thicket's full stylesheet)
  -o, --output <file>      Output CSS (defaults to ./thicket.purged.css)
  -c, --content <glob>     Content glob; may be passed more than once
      --safelist <regex>   Keep matching classes; may be passed more than once
      --mode <mode>        Purge mode: safe (default) or aggressive
      --config <file>      JSON config (defaults to ./thicket.config.json)
  -h, --help               Show this help

By default, source files are scanned recursively. Safe mode retains dynamic
classes using framework prefixes:
  c-  l-  u-  is-  has-  js-

If dynamic Liquid/JavaScript classes are detected, safe mode keeps the input
stylesheet unchanged. Aggressive mode purges more classes and may remove
runtime-generated styles; review its output on critical pages before deploy.
Add a thicket.config.json or --safelist for project-specific classes.`);
}

export function keepClass(name, usedClasses, safelist = defaultSafelist) {
  return usedClasses.has(name) || safelist.some((pattern) => pattern.test(name));
}

export function pruneStylesheet(css, usedClasses, safelist, options = {}) {
  const { mode = "safe", hasDynamicClasses = false } = options;
  if (mode !== "safe" && mode !== "aggressive") {
    throw new Error(`Unknown purge mode: ${mode}`);
  }
  if (mode === "safe" && hasDynamicClasses) return css;

  const activeSafelist = safelist ?? (mode === "safe" ? defaultSafelist : []);
  const stylesheet = postcss.parse(css);

  stylesheet.walkRules((rule) => {
    const selectors = selectorParser().astSync(rule.selector);
    selectors.each((selector) => {
      const classes = [];
      selector.walkClasses((className) => classes.push(className.value));
      const keepSelector =
        classes.length === 0 ||
        classes.every((name) => keepClass(name, usedClasses, activeSafelist));

      if (!keepSelector) selector.remove();
    });

    if (selectors.nodes.length === 0) {
      rule.remove();
    } else {
      rule.selector = selectors.toString();
    }
  });

  stylesheet.walkAtRules((rule) => {
    if (rule.nodes && rule.nodes.length === 0) rule.remove();
  });

  return stylesheet.toString();
}

export async function runCli(argv = process.argv.slice(2), workingDirectory = process.cwd()) {
  const [command, ...args] = argv;

  if (command === "--help" || command === "-h" || !command) {
    printHelp();
    return command ? 0 : 1;
  }

  if (command !== "purge") {
    console.error(`Unknown command: ${command}`);
    printHelp();
    return 1;
  }

  try {
    const { values } = parseArgs({
      args,
      options: {
        input: { type: "string", short: "i" },
        output: { type: "string", short: "o" },
        content: { type: "string", short: "c", multiple: true },
        safelist: { type: "string", multiple: true },
        mode: { type: "string" },
        config: { type: "string" },
        help: { type: "boolean", short: "h" }
      },
      strict: true
    });

    if (values.help) {
      printHelp();
    } else {
      const configPath = resolve(
        workingDirectory,
        values.config ?? "thicket.config.json"
      );
      let config = {};

      try {
        config = JSON.parse(await readFile(configPath, "utf8"));
      } catch (error) {
        if (error.code !== "ENOENT" || values.config) throw error;
      }

      const outputPath = resolve(
        workingDirectory,
        values.output ?? config.output ?? "thicket.purged.css"
      );
      const mode = values.mode ?? config.mode ?? "safe";
      if (mode !== "safe" && mode !== "aggressive") {
        throw new Error(`Unknown purge mode "${mode}". Use "safe" or "aggressive".`);
      }
      const content = values.content ?? config.content ?? defaultContent;
      const customSafelist = [
        ...(config.safelist ?? []),
        ...(values.safelist ?? [])
      ].map((pattern) => new RegExp(pattern));
      const cssPath = resolve(
        workingDirectory,
        values.input ??
          config.input ??
          resolve(packageRoot, "dist/thicket.css")
      );
      if (cssPath === outputPath) {
        throw new Error("Output must not overwrite the input stylesheet.");
      }

      const contentFiles = await collectContentFiles(content, workingDirectory);
      if (!contentFiles.length) {
        throw new Error(
          "No content files matched. Check the content globs before purging."
        );
      }

      const usedClasses = new Set();
      let hasDynamicClasses = false;

      for (const file of contentFiles) {
        const source = await readFile(file, "utf8");
        const found = extractClassNames(source);
        for (const name of found) {
          if (name === "__liquid_dynamic__" || name === "__js_dynamic__") {
            hasDynamicClasses = true;
          } else {
            usedClasses.add(name);
          }
        }
      }

      const safelist =
        mode === "safe"
          ? [...defaultSafelist, ...customSafelist]
          : customSafelist;
      const css = await readFile(cssPath, "utf8");
      const output = pruneStylesheet(css, usedClasses, safelist, {
        mode,
        hasDynamicClasses
      });

      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, output);

      const dynamicNote =
        mode === "safe" && hasDynamicClasses
          ? " (dynamic classes detected — safe mode kept the input unchanged)"
          : mode === "aggressive" && hasDynamicClasses
            ? " (dynamic classes detected — aggressive mode may omit runtime styles)"
            : "";
      console.log(`Purged CSS written to ${outputPath}${dynamicNote}`);
      return 0;
    }
    return 0;
  } catch (error) {
    console.error(`Thicket purge failed: ${error.message}`);
    return 1;
  }
}

const isDirectExecution =
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isDirectExecution) {
  process.exitCode = await runCli();
}
