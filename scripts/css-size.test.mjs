import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const stylesheet = join(resolve(dirname(fileURLToPath(import.meta.url)), ".."), "dist", "thicket.css");
const maximumBytes = 225_000;

describe("production CSS size", () => {
  it(`keeps the built stylesheet under ${maximumBytes} bytes`, async () => {
    const css = await readFile(stylesheet);
    assert.ok(css.byteLength <= maximumBytes, `CSS is ${css.byteLength} bytes`);
  });
});
