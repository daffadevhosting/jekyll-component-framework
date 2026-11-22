import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export async function buildLiquidFixture() {
  const tempRoot = await mkdtemp(join(tmpdir(), "thicket-liquid-test-"));
  const sourceRoot = join(tempRoot, "source");
  const destination = join(tempRoot, "output");

  await mkdir(sourceRoot, { recursive: true });
  await cp(join(repositoryRoot, "_includes"), join(sourceRoot, "_includes"), {
    recursive: true
  });
  await writeFile(
    join(sourceRoot, "_config.yml"),
    "url: https://example.test\nbaseurl: \"\"\nplugins: []\n"
  );
  await writeFile(
    join(sourceRoot, "index.html"),
    `---
layout: null
payload: "<script>alert(1)</script>"
icon_label: "Next page"
safe_html: "<strong>Trusted slot</strong>"
---
<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>Liquid test</title></head>
  <body>
    <main>
      {% include components/button.html label=page.payload %}
      {% include components/input.html name="email" label=page.payload value=page.payload %}
      {% include components/icon.html name="arrow-right" aria_hidden=false aria_label=page.icon_label %}
      {% include components/card.html body=page.safe_html %}
    </main>
  </body>
</html>
`
  );

  try {
    await execFileAsync(
      "bundle",
      [
        "exec",
        "jekyll",
        "build",
        "--source",
        sourceRoot,
        "--destination",
        destination,
        "--config",
        join(sourceRoot, "_config.yml"),
        "--quiet"
      ],
      { cwd: repositoryRoot }
    );
    return {
      html: await readFile(join(destination, "index.html"), "utf8"),
      cleanup: () => rm(tempRoot, { recursive: true, force: true })
    };
  } catch (error) {
    await rm(tempRoot, { recursive: true, force: true });
    throw error;
  }
}
