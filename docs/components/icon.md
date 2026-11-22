---
layout: docs
title: Icon
description: Inline SVG icon component API
permalink: /docs/components/icon/
---

# Icon

Renders a named inline SVG through the shared `_includes/icon.html` implementation.

## Usage

```liquid
{% raw %}{% include components/icon.html name="arrow-right" size="1.25em" %}{% endraw %}
```

## Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | string | required | Supported icon name, such as `arrow-right`, `check`, `github`, or `user` |
| `size` | string | `1em` | CSS size applied to width and height |
| `class` | string | — | Additional CSS classes |
| `aria_hidden` | boolean | true | Hide decorative icons from assistive technology |
| `aria_label` | string | icon name | Accessible name when `aria_hidden=false`; supply a human-readable name |

Icons are decorative by default. For meaningful icons, set `aria_hidden=false` and provide a human-readable `aria_label`; the icon name is a fallback.
