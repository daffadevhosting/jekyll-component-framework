import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("published npm package", () => {
  it("packs and installs all documented runtime surfaces", async () => {
    const tempRoot = await mkdtemp(join(tmpdir(), "thicket-package-"));
    const packageDir = join(tempRoot, "package");
    const consumerDir = join(tempRoot, "consumer");

    try {
      await mkdir(packageDir);
      await mkdir(consumerDir);

      const pack = await execFileAsync(
        "npm",
        ["pack", "--json", "--pack-destination", packageDir],
        { cwd: repositoryRoot }
      );
      const packMetadata = JSON.parse(pack.stdout);
      const [{ filename }] = Object.values(packMetadata);
      const tarball = join(packageDir, filename);

      await writeFile(
        join(consumerDir, "package.json"),
        JSON.stringify({ name: "thicket-package-smoke", private: true, type: "module" }, null, 2)
      );
      await execFileAsync("npm", ["install", "--ignore-scripts", tarball], {
        cwd: consumerDir
      });

      const installed = join(consumerDir, "node_modules", "thicket-ui");
      await readFile(join(installed, "dist", "thicket.css"), "utf8");
      await readFile(join(installed, "assets", "scss", "thicket.scss"), "utf8");
      await readFile(join(installed, "assets", "js", "main.js"), "utf8");
      await readFile(join(installed, "_includes", "components", "button.html"), "utf8");
      const iconInclude = await readFile(join(installed, "_includes", "icon.html"), "utf8");
      const iconComponent = await readFile(
        join(installed, "_includes", "components", "icon.html"),
        "utf8"
      );
      await readFile(join(installed, "scripts", "thicket.mjs"), "utf8");
      await assert.rejects(
        readFile(join(installed, "scripts", "thicket-component-mcp.mjs")),
        { code: "ENOENT" }
      );
      assert.match(iconInclude, /case include\.name/);
      assert.match(iconComponent, /include icon\.html name=include\.name/);

      const css = await readFile(join(installed, "dist", "thicket.css"), "utf8");
      assert.match(css, /--color-primary:/);

      const cli = await execFileAsync(
        "node",
        [join(installed, "scripts", "thicket.mjs"), "--help"],
        { cwd: consumerDir }
      );
      assert.match(cli.stdout, /Usage: thicket purge/);

      await writeFile(
        join(consumerDir, "index.html"),
        '<main class="c-card u-grid">Card</main>'
      );
      await writeFile(
        join(consumerDir, "site.css"),
        ".c-card { border: 1px solid; } .u-grid { display: grid; } .unused-card { display: none; }"
      );
      await execFileAsync(
        "node",
        [
          join(installed, "scripts", "thicket.mjs"),
          "purge",
          "--input",
          "site.css",
          "--output",
          "purged.css",
          "--content",
          "index.html"
        ],
        { cwd: consumerDir }
      );
      const purgedCss = await readFile(join(consumerDir, "purged.css"), "utf8");
      assert.match(purgedCss, /\.c-card/);
      assert.match(purgedCss, /\.u-grid/);
      assert.doesNotMatch(purgedCss, /\.unused-card/);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});
