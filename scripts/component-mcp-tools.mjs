import {
  chmod,
  copyFile,
  lstat,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  stat,
  writeFile
} from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";

const componentFiles = {
  liquid: (name) => join("_includes", "components", `${name}.html`),
  scss: (name) => join("assets", "scss", "components", `_${name}.scss`),
  javascript: (name) => join("assets", "js", "components", `${name}.js`),
  documentation: (name) => join("docs", "components", `${name}.md`)
};

const maximumContentBytes = 2 * 1024 * 1024;
const maximumDiffBytes = 64 * 1024;
const activeUpdates = new Set();

function isWithinRoot(root, path) {
  const pathFromRoot = relative(root, path);
  return pathFromRoot !== "" && pathFromRoot !== ".." &&
    !pathFromRoot.startsWith(`..${sep}`) && !isAbsolute(pathFromRoot);
}

function getComponentRelativePath(name, file) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
    throw new Error("Component name must be kebab-case.");
  }
  const getPath = componentFiles[file];
  if (!getPath) throw new Error(`Unsupported component file: ${file}`);
  return getPath(name);
}

async function getComponentFile(root, name, file) {
  const rootPath = await realpath(root);
  const requestedPath = resolve(rootPath, getComponentRelativePath(name, file));
  if (!isWithinRoot(rootPath, requestedPath)) {
    throw new Error("Component path is outside the project root.");
  }

  const fileInfo = await lstat(requestedPath);
  if (!fileInfo.isFile()) {
    throw new Error(`Existing ${file} source is required; this operation does not create files.`);
  }
  const sourcePath = await realpath(requestedPath);
  if (!isWithinRoot(rootPath, sourcePath)) {
    throw new Error("Component path resolves outside the project root.");
  }
  return sourcePath;
}

function splitLines(value) {
  if (value === "") return [];
  const lines = value.split("\n");
  if (value.endsWith("\n")) lines.pop();
  return lines;
}

function createUnifiedDiff(previous, next, file) {
  const oldLines = splitLines(previous);
  const newLines = splitLines(next);
  const rows = oldLines.length + 1;
  const columns = newLines.length + 1;
  const operations = [];

  if (rows * columns > 1_000_000) {
    for (const line of oldLines) operations.push(`-${line}`);
    for (const line of newLines) operations.push(`+${line}`);
  } else {
    const table = new Uint32Array(rows * columns);
    for (let oldIndex = oldLines.length - 1; oldIndex >= 0; oldIndex -= 1) {
      for (let newIndex = newLines.length - 1; newIndex >= 0; newIndex -= 1) {
        const index = oldIndex * columns + newIndex;
        table[index] = oldLines[oldIndex] === newLines[newIndex]
          ? table[(oldIndex + 1) * columns + newIndex + 1] + 1
          : Math.max(table[(oldIndex + 1) * columns + newIndex], table[index + 1]);
      }
    }

    let oldIndex = 0;
    let newIndex = 0;
    while (oldIndex < oldLines.length && newIndex < newLines.length) {
      if (oldLines[oldIndex] === newLines[newIndex]) {
        operations.push(` ${oldLines[oldIndex]}`);
        oldIndex += 1;
        newIndex += 1;
      } else if (
        table[(oldIndex + 1) * columns + newIndex] >=
        table[oldIndex * columns + newIndex + 1]
      ) {
        operations.push(`-${oldLines[oldIndex]}`);
        oldIndex += 1;
      } else {
        operations.push(`+${newLines[newIndex]}`);
        newIndex += 1;
      }
    }
    while (oldIndex < oldLines.length) {
      operations.push(`-${oldLines[oldIndex]}`);
      oldIndex += 1;
    }
    while (newIndex < newLines.length) {
      operations.push(`+${newLines[newIndex]}`);
      newIndex += 1;
    }
  }

  const header = [
    `--- a/${file}`,
    `+++ b/${file}`,
    `@@ -${oldLines.length ? 1 : 0},${oldLines.length} +${newLines.length ? 1 : 0},${newLines.length} @@`
  ].join("\n");
  let diff = `${header}\n`;
  let truncated = false;
  for (const operation of operations) {
    const line = `${operation}\n`;
    if (Buffer.byteLength(diff) + Buffer.byteLength(line) > maximumDiffBytes) {
      diff += "... diff truncated at 64 KiB ...\n";
      truncated = true;
      break;
    }
    diff += line;
  }
  if (previous.endsWith("\n") !== next.endsWith("\n")) {
    diff += "\\ No newline at end of file\n";
  }
  return { diff, diffTruncated: truncated };
}

