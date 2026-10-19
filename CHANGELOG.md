# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.2.1/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.3] - 2026-10-20

### Fixed
- Included `SKILL.md` in the npm tarball so AI-agent instructions are available from package CDNs

## [1.4.2] - 2026-10-20

### Fixed
- Excluded `SKILL.md` from Jekyll processing so agent-oriented Liquid examples do not break site builds

### Changed
- Added `npm run build` as an alias for the distributable CSS build

## [1.4.1] - 2026-10-19

### Fixed
- Button: removed incorrect `role="button"` from link variants; links keep native navigation semantics
- Button: `href` + `disabled` now renders a non-interactive `<span>` so disabled links cannot navigate
- `thicket purge`: expanded default safelist (`c-`, `l-`, `u-`, `is-`, `has-`, `js-`) so utilities and state classes are not stripped
- `thicket purge`: improved extraction for Liquid interpolations and JS template literals; fail-safe when dynamic classes are detected

### Changed
- Moved `glob`, `postcss`, and `postcss-selector-parser` to `devDependencies` (CLI/tooling only)
- Moved `jekyll-component-mcp` to `optionalDependencies` so site consumers are not forced to install the MCP server
- `.mcp.json` uses project-relative `--root .` instead of a machine-specific absolute path

### Added
- Optional `jekyll-component-mcp` integration for AI-assisted component workflows (`npm run mcp`)
- `npm run test:purge` smoke entry for the purge CLI

## [1.4.0] - 2026-10-14

### Added
- `thicket purge` CLI to remove unused CSS selectors from Jekyll and frontend source files
- Hover, focus-visible, disabled, and dark-theme utility variants
- Accessible searchable combobox with keyboard navigation and native select fallback
- Themed select popup with rich options for icons, descriptions, badges, and variants

### Changed
- Use PostCSS-based selector pruning to keep the npm dependency tree free of known CVEs

## [1.3.0] - 2026-10-14

### Added
- Expanded token-based utility classes for spacing, typography, colors, grid, and responsive breakpoints
- Theme-aware, customizable scrollbar styling
- npm package metadata and CSS build pipeline for `thicket-ui`

### Fixed
- Prevented avatar status indicators from being clipped by the avatar wrapper

## [1.2.1] - 2026-10-08

### Added
- Shared Organization JSON-LD include that complements `jekyll-seo-tag`
- SEO setup guide for site identity, social profiles, and page metadata

## [1.2.0] - 2026-10-08

### Added
- Opt-in `ripple=true` feedback for buttons, including keyboard activation
- Opt-in `glare=true` pointer highlight and `border_beam=true` accent for cards
- Subtle animated border beams on the homepage hero and selected feature cards

## [1.1.0] - 2026-10-05

### Added
- Thicket UI name, custom seed-and-braces SVG mark, and matching favicon
- Editorial component-garden homepage with a responsive Liquid / SCSS / JavaScript illustration
- Thicket woodland color palette, warm paper surfaces, and serif display typography for light and dark themes
- Offcanvas side panel component with keyboard, focus, and backdrop behavior

### Changed
- Rebranded site navigation, metadata, documentation, and examples as Thicket UI
- Added the offcanvas example and linked its documentation

## [1.0.0] - 2026-03-25

### Added
- Design token system (CSS Custom Properties) with light / dark / system themes
- SCSS architecture: tokens, mixins, reset, base, typography, utilities, animations
- **Foundation components**: Button, Card, Alert, Badge, Avatar, Icon, Navbar, Theme Toggle
- **Interactive components**: Accordion, Tabs, Modal, Dropdown, Tooltip, Toast
- **Form controls**: Input, Textarea, Select, Checkbox, Radio
- **Marketing sections**: Hero, Features, Pricing, Testimonials, FAQ, CTA
- Vanilla JS modules with progressive enhancement and accessibility (focus trap, Escape, ARIA)
- Documentation layout + pages (Introduction, Installation, Customization, Button)
- SaaS landing page example
- Toast notification system with programmatic API
- Spinner, Progress, Breadcrumb, Pagination, Button Group, Code block
- Newsletter section
- Copy-to-clipboard for code blocks
- Skip link, focus rings, reduced-motion support
