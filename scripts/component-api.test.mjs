import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(join(fileURLToPath(new URL(".", import.meta.url)), ".."));
const includesRoot = join(repositoryRoot, "_includes");

describe("Liquid component catalog", () => {
  it("documents every reusable component API", async () => {
    const componentFiles = (await readdir(join(includesRoot, "components")))
      .filter((name) => name.endsWith(".html"));

    for (const componentFile of componentFiles) {
      const name = componentFile.slice(0, -".html".length);
      const documentation = join(repositoryRoot, "docs", "components", `${name}.md`);
      const doc = await readFile(documentation, "utf8");
      assert.ok(
        /^## (Parameters|Usage|Example)/m.test(doc) ||
          /No parameters are required/i.test(doc),
        `${componentFile} should document its public API`
      );
    }
  });

  it("resolves every static include dependency used by components", async () => {
    const componentFiles = (await readdir(join(includesRoot, "components")))
      .filter((name) => name.endsWith(".html"));

    for (const componentFile of componentFiles) {
      const source = (await readFile(join(includesRoot, "components", componentFile), "utf8"))
        .replace(/\{% comment %\}[\s\S]*?\{% endcomment %\}/g, "")
        .replace(/\{% raw %\}[\s\S]*?\{% endraw %\}/g, "");

      for (const match of source.matchAll(/\{%[-\s]*include\s+([^\s%]+)[\s%-]*%\}/g)) {
        await readFile(join(includesRoot, match[1]), "utf8");
      }
    }
  });
});
