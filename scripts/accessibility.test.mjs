import { describe, it } from "node:test";
import assert from "node:assert/strict";
import axe from "axe-core";
import { JSDOM } from "jsdom";
import { buildLiquidFixture } from "./liquid-test-utils.mjs";

describe("rendered component accessibility", () => {
  it("has no WCAG 2 A/AA violations in a representative rendered component page", async () => {
    const fixture = await buildLiquidFixture();
    const dom = new JSDOM(fixture.html, { runScripts: "outside-only" });

    try {
      dom.window.eval(axe.source);
      const results = await dom.window.axe.run(dom.window.document, {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]
        },
        rules: {
          "color-contrast": { enabled: false }
        }
      });

      assert.deepEqual(
        [...results.violations].map(({ id, help }) => ({ id, help })),
        []
      );
    } finally {
      dom.window.close();
      await fixture.cleanup();
    }
  });
});
