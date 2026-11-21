import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractClassNames,
  keepClass,
  pruneStylesheet
} from "./thicket.mjs";

const defaultSafelist = [/^c-/, /^l-/, /^u-/, /^is-/, /^has-/, /^js-/, /^data-/];

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

describe("pruneStylesheet", () => {
  it("retains combined selectors when every class is needed", () => {
    const css = `
      .c-button, .c-button--primary { color: green; }
      .unused-card { display: none; }
      @media (min-width: 600px) {
        .u-grid { display: grid; }
        .unused-grid { display: grid; }
      }
    `;
    const used = new Set(["c-button", "c-button--primary", "u-grid"]);
    const output = pruneStylesheet(css, used, defaultSafelist);

    assert.match(output, /\.c-button,\s*\.c-button--primary/);
    assert.doesNotMatch(output, /\.unused-card/);
    assert.match(output, /\.u-grid/);
    assert.doesNotMatch(output, /\.unused-grid/);
  });

  it("removes selectors containing an unused class", () => {
    const css = `.c-button.unused-card { color: red; }`;
    const output = pruneStylesheet(css, new Set(["c-button"]), defaultSafelist);
    assert.doesNotMatch(output, /c-button/);
  });
});
