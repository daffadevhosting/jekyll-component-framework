import { lstat, readFile, readdir, realpath, rename, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

const componentFiles = {
  liquid: (name) => join("_includes", "components", `${name}.html`),
  scss: (name) => join("assets", "scss", "components", `_${name}.scss`),
  javascript: (name) => join("assets", "js", "components", `${name}.js`),
  documentation: (name) => join("docs", "components", `${name}.md`)
};

const maximumContentBytes = 2 * 1024 * 1024;

function isWithinRoot(root, path) {
  const pathFromRoot = relative(root, path);
  return pathFromRoot !== "" && pathFromRoot !== ".." &&
    !pathFromRoot.startsWith(`..${sep}`) && !isAbsolute(pathFromRoot);
}

async function getComponentFile(root, name, file) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
    throw new Error("Component name must be kebab-case.");
  }
  const getPath = componentFiles[file];
  if (!getPath) throw new Error(`Unsupported component file: ${file}`);

  const rootPath = await realpath(root);
  const requestedPath = resolve(rootPath, getPath(name));
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

export async function updateComponentFile({
  root,
  name,
  file,
  content,
  dryRun = true
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
  if (dryRun) {
    return {
      changed: true,
      dryRun: true,
      file: relative(projectRoot, target),
      previousBytes: Buffer.byteLength(current),
      nextBytes: Buffer.byteLength(content)
    };
  }

  const temporary = join(dirname(target), `.thicket-update-${randomUUID()}`);
  try {
    await writeFile(temporary, content, { encoding: "utf8", flag: "wx" });
    await rename(temporary, target);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }

  return {
    changed: true,
    dryRun: false,
    file: relative(projectRoot, target),
    bytes: Buffer.byteLength(content)
  };
}

export async function validateComponentDependencies(root, componentName) {
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
    const source = (await readFile(sourcePath, "utf8"))
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
