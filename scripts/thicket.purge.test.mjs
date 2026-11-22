import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  extractClassNames,
  keepClass,
  pruneStylesheet,
  runCli
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

  it("detects Liquid control-flow classes and computed JavaScript class names", () => {
    const liquid = extractClassNames(
      `<div class="c-menu{% if page.open %} is-open{% endif %}">`
    );
    const javascript = extractClassNames("element.className = currentState;");

    assert.ok(liquid.has("__liquid_dynamic__"));
    assert.ok(javascript.has("__js_dynamic__"));
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

  it("keeps all CSS in safe mode when dynamic classes are detected", () => {
    const css = ".c-menu { display: block; } .other { display: none; }";
    const output = pruneStylesheet(css, new Set(), defaultSafelist, {
      mode: "safe",
      hasDynamicClasses: true
    });

    assert.equal(output, css);
  });

  it("aggressive mode can remove unused framework-prefixed selectors", () => {
    const css = ".c-used { color: green; } .c-unused { display: none; }";
    const output = pruneStylesheet(css, new Set(["c-used"]), [], {
      mode: "aggressive"
    });

    assert.match(output, /\.c-used/);
    assert.doesNotMatch(output, /\.c-unused/);
  });

  it("rejects unknown purge modes", () => {
    assert.throws(
      () => pruneStylesheet(".used { color: green; }", new Set(), [], { mode: "fast" }),
      /Unknown purge mode/
    );
  });

  it("applies safe and aggressive modes through the CLI", async () => {
    const root = await mkdtemp(join(tmpdir(), "thicket-purge-mode-"));
    const configPath = join(root, "thicket.config.json");
    const inputPath = join(root, "input.css");
    const contentPath = join(root, "content.html");
    const safePath = join(root, "safe.css");
    const aggressivePath = join(root, "aggressive.css");
    const css = ".c-menu { display: block; } .unused { display: none; }";

    try {
      await writeFile(inputPath, css);
      await writeFile(contentPath, `<div class="c-menu{% if page.open %} is-open{% endif %}">`);
      await writeFile(
        configPath,
        JSON.stringify({
          input: inputPath,
          output: safePath,
          content: [contentPath],
          mode: "safe"
        })
      );

      assert.equal(await runCli(["purge", "--config", configPath], root), 0);
      assert.equal(await readFile(safePath, "utf8"), css);

      assert.equal(
        await runCli(
          ["purge", "--config", configPath, "--output", aggressivePath, "--mode", "aggressive"],
          root
        ),
        0
      );
      const aggressive = await readFile(aggressivePath, "utf8");
      assert.match(aggressive, /\.c-menu/);
      assert.doesNotMatch(aggressive, /\.unused/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
