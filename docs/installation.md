---
layout: docs
title: Installation
description: Install and run Thicket UI
permalink: /docs/installation/
---

# Installation

## Runtime compatibility

The published package and its `thicket` CLI support Node.js 18, 20, and 22 or newer. Repository development and the local MCP tools require Node.js 20 or newer. Jekyll site builds require Ruby and Bundler; Node.js is not needed to serve an already built static site.

## Clone & install

```bash
git clone https://github.com/daffadevhosting/jekyll-component-framework.git
cd jekyll-component-framework
bundle install
```

## Development server

```bash
bundle exec jekyll serve
```

## Production build

```bash
bundle exec jekyll build
```

Output is written to `_site/`.

## Configuration

Edit `_config.yml`:

```yaml
title: Your Site Name
url: https://example.com
baseurl: ""

theme_config:
  primary_color: "#285943"
  dark_mode: true
  default_theme: "system"
```

Brand colors are primarily controlled via CSS variables in `assets/scss/_tokens.scss` or your own override stylesheet.
