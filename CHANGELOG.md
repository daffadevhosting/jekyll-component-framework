# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.2.1/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
