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
import { fileURLToPath } from "node:url";
import { glob } from "glob";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const defaultContent = [
  "**/*.{html,htm,md,liquid,js,jsx,ts,tsx,vue}",
  "!**/node_modules/**",
  "!**/_site/**",
  "!**/vendor/**",
  "!**/dist/**"
];

/** Framework prefixes always retained (components, layouts, utilities, state). */
const defaultSafelist = [
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
function extractClassNames(content) {
  const classNames = new Set();

  // class="..." / className='...' / class=`...`
  const classAttributes = /(?:class|className)\s*=\s*(["'`])([\s\S]*?)\1/g;
  // classList.add/remove/toggle/contains("...")
  const classMutations = /classList\.(?:add|remove|toggle|contains)\(([^)]*)\)/g;
  const quotedValues = /(["'`])([^"'`]+)\1/g;

  // Liquid: class="c-button--{{ variant }}" or class="{{ foo }} bar"
  const liquidClassAttr =
    /(?:class|className)\s*=\s*(["'`])((?:(?!\1)[\s\S])*?\{\{(?:(?!\1)[\s\S])*?\}\}(?:(?!\1)[\s\S])*?)\1/g;

  for (const match of content.matchAll(classAttributes)) {
    const raw = match[2];
    // Strip Liquid expressions; keep static tokens
    const withoutLiquid = raw.replace(/\{\{[\s\S]*?\}\}/g, " ");
    withoutLiquid
      .split(/\s+/)
      .filter(Boolean)
      .forEach((name) => {
        if (!name.includes("{") && !name.includes("}")) {
          classNames.add(name);
        }
      });
  }

  for (const match of content.matchAll(classMutations)) {
    for (const value of match[1].matchAll(quotedValues)) {
      value[2]
        .split(/\s+/)
        .filter(Boolean)
        .forEach((name) => classNames.add(name));
    }
  }

  // Soft signal for Liquid dynamic classes
  for (const _ of content.matchAll(liquidClassAttr)) {
    classNames.add("__liquid_dynamic__");
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

async function collectContentFiles(patterns, workingDirectory) {
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

function printHelp() {
  console.log(`Usage: thicket purge [options]

Options:
  -i, --input <file>       Input CSS (defaults to Thicket's full stylesheet)
  -o, --output <file>      Output CSS (defaults to ./thicket.purged.css)
  -c, --content <glob>     Content glob; may be passed more than once
      --safelist <regex>   Keep matching classes; may be passed more than once
      --config <file>      JSON config (defaults to ./thicket.config.json)
  -h, --help               Show this help

By default, source files are scanned recursively. Dynamic component, layout,
utility, and JavaScript state classes are retained via safelist prefixes:
  c-  l-  u-  is-  has-  js-

Add a thicket.config.json or --safelist for project-specific classes.
Always verify purged CSS on critical pages before production deploy.`);
}

const [command, ...args] = process.argv.slice(2);

if (command === "--help" || command === "-h" || !command) {
  printHelp();
  process.exitCode = command ? 0 : 1;
} else if (command !== "purge") {
  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exitCode = 1;
} else {
  try {
    const { values } = parseArgs({
      args,
      options: {
        input: { type: "string", short: "i" },
        output: { type: "string", short: "o" },
        content: { type: "string", short: "c", multiple: true },
        safelist: { type: "string", multiple: true },
        config: { type: "string" },
        help: { type: "boolean", short: "h" }
      },
      strict: true
    });

    if (values.help) {
      printHelp();
    } else {
      const workingDirectory = process.cwd();
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

      const stylesheet = postcss.parse(await readFile(cssPath, "utf8"), {
        from: cssPath
      });
      const safelist = [...defaultSafelist, ...customSafelist];

      const keepClass = (name) =>
        usedClasses.has(name) ||
        safelist.some((pattern) => pattern.test(name));

      stylesheet.walkRules((rule) => {
        const selectors = selectorParser().astSync(rule.selector);
        selectors.each((selector) => {
          const classes = [];
          selector.walkClasses((className) => classes.push(className.value));
          const keepSelector =
            classes.length === 0 || classes.every((name) => keepClass(name));

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

      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, stylesheet.toString());

      const dynamicNote = hasDynamicClasses
        ? " (dynamic Liquid/JS classes detected — safelist applied)"
        : "";
      console.log(`Purged CSS written to ${outputPath}${dynamicNote}`);
    }
  } catch (error) {
    console.error(`Thicket purge failed: ${error.message}`);
    process.exitCode = 1;
  }
}