function runCommand(root, executable, args, label) {
  const result = spawnSync(executable, args, {
    cwd: root,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 2 * 1024 * 1024
  });
  if (result.error) {
    throw new Error(`${label} could not run: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
    throw new Error(`${label} failed${output ? `:\n${output}` : "."}`);
  }
  return {
    check: label,
    passed: true,
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`.trim()
  };
}

async function validateAndTest(root, name, file) {
  const checks = [];
  if (file === "liquid") {
    const dependencies = await validateComponentDependencies(root, name);
    if (!dependencies.valid) {
      throw new Error(`Liquid include dependencies are missing: ${JSON.stringify(dependencies.missing)}`);
    }
    checks.push({ check: "Liquid include dependencies", passed: true });
    checks.push(runCommand(root, "bundle", ["exec", "jekyll", "build", "--strict"], "Strict Jekyll build"));
    checks.push(runCommand(
      root,
      process.execPath,
      ["--test", "scripts/liquid-components.test.mjs"],
      "Liquid component tests"
    ));
  } else if (file === "scss") {
    const sass = await import("sass");
    const compiled = sass.compile(join(root, "assets/scss/thicket.scss"));
    if (Buffer.byteLength(compiled.css) > 225_000) {
      throw new Error(`Compiled CSS exceeds the 225000-byte budget (${Buffer.byteLength(compiled.css)} bytes).`);
    }
    checks.push({ check: "Full SCSS compilation and CSS size budget", passed: true });
    checks.push(runCommand(
      root,
      process.execPath,
      ["--test", "scripts/layout-utilities.test.mjs"],
      "SCSS utility tests"
    ));
  } else if (file === "javascript") {
    checks.push(runCommand(
      root,
      process.execPath,
      ["--check", getComponentRelativePath(name, file)],
      "JavaScript syntax check"
    ));
    checks.push(runCommand(
      root,
      process.execPath,
      ["--test", "scripts/javascript-interactions.test.mjs"],
      "JavaScript interaction tests"
    ));
  } else {
    checks.push(runCommand(root, "bundle", ["exec", "jekyll", "build", "--strict"], "Strict Jekyll build"));
    checks.push(runCommand(
      root,
      process.execPath,
      ["--test", "scripts/component-api.test.mjs"],
      "Component API documentation tests"
    ));
  }
  return checks;
}

async function withStagedComponentFile(root, name, file, content, action, keepChanges) {
  const projectRoot = await realpath(root);
  const target = await getComponentFile(projectRoot, name, file);
  const lockKey = target;
  if (activeUpdates.has(lockKey)) {
    throw new Error(`A component update is already running for ${relative(projectRoot, target)}.`);
  }
  activeUpdates.add(lockKey);

  const backup = join(dirname(target), `.thicket-backup-${randomUUID()}`);
  const staged = join(dirname(target), `.thicket-update-${randomUUID()}`);
  let backupExists = false;

  try {
    const originalMode = (await stat(target)).mode;
    await writeFile(staged, content, { encoding: "utf8", flag: "wx", mode: originalMode });
    await copyFile(target, backup);
    backupExists = true;
    await chmod(backup, originalMode & 0o777);
    await rename(staged, target);
    const result = await action();
    if (keepChanges) {
      await rm(backup, { force: true });
      backupExists = false;
    } else {
      await rm(target, { force: true });
      await rename(backup, target);
      backupExists = false;
    }
    return result;
  } catch (error) {
    if (backupExists) {
      try {
        await rm(target, { force: true });
        await rename(backup, target);
        backupExists = false;
      } catch (rollbackError) {
        throw new AggregateError(
          [error, rollbackError],
          `Component validation failed and rollback could not restore ${relative(projectRoot, target)}.`
        );
      }
    }
    throw error;
  } finally {
    try {
      await rm(staged, { force: true });
      if (!backupExists) await rm(backup, { force: true });
    } finally {
      activeUpdates.delete(lockKey);
    }
  }
}

export async function inspectComponent(root, name) {
  const projectRoot = await realpath(root);
  const files = {};
  for (const file of Object.keys(componentFiles)) {
    try {
      const path = await getComponentFile(projectRoot, name, file);
      files[file] = {
        path: relative(projectRoot, path),
        content: await readFile(path, "utf8")
      };
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      files[file] = { path: getComponentRelativePath(name, file), present: false };
    }
  }
  const dependencies = await validateComponentDependencies(projectRoot, name);
  return { name, files, dependencies };
}

export async function validateComponentChange({ root, name, file, content }) {
  if (typeof content !== "string" || Buffer.byteLength(content) > maximumContentBytes) {
    throw new Error("Component content must be a string no larger than 2 MiB.");
  }
  const checks = await withStagedComponentFile(
    root,
    name,
    file,
    content,
    () => validateAndTest(root, name, file),
    false
  );
  return { valid: true, checks };
}

export async function updateComponentFile({
  root,
  name,
  file,
  content,
  dryRun = true,
  validate = validateAndTest
}) {
  if (typeof content !== "string" || Buffer.byteLength(content) > maximumContentBytes) {
    throw new Error("Component content must be a string no larger than 2 MiB.");
  }

  const projectRoot = await realpath(root);
  const target = await getComponentFile(projectRoot, name, file);
  const current = await readFile(target, "utf8");
  if (current === content) {
    return { changed: false, dryRun, file: relative(projectRoot, target) };
  }
  const filePath = relative(projectRoot, target);
  const { diff, diffTruncated } = createUnifiedDiff(current, content, filePath);
  if (dryRun) {
    return {
      changed: true,
      dryRun: true,
      file: filePath,
      diff,
      diffTruncated,
      previousBytes: Buffer.byteLength(current),
      nextBytes: Buffer.byteLength(content)
    };
  }

  const checks = await withStagedComponentFile(
    projectRoot,
    name,
    file,
    content,
    () => validate(projectRoot, name, file),
    true
  );
  return {
    changed: true,
    dryRun: false,
    file: filePath,
    diff,
    diffTruncated,
    bytes: Buffer.byteLength(content),
    checks
  };
}

export async function validateComponentDependencies(root, componentName, sourceOverride) {
  const projectRoot = await realpath(root);
  const includesRoot = join(projectRoot, "_includes");
  const componentsPath = join(includesRoot, "components");
  const entries = componentName
    ? [`${componentName}.html`]
    : (await readdir(componentsPath)).filter((file) => file.endsWith(".html"));
  const checked = [];
  const missing = [];

  for (const entry of entries) {
    const componentNameFromFile = entry.slice(0, -".html".length);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(componentNameFromFile)) {
      throw new Error(`Invalid component name: ${componentNameFromFile}`);
    }

    const sourcePath = join(componentsPath, entry);
    const source = (componentName === componentNameFromFile && sourceOverride !== undefined
      ? sourceOverride
      : await readFile(sourcePath, "utf8"))
      .replace(/\{%[-\s]*comment\s*[-\s]*%\}[\s\S]*?\{%[-\s]*endcomment\s*[-\s]*%\}/g, "")
      .replace(/\{%[-\s]*raw\s*[-\s]*%\}[\s\S]*?\{%[-\s]*endraw\s*[-\s]*%\}/g, "");
    checked.push(componentNameFromFile);

    for (const match of source.matchAll(/\{%[-\s]*include\s+([^\s%]+)[\s%-]*%\}/g)) {
      const includeName = match[1];
      if (includeName.includes("{") || includeName.includes("}")) continue;
      const dependencyPath = resolve(includesRoot, includeName);
      if (!isWithinRoot(includesRoot, dependencyPath)) {
        missing.push({ component: componentNameFromFile, include: includeName });
        continue;
      }
      try {
        const resolvedDependency = await realpath(dependencyPath);
        if (!isWithinRoot(includesRoot, resolvedDependency)) {
          missing.push({ component: componentNameFromFile, include: includeName });
          continue;
        }
        await readFile(resolvedDependency, "utf8");
      } catch (error) {
        if (error.code === "ENOENT") {
          missing.push({ component: componentNameFromFile, include: includeName });
        } else {
          throw error;
        }
      }
    }
  }

  return { valid: missing.length === 0, checked, missing };
}
