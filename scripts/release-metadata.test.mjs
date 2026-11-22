import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("release metadata", () => {
  it("keeps package, site, documentation, and dependency versions aligned", async () => {
    const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
    const packageLock = JSON.parse(await readFile(join(root, "package-lock.json"), "utf8"));
    const config = await readFile(join(root, "_config.yml"), "utf8");
    const readme = await readFile(join(root, "README.md"), "utf8");
    const skill = await readFile(join(root, "SKILL.md"), "utf8");
    const changelog = await readFile(join(root, "CHANGELOG.md"), "utf8");
    const gemfile = await readFile(join(root, "Gemfile"), "utf8");
    const gemLock = await readFile(join(root, "Gemfile.lock"), "utf8");

    assert.equal(packageLock.version, packageJson.version);
    assert.equal(packageLock.packages[""].version, packageJson.version);
    assert.match(config, new RegExp(`^version: ${packageJson.version}$`, "m"));
    assert.match(readme, new RegExp(`v${packageJson.version}\\b`));
    assert.match(skill, new RegExp(`thicket-ui@${packageJson.version}/dist/thicket\\.css`));
    assert.match(changelog, new RegExp(`^## \\[${packageJson.version}\\]`, "m"));
    assert.match(gemfile, /gem "jekyll-feed", "~> 0\.18"/);
    assert.match(gemLock, /jekyll-feed \(~> 0\.18\)/);
  });
});
