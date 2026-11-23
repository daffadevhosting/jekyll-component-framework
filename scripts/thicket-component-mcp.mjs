#!/usr/bin/env node

import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  inspectComponent,
  updateComponentFile,
  validateComponentChange,
  validateComponentDependencies
} from "./component-mcp-tools.mjs";

export function createThicketComponentServer(root) {
  const server = new McpServer({
    name: "thicket-component-tools",
    version: "1.4.7"
  });

  server.registerTool(
    "thicket_component_inspect",
    {
      title: "Inspect a Thicket component",
      description:
        "Read the existing Liquid, SCSS, JavaScript, and documentation files for a component and report its static Liquid include dependencies.",
      inputSchema: {
        name: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: false
      }
    },
    async ({ name }) => {
      try {
        const result = await inspectComponent(root, name);
        return {
          content: [{ type: "text", text: JSON.stringify(result) }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: error.message }],
          isError: true
        };
      }
    }
  );

  server.registerTool(
    "thicket_component_validate",
    {
      title: "Validate a proposed Thicket component change",
      description:
        "Temporarily stages a proposed component file, validates it and runs the relevant build/tests, then restores the original file.",
      inputSchema: {
        name: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        file: z.enum(["liquid", "scss", "javascript", "documentation"]),
        content: z.string().max(2 * 1024 * 1024)
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: false
      }
    },
    async ({ name, file, content }) => {
      try {
        const result = await validateComponentChange({ root, name, file, content });
        return {
          content: [{ type: "text", text: JSON.stringify(result) }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: error.message }],
          isError: true
        };
      }
    }
  );

  server.registerTool(
    "thicket_component_update",
    {
      title: "Update an existing Thicket component",
      description:
        "Generate a unified line diff by default. After reviewing it, set dry_run=false to apply the change; the server validates and tests the staged file and automatically restores the original if any check fails.",
      inputSchema: {
        name: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        file: z.enum(["liquid", "scss", "javascript", "documentation"]),
        content: z.string().max(2 * 1024 * 1024),
        dry_run: z.boolean().default(true)
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ name, file, content, dry_run }) => {
      try {
        const result = await updateComponentFile({
          root,
          name,
          file,
          content,
          dryRun: dry_run
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result) }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: error.message }],
          isError: true
        };
      }
    }
  );

  server.registerTool(
    "thicket_component_validate_dependencies",
    {
      title: "Validate Thicket component dependencies",
      description:
        "Check the static Liquid include dependencies for one component or every component and report missing include files.",
      inputSchema: {
        name: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional()
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: false
      }
    },
    async ({ name }) => {
      try {
        const result = await validateComponentDependencies(root, name);
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
          isError: !result.valid
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: error.message }],
          isError: true
        };
      }
    }
  );

  return server;
}

async function main() {
  const { values } = parseArgs({
    options: { root: { type: "string" } },
    strict: true
  });
  const root = resolve(values.root ?? process.cwd());
  const server = createThicketComponentServer(root);
  await server.connect(new StdioServerTransport());
}

const isDirectExecution =
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isDirectExecution) {
  await main();
}
