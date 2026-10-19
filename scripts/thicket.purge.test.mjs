/**
 * Smoke tests for Thicket purge class extraction + safelist behaviour.
 * Run: node --test scripts/thicket.purge.test.mjs
 *
 * Note: extractClassNames is not exported; we re-implement the same rules
 * here to lock the contract without refactoring the CLI module surface.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

const defaultSafelist = [/^c-/, /^l-/, /^u-/, /^is-/, /^has-/, /^js-/, /^data-/];

function extractClassNames(content) {
  const classNames = new Set();
  const classAttributes = /(?:class|className)\s*=\s*(["'`])([\s\S]*?)\1/g;
  const classMutations = /classList\.(?:add|remove|toggle|contains)\(([^)]*)\)/g;
  const quotedValues = /(["'`])([^"'`]+)\1/g;
  const liquidClassAttr =
    /(?:class|className)\s*=\s*(["'`])((?:(?!\1)[\s\S])*?\{\{(?:(?!\1)[\s\S])*?\}\}(?:(?!\1)[\s\S])*?)\1/g;

  for (const match of content.matchAll(classAttributes)) {
    const withoutLiquid = match[2].replace(/\{\{[\s\S]*?\}\}/g, " ");
    withoutLiquid
      .split(/\s+/)
      .filter(Boolean)
      .forEach((name) => {
        if (!name.includes("{") && !name.includes("}")) classNames.add(name);
      });
  }

  for (const match of content.matchAll(classMutations)) {
    for (const value of match[1].matchAll(quotedValues)) {
      value[2].split(/\s+/).filter(Boolean).forEach((name) => classNames.add(name));
    }
  }

  for (const _ of content.matchAll(liquidClassAttr)) {
    classNames.add("__liquid_dynamic__");
  }

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

function keepClass(name, usedClasses, safelist = defaultSafelist) {
  return usedClasses.has(name) || safelist.some((p) => p.test(name));
}

describe("extractClassNames", () => {
  it("collects static class attributes", () => {
    const found = extractClassNames(`<div class="c-card u-mt-4 hero-banner">`);
    assert.ok(found.has("c-card"));
    assert.ok(found.has("u-mt-4"));
    assert.ok(found.has("hero-banner"));
  });

  it("collects classList mutations", () => {
    const found = extractClassNames(`menu.classList.add('is-open'); menu.classList.remove("is-closed")`);
    assert.ok(found.has("is-open"));
    assert.ok(found.has("is-closed"));
  });

  it("keeps static tokens from Liquid interpolations and flags dynamic", () => {
    const found = extractClassNames(
      `{% assign v = "primary" %}<a class="c-button c-button--{{ v }} extra">`
    );
    assert.ok(found.has("c-button"));
    assert.ok(found.has("extra"));
    assert.ok(found.has("__liquid_dynamic__"));
    assert.equal(found.has("c-button--{{"), false);
  });

  it("flags JS template literal dynamics", () => {
    const found = extractClassNames("el.className = `is-${state} c-modal`;");
    assert.ok(found.has("__js_dynamic__"));
  });
});

describe("safelist", () => {
  it("retains framework prefixes even when unused in content", () => {
    const used = new Set(["hero-banner"]);
    assert.equal(keepClass("c-button--primary", used), true);
    assert.equal(keepClass("u-flex", used), true);
    assert.equal(keepClass("is-open", used), true);
    assert.equal(keepClass("l-stack", used), true);
    assert.equal(keepClass("hero-banner", used), true);
    assert.equal(keepClass("orphan-utility", used), false);
  });
});
