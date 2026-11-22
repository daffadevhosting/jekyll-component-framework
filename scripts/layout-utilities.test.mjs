import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const css = sass.compile(resolve(root, "assets/scss/thicket.scss")).css;

describe("layout placement utilities", () => {
  it("provides float utilities and token-based position offsets", () => {
    assert.match(css, /\.u-float-left\s*\{\s*float:\s*left !important;/);
    assert.match(css, /\.u-float-right\s*\{\s*float:\s*right !important;/);
    assert.match(css, /\.u-float-none\s*\{\s*float:\s*none !important;/);
    assert.match(css, /\.u-top-0\s*\{\s*top:\s*var\(--space-0\) !important;/);
    assert.match(css, /\.u-right-4\s*\{\s*right:\s*var\(--space-4\) !important;/);
    assert.match(css, /\.u-bottom-4\s*\{\s*bottom:\s*var\(--space-4\) !important;/);
    assert.match(css, /\.u-left-4\s*\{\s*left:\s*var\(--space-4\) !important;/);
    assert.match(css, /\.u-inset-x-2\s*\{\s*inset-inline:\s*var\(--space-2\) !important;/);
    assert.match(css, /\.u-inset-y-2\s*\{\s*inset-block:\s*var\(--space-2\) !important;/);
  });
});
