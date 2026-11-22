---
layout: docs
title: Stack
description: Stack layout component API
permalink: /docs/components/stack/
---

# Stack

Arranges content vertically with a consistent token-based gap.

## Usage

```liquid
{% raw %}{% include components/stack.html size="lg" content=page.content %}{% endraw %}
```

## Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | string | `md` | Gap size: `xs`, `sm`, `md`, `lg`, `xl`, or `2xl` |
| `content` | HTML | — | Trusted markup rendered inside the stack |
| `class` | string | — | Additional CSS classes |

`content` is an HTML slot; only pass markup from trusted project templates or data.
