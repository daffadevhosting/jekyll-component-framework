---
name: jekyll-component-framework
description: Install, customize, and extend the Thicket UI Jekyll component framework. Use for work in this repository or when integrating its Liquid components, SCSS design system, JavaScript enhancements, or npm package into a Jekyll site.
---

# Thicket UI / Jekyll Component Framework

Thicket UI is a Jekyll-native UI framework. Its public site is also the source
project: Liquid includes render markup, Sass compiles the visual system, and
small ES modules progressively enhance selected components. Preserve that split
when changing or integrating it.

## First, establish the target

Determine which of these the request concerns before changing files:

| Target | What to use |
| --- | --- |
| This component-garden site or a full fork | The repository source, `bundle install`, then Jekyll commands. |
| An existing non-Jekyll frontend consuming the published package | `npm install thicket-ui`; import `thicket-ui/css`, and optionally `thicket-ui/js`. |
| An existing Jekyll site that needs Liquid components | Bring in the relevant `_includes/components/` templates in addition to the package assets, or use a full fork. The npm package does not install Jekyll layouts, data, or pages. |

Do not replace a consumer's existing Jekyll layouts, configuration, brand
tokens, or JavaScript entrypoint unless the user asks. Adapt the integration to
their site.

## Repository map

- `_includes/components/`: Liquid component API. Include files from here with
  `{% include components/<name>.html ... %}`. Inspect the target include and
  its page in `docs/components/` before choosing parameters.
- `_includes/sections/` and `_includes/partials/`: composed marketing sections
  and shared page regions, not generic component primitives.
- `_layouts/`: default, post, and documentation shells. They load
  `assets/css/main.css` and `assets/js/main.js` through `relative_url`.
- `_data/`: site content and navigation consumed by Liquid layouts/pages.
- `assets/scss/_tokens.scss`: source of design tokens. `assets/scss/_framework.scss`
  assembles the system; component and section partials live below their
  respective directories.
- `assets/css/main.scss`: Jekyll Sass entrypoint for this site; its YAML front
  matter is required. `assets/scss/thicket.scss` is the package Sass entrypoint.
- `assets/js/main.js`: imports and initializes the optional progressive
  enhancement modules after `DOMContentLoaded`.
- `docs/`: user-facing framework docs, including the component contract.
- `scripts/thicket.mjs`: `thicket` package CLI, including CSS purge support.
- `portfolio-jekyll/` and `templates/`: examples/templates, not part of the
  primary site's Jekyll build (`portfolio-jekyll` is excluded in `_config.yml`).

## Install and run

For this repository or a full Jekyll fork:

```bash
bundle install
bundle exec jekyll serve
```

Use `bundle exec jekyll build --strict` for a production-oriented validation.
The generated site is `_site/`; do not hand-edit it.

For the published package:

```bash
npm install thicket-ui
```

```js
import "thicket-ui/css";
import "thicket-ui/js";
```

The package exports `./css`, `./scss`, and `./js`, provides the `thicket` CLI,
and ships component include templates. For a smaller generated stylesheet in a
Jekyll project, run from that site's root:

```bash
npx thicket purge --output assets/css/thicket.purged.css
```

Treat purge output as an artifact to review on the consuming site's critical
pages. Dynamic class generation may require safelist additions in
`thicket.config.json`.

## Make changes in the correct layer

### Pages and content

Use a layout and front matter, then compose sections or components through
Liquid includes. Keep user-visible documentation aligned with component API
changes. Use `relative_url` for root-relative assets and links so the configured
`baseurl` continues to work on project-hosted deployments.

### Theme and styling

Prefer overriding existing CSS custom properties for a brand change. Edit
`_tokens.scss` only when the framework's token defaults themselves should
change. Use the established BEM-inspired selectors:

```text
.c-component
.c-component--variant
.c-component__element
```

Use `c-` for components and `l-` for layout. The `u-` utility system is for
page-specific composition. Keep light/dark values in sync and avoid baking a
single theme's colors into component rules. Respect existing reduced-motion
handling when adding animation.

### Components

For a new reusable component, add only the pieces its behavior needs:

1. `_includes/components/<name>.html` for its Liquid API and semantic markup.
2. `assets/scss/components/_<name>.scss`, imported by the framework entry.
3. `assets/js/components/<name>.js` only for behavior that cannot be HTML/CSS.
   Import and initialize it from `assets/js/main.js` when it must run globally.
4. `docs/components/<name>.md` and the component index/navigation when the
   public documentation needs to expose it.

Favor native elements and accessible state/relationships first. JavaScript is
an enhancement, so the baseline markup must remain useful without it. When
changing an existing component, retain its documented Liquid parameters and CSS
classes unless the request explicitly authorizes a breaking API change.

## Project conventions and checks

- `_config.yml` declares the `docs` collection and excludes generated/dependency
  content, scripts, examples, and `portfolio-jekyll` from the main build.
- `theme` is the localStorage key used by theme initialization. Supported
  preference modes are `light`, `dark`, and `system`.
- JavaScript modules are served as ES modules from the layout. Avoid introducing
  a bundler requirement for ordinary framework changes.
- Component docs and source are the authority for parameter names; inspect both
  before editing usages across pages.

Choose verification that matches the change:

```bash
bundle exec jekyll build --strict
npm run test:purge
npm run build:css
```

Run only the relevant commands and report any environment prerequisite that
prevents them. Do not edit `_site/`, `node_modules/`, `vendor/`, or package
lockfiles merely to make a build appear clean.

## Optional component MCP server

This repo contains `.mcp.json` for `jekyll-component-mcp`. If the user's AI
environment supports MCP and they want component inspection, generation, or
validation, run:

```bash
npm run mcp
```

The server is optional; continue with the source files when it is unavailable.
