# Thicket UI

[![npm version](https://img.shields.io/npm/v/thicket-ui.svg)](https://www.npmjs.com/package/thicket-ui)
[![Socket Badge](https://badge.socket.dev/npm/package/thicket-ui/1.4.7)](https://badge.socket.dev/npm/package/thicket-ui/1.4.7)

**A hybrid component and utility framework for Jekyll · v1.4.7**

Thicket is an accessible, Jekyll-native UI framework pairing reusable Liquid components with token-based utility classes, an earthy palette, and editorial typography.
It is built with:

- **Jekyll** + **Liquid**
- **SCSS** + **CSS Custom Properties**
- **Vanilla JavaScript** (ES modules)
- **HTML5** semantic markup

Use the included design tokens and components as a starting point for SaaS, portfolio, blog, and documentation sites, then make the system your own.

---

![ss][def]

---

## Features

- Thicket's own woodland palette, editorial type, and seed-inspired mark
- Design token system for rebranding without rewriting components
- Dark Mode (light / dark / system) with localStorage persistence
- Accessible components (WCAG 2.2 AA principles)
- SEO metadata through `jekyll-seo-tag` plus site-level Organization structured data
- Opt-in button ripple (`ripple=true`) and warm card glare (`glare=true`)
- Optional card border beam (`border_beam=true`) for featured surfaces
- Mobile-first responsive design
- Minimal dependencies
- Progressive enhancement
- Component API via Liquid includes
- Token-based utility classes for responsive layouts and one-off styling
- Jekyll-aware CSS purge CLI, searchable combobox, and rich customizable select popup
- Self-hosted documentation ready
- Ready for GitHub Pages & Cloudflare Pages

## Utility Classes

Thicket combines reusable Liquid components with `u-*` utility classes. Use components for consistent interface patterns and utilities for page-specific layout or styling; both use the same theme tokens and support dark mode.

```html
<div class="u-grid u-grid-cols-1 u-md-grid-cols-2 u-gap-4 u-lg-gap-8">
   <section class="u-p-6 u-bg-surface u-text-default">
      <h2 class="u-font-display u-text-2xl">Utility-first, Thicket-style</h2>
   </section>
</div>
```

Utilities are documented in [Layout Primitives](docs/components/layout-primitives.md). They are compiled as part of the framework stylesheet and do not require a separate JavaScript or CSS build step.

---

## Requirements

- Ruby >= 3.0
- Bundler
- Jekyll 4.3+

---

## Installation

### npm

Install the framework in any frontend project:

```bash
npm install thicket-ui
```

Import the compiled stylesheet and optional JavaScript entrypoint from your app:

```js
import "thicket-ui/css";
import "thicket-ui/js";
```

The package also includes the SCSS source at `thicket-ui/scss`, Liquid component templates under `_includes/components/`, and the shared `_includes/icon.html` include they depend on. The CSS is built automatically when the package is packed or published.

#### CDN

For a quick setup without a bundler, include the compiled stylesheet from unpkg:

```html
<link rel="stylesheet" href="https://unpkg.com/thicket-ui@1.4.7/dist/thicket.css">
```

The version is pinned to `1.4.7` so your site keeps using the same CSS until you choose to upgrade. Replace `1.4.7` with a newer published version when you want to update.

The package and `thicket` CLI support Node.js 18, 20, and 22 or newer. Repository development and local MCP tooling require Node.js 20 or newer. Jekyll site builds require Ruby and Bundler.

### Trusted HTML slots

Some Liquid components accept HTML slots (`content`, `body`, or `footer`) and render them without escaping so nested components remain usable. Only pass trusted markup authored in project templates or trusted project data; never pass user-submitted or otherwise untrusted HTML. Plain-text values and URL attributes are escaped, and component links reject unsupported URL schemes.

To generate a smaller stylesheet for a Jekyll site, run the CLI from the site root:

```bash
npx thicket purge --output assets/css/thicket.purged.css
```

By default it scans HTML, Markdown, Liquid, and JavaScript source files while excluding generated `_site`, dependencies, and vendor files.

**Safe mode (default):** classes matching `c-`, `l-`, `u-`, `is-`, `has-`, `js-`, and `data-` are retained. If the scanner detects Liquid control-flow or computed JavaScript classes, it leaves the input stylesheet unchanged rather than risk removing runtime styles.

**Aggressive mode (opt-in):** remove unused framework-prefixed classes too, based on the extracted source classes. Review the output and configure a safelist for classes generated at runtime:

```bash
npx thicket purge --mode aggressive --output assets/css/thicket.purged.css
```

Add a `thicket.config.json` to customize scanning and extra safelist patterns:

```json
{
   "mode": "safe",
   "content": ["_includes/**/*.html", "_layouts/**/*.html", "docs/**/*.{md,html}", "assets/js/**/*.js"],
   "output": "assets/css/thicket.purged.css",
   "safelist": ["^my-app-"]
}
```

Use `"mode": "aggressive"` to opt into smaller output, and add project-specific patterns to `safelist` in either mode. Always review aggressive output on critical pages before deployment; dynamic Liquid/JavaScript extraction is heuristic, not a full language parser. `npm run benchmark:purge` reports production CSS sizes and timings for both modes.



### AI tooling (optional) — jekyll-component-mcp

Thicket ships with optional [jekyll-component-mcp](https://www.npmjs.com/package/jekyll-component-mcp) support so AI agents can discover components and their metadata, inspect source and parameters, preview and validate components, browse or update design tokens, and create component scaffolds or update component documentation.

```bash
# included as a development dependency for repository work
npm install

# run the MCP server against this project
npm run mcp
# or: npx -y jekyll-component-mcp --root .
```

Project config is in `.mcp.json` (relative `--root .`). Point your MCP client (Cursor, Claude Code, VS Code, etc.) at that file or the `npx` command above.

The discovery server validates a component's Liquid, SCSS, documentation, accessibility hints, and parameter consistency. Run `npm run test:components` for repository-wide include dependency and documentation checks.

Thicket also registers a focused local MCP server from `.mcp.json`. Use `thicket_component_inspect` to read a component's source, docs, and Liquid dependencies. `thicket_component_update` returns a unified diff by default; after reviewing it, set `dry_run=false` to apply. Apply stages the change, validates and runs the relevant build/tests, and rolls back automatically if a check fails. `thicket_component_validate` runs those checks against proposed content without retaining it. Run the server directly with `npm run mcp:components`. The discovery server remains responsible for catalog metadata, previews, design tokens, scaffolding, and broader component validation.

### Project skill for AI agents

[`SKILL.md`](SKILL.md) gives an AI agent the project-specific context needed to
install, customize, and extend Thicket without confusing the full Jekyll source
with the published npm package.

Keep `SKILL.md` at the repository root, then use the approach supported by your
agent:

1. **Repository-aware agents:** open the repository and ask the agent to read
   and follow `SKILL.md` before it starts work.
2. **Agents with a project-instructions setting:** add the contents of
   `SKILL.md` as the project's instructions, or configure that setting to point
   to this file if the agent supports file references.
3. **Agents with a skills directory:** install or copy this project as a skill
   using that agent's documented skill layout, preserving `SKILL.md` as the
   skill entrypoint.

Example prompt:

```text
Read and follow SKILL.md in the project root. Then add a [component/change]
to this Thicket UI project and validate the relevant build or test command.
```
or

```text
Fetch and read https://unpkg.com/thicket-ui@latest/SKILL.md. Follow the relevant instructions to set up thicket-ui in this project.
```

The skill is guidance for the agent, not a runtime dependency: it is not needed
by Jekyll or the npm package in production.

### Jekyll source

```bash
git clone https://github.com/daffadevhosting/jekyll-component-framework.git
cd jekyll-component-framework
bundle install
```

---

## Development

Install the Node development dependencies before building the distributable CSS
or packing the npm package. This provides the local Sass executable used by the
build scripts:

```bash
npm install
npm test
npm run build:css
npm pack --dry-run
```

`npm test` verifies the purge extraction, CSS pruning, and Button link semantics.
It also packs and installs the package tarball in a temporary consumer project,
then checks the CSS, SCSS, JavaScript, Liquid, CLI, and purge surfaces.

```bash
bundle exec jekyll serve
```

Open [http://localhost:4000](http://localhost:4000).

Build the CSS published in the npm package with either command:

```bash
npm run build
# or: npm run build:css
```

---

## Production Build

```bash
bundle exec jekyll build
# or strict mode
bundle exec jekyll build --strict
```

Output is generated in `_site/`.

---

## Project Structure

```text
jekyll-component-framework/
├── _config.yml
├── Gemfile
├── _data/                  # Site data & navigation
├── _includes/
│   ├── components/         # Reusable UI components
│   ├── sections/           # Marketing sections
│   └── partials/
├── _layouts/
├── assets/
│   ├── css/main.scss       # Entry point
│   ├── scss/               # Design system
│   │   ├── _tokens.scss
│   │   ├── _mixins.scss
│   │   ├── _reset.scss
│   │   ├── _base.scss
│   │   ├── _typography.scss
│   │   ├── _utilities.scss
│   │   ├── _animations.scss
│   │   └── components/
│   └── js/
│       ├── main.js
│       └── components/
├── docs/
├── examples/
└── pages/
```

---

## Component Usage

```liquid
{% include components/button.html
   label="Get Started"
   href="/pricing/"
   variant="primary"
   size="lg"
   icon="arrow-right"
   icon_position="right"
%}
```

```liquid
{% include components/card.html
   title="Feature"
   body="Description here"
   elevated=true
%}
```

```liquid
{% include components/alert.html
   variant="success"
   title="Saved"
   message="Your settings have been updated."
%}
```

---

## Theming & Customization

Override CSS variables:

```css
:root {
  --color-primary: #ff4d00;
  --radius-md: 0.5rem;
}
```

Or set `data-theme="dark"` / `data-theme="light"` on `<html>`.

Theme preference is stored in `localStorage` under key `theme`.

---

## Dark Mode

Supported modes:

- `light`
- `dark`
- `system` (follows `prefers-color-scheme`)

Toggle is included in the navbar. Flash of incorrect theme is prevented via an inline script in `<head>`.

---

## Adding a New Component

1. Create `_includes/components/my-component.html`
2. Create `assets/scss/components/_my-component.scss`
3. Import the SCSS in `assets/css/main.scss`
4. Add JavaScript (if needed) under `assets/js/components/`
5. Document it under `docs/components/`

Follow the existing BEM-inspired naming (`c-component`, `c-component--variant`).

---

## Deployment

### GitHub Pages

1. Push to the `master` branch. The included `Deploy Jekyll site to Pages`
   workflow builds the site with the Jekyll version in `Gemfile` and deploys
   `_site` to Pages.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**. Do not use
   the branch-based Pages builder: it uses an older Sass toolchain that cannot
   compile this project's Jekyll 4 stylesheet.
3. Set `url` in `_config.yml`. The workflow provides the correct project
   `baseurl` during Pages builds.

### Cloudflare Pages

1. Connect the repository
2. Build command: `bundle exec jekyll build`
3. Output directory: `_site`

---

## License

MIT License — see [LICENSE](LICENSE).

---

## Status

Thicket UI 1.4.7 release
More components, documentation pages, and example templates will be added iteratively.


[def]: ./file.png
