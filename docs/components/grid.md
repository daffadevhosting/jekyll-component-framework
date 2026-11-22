---
layout: docs
title: Grid
description: Grid layout component API
permalink: /docs/components/grid/
---

# Grid

Creates a responsive grid using Thicket layout and spacing classes.

## Usage

```liquid
{% raw %}{% include components/grid.html columns=3 gap=4 content=page.content %}{% endraw %}
```

## Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `columns` | number | — | `2`, `3`, or `4` columns |
| `gap` | number | — | Spacing step `1`, `2`, `3`, `4`, `6`, or `8` |
| `content` | HTML | — | Trusted markup rendered inside the grid |
| `class` | string | — | Additional CSS classes |

`content` is an HTML slot; only pass markup from trusted project templates or data.
