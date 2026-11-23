import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import {
  inspectComponent,
  updateComponentFile,
  validateComponentChange,
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
      assert.match(preview.diff, /-Original component/);
      assert.match(preview.diff, /\+Updated component/);
      assert.equal(await readFile(componentFile, "utf8"), "Original component\n");

      let validatedStagedContent;
      const result = await updateComponentFile({
        root,
        name: "button",
        file: "liquid",
        content: "Updated component\n",
        dryRun: false,
        validate: async () => {
          validatedStagedContent = await readFile(componentFile, "utf8");
          return [{ check: "fixture validation", passed: true }];
        }
      });
      assert.equal(result.changed, true);
      assert.equal(validatedStagedContent, "Updated component\n");
      assert.deepEqual(result.checks, [{ check: "fixture validation", passed: true }]);
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

  it("restores the original file if apply-time validation fails", async () => {
    const root = await mkdtemp(join(tmpdir(), "thicket-component-rollback-"));
    const componentDir = join(root, "_includes", "components");
    const componentFile = join(componentDir, "button.html");

    try {
      await mkdir(componentDir, { recursive: true });
      await writeFile(componentFile, "Original component\n");
      await assert.rejects(
        updateComponentFile({
          root,
          name: "button",
          file: "liquid",
          content: "Invalid component\n",
          dryRun: false,
          validate: async () => {
            assert.equal(await readFile(componentFile, "utf8"), "Invalid component\n");
            throw new Error("validation rejected");
          }
        }),
        /validation rejected/
      );
      assert.equal(await readFile(componentFile, "utf8"), "Original component\n");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("validates staged JavaScript and restores the file after failure", async () => {
    const root = await mkdtemp(join(tmpdir(), "thicket-component-syntax-"));
    const componentDir = join(root, "assets", "js", "components");
    const componentFile = join(componentDir, "tabs.js");

    try {
      await mkdir(componentDir, { recursive: true });
      await writeFile(componentFile, "export const valid = true;\n");
      await assert.rejects(
        validateComponentChange({
          root,
          name: "tabs",
          file: "javascript",
          content: "const = ;\n"
        }),
        /JavaScript syntax check failed/
      );
      assert.equal(await readFile(componentFile, "utf8"), "export const valid = true;\n");
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

  it("inspects existing component sources, documentation, and dependencies", async () => {
    const result = await inspectComponent(repositoryRoot, "button");
    assert.equal(result.files.liquid.path, "_includes/components/button.html");
    assert.match(result.files.liquid.content, /Button Component/);
    assert.equal(result.files.documentation.path, "docs/components/button.md");
    assert.equal(result.dependencies.valid, true);
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
      assert.ok(tools.some(({ name }) => name === "thicket_component_inspect"));
      assert.ok(tools.some(({ name }) => name === "thicket_component_validate"));
      assert.ok(tools.some(({ name }) => name === "thicket_component_validate_dependencies"));

      const result = await client.callTool({
        name: "thicket_component_validate_dependencies",
        arguments: { name: "button" }
      });
      assert.equal(result.isError, false);
      assert.match(result.content[0].text, /"valid":true/);

      const inspected = await client.callTool({
        name: "thicket_component_inspect",
        arguments: { name: "button" }
      });
      assert.notEqual(inspected.isError, true);
      assert.match(inspected.content[0].text, /"documentation"/);

      const diff = await client.callTool({
        name: "thicket_component_update",
        arguments: {
          name: "button",
          file: "liquid",
          content: "Proposed component contents\n"
        }
      });
      assert.notEqual(diff.isError, true);
      assert.match(diff.content[0].text, /--- a\/_includes\/components\/button.html/);
      assert.match(diff.content[0].text, /"dryRun":true/);

      const validation = await client.callTool({
        name: "thicket_component_validate",
        arguments: {
          name: "tabs",
          file: "javascript",
          content: "const = ;\n"
        }
      });
      assert.equal(validation.isError, true);
      assert.match(validation.content[0].text, /JavaScript syntax check failed/);

      const tabs = await inspectComponent(repositoryRoot, "tabs");
      const validated = await client.callTool({
        name: "thicket_component_validate",
        arguments: {
          name: "tabs",
          file: "javascript",
          content: tabs.files.javascript.content
        }
      });
      assert.notEqual(validated.isError, true);
      assert.match(validated.content[0].text, /"valid":true/);
    } finally {
      await client.close();
      await server.close();
    }
  });
});
