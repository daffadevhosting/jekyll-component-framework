---
layout: docs
title: Divider
description: Divider component API
permalink: /docs/components/divider/
---

# Divider

Renders a semantic horizontal rule using the framework's border tokens.

## Usage

```liquid
{% raw %}{% include components/divider.html variant="subtle" %}{% endraw %}
```

## Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | string | default | `subtle` or `strong` |
| `class` | string | — | Additional CSS classes |

The `<hr>` element indicates a thematic break and does not require an accessible name.
