import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Button link semantics", () => {
  it("keeps normal links semantic and never adds role=button", async () => {
    const source = await readFile(
      join(repositoryRoot, "_includes", "components", "button.html"),
      "utf8"
    );
    const normalLinkBranch = source.slice(
      source.indexOf("{% elsif include.href %}"),
      source.indexOf("{% else %}", source.indexOf("{% elsif include.href %}"))
    );

    assert.doesNotMatch(normalLinkBranch, /\brole\s*=\s*["']button["']/);
    assert.match(normalLinkBranch, /<a[\s\S]*href=/);
  });

  it("uses a non-navigating span for disabled anchors", async () => {
    const source = await readFile(
      join(repositoryRoot, "_includes", "components", "button.html"),
      "utf8"
    );
    const disabledBranch = source.slice(
      source.indexOf("{% if include.href and include.disabled %}"),
      source.indexOf("{% elsif include.href %}")
    );

    assert.match(disabledBranch, /<span[\s\S]*aria-disabled="true"/);
    assert.doesNotMatch(disabledBranch, /\bhref\s*=|role\s*=/);
  });
});
