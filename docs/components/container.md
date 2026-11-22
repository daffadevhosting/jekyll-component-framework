---
layout: docs
title: Container
description: Container layout component API
permalink: /docs/components/container/
---

# Container

Constrains content to a responsive maximum width with built-in horizontal padding.

## Usage

```liquid
{% raw %}{% include components/container.html size="lg" content=page.content %}{% endraw %}
```

## Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | string | `xl` | `sm`, `md`, `lg`, `xl`, `2xl`, or `full` |
| `content` | HTML | — | Trusted markup rendered inside the container |
| `class` | string | — | Additional CSS classes |

`content` is an HTML slot; only pass markup from trusted project templates or data.
