import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import {
  updateComponentFile,
  validateComponentDependencies
} from "./component-mcp-tools.mjs";
import { createThicketComponentServer } from "./thicket-component-mcp.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("Thicket component MCP tools", () => {
  it("supports dry-run and atomic updates of existing component files only", async () => {
    const root = await mkdtemp(join(tmpdir(), "thicket-component-update-"));
    const componentDir = join(root, "_includes", "components");
    const componentFile = join(componentDir, "button.html");

    try {
      await mkdir(componentDir, { recursive: true });
      await writeFile(componentFile, "Original component\n");

      const preview = await updateComponentFile({
        root,
        name: "button",
        file: "liquid",
        content: "Updated component\n"
      });
      assert.equal(preview.dryRun, true);
      assert.equal(await readFile(componentFile, "utf8"), "Original component\n");

      const result = await updateComponentFile({
        root,
        name: "button",
        file: "liquid",
        content: "Updated component\n",
        dryRun: false
      });
      assert.equal(result.changed, true);
      assert.equal(await readFile(componentFile, "utf8"), "Updated component\n");

      await assert.rejects(
        updateComponentFile({
          root,
          name: "missing",
          file: "liquid",
          content: "No file should be created",
          dryRun: false
        }),
        /ENOENT/
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("validates static include dependencies for the whole framework", async () => {
    const result = await validateComponentDependencies(repositoryRoot);
    assert.equal(result.valid, true);
    assert.ok(result.checked.includes("button"));
    assert.deepEqual(result.missing, []);
  });

  it("registers update and dependency validation through MCP", async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createThicketComponentServer(repositoryRoot);
    const client = new Client({ name: "thicket-test-client", version: "1.0.0" });

    try {
      await server.connect(serverTransport);
      await client.connect(clientTransport);
      const { tools } = await client.listTools();

      assert.ok(tools.some(({ name }) => name === "thicket_component_update"));
      assert.ok(tools.some(({ name }) => name === "thicket_component_validate_dependencies"));

      const result = await client.callTool({
        name: "thicket_component_validate_dependencies",
        arguments: { name: "button" }
      });
      assert.equal(result.isError, false);
      assert.match(result.content[0].text, /"valid":true/);
    } finally {
      await client.close();
      await server.close();
    }
  });
});
