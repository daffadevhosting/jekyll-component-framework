---
layout: docs
title: Tooltip
description: Tooltip component documentation
permalink: /docs/components/tooltip/
---

# Tooltip

Adds descriptive text to a short piece of inline content. Pass the wrapped markup through `content`.

```liquid
{% raw %}{% capture help_label %}<button type="button" class="c-button c-button--ghost c-button--md">Help</button>{% endcapture %}
{% include components/tooltip.html text="More information" content=help_label %}{% endraw %}
```

<div class="docs-component-example">

  {% capture tooltip_example %}
    {% include components/button.html label=site.data.demo.tooltip_example.label variant="ghost" %}
  {% endcapture %}
  {% include components/tooltip.html text=site.data.demo.tooltip_example.text position=site.data.demo.tooltip_example.position content=tooltip_example %}

</div>

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `text` | string | — | Tooltip text |
| `content` | HTML | — | Trusted inline markup that triggers the tooltip |
| `position` | string | `top` | `top`, `bottom`, `left`, `right` |
| `class` | string | — | Additional CSS classes |

Keep essential instructions available in visible text as well; tooltips supplement rather than replace labels.

The `content` slot is rendered as trusted HTML. Only pass markup from templates or trusted project data.
