import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildLiquidFixture } from "./liquid-test-utils.mjs";

describe("Liquid component rendering", () => {
  it("escapes untrusted text and attribute values while keeping HTML slots usable", async () => {
    const fixture = await buildLiquidFixture();

    try {
      assert.match(fixture.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
      assert.doesNotMatch(fixture.html, /<script>alert\(1\)<\/script>/);
      assert.match(fixture.html, /value="&lt;script&gt;alert\(1\)&lt;\/script&gt;"/);
      assert.match(fixture.html, /role="img" aria-label="Next page"/);
      assert.match(fixture.html, /<strong>Trusted slot<\/strong>/);
      assert.match(fixture.html, /data-thicket-invalid-url="true"/);
      assert.doesNotMatch(fixture.html, /href="JaVaScRiPt:alert\(1\)"/);
      assert.doesNotMatch(fixture.html, /href="\/\/evil\.example\/path"/);
      assert.match(fixture.html, /href="https:\/\/example\.test\/help"/);
    } finally {
      await fixture.cleanup();
    }
  });
});
