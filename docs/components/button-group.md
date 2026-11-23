---
layout: docs
title: Button Group
description: Button group component documentation
permalink: /docs/components/button-group/
---

# Button Group

Groups related actions into a connected horizontal or vertical control.

```liquid
{% raw %}{% include components/button-group.html
   items=site.data.demo.button_group
   size="md"
   aria_label="Choose reporting period"
%}{% endraw %}
```

{% include components/button-group.html items=site.data.demo.button_group size="md" aria_label="Choose reporting period" %}

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `items` | array | — | Entries with `label`, optional `href`, `variant`, `active`, and `disabled` |
| `variant` | string | `outline` | Default button variant for items |
| `size` | string | `md` | Button size |
| `vertical` | boolean | `false` | Stacks buttons vertically |
| `content` | HTML | — | Trusted markup for custom nested buttons when `items` is omitted |
| `aria_label` | string | — | Accessible group name |
| `class` | string | — | Additional CSS classes |

The `content` slot is rendered as trusted HTML. Only pass markup from templates or trusted project data.
