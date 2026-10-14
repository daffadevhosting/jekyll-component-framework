---
layout: docs
title: Code Block
description: Code block component documentation
permalink: /docs/components/code/
---

# Code Block

Displays escaped code with an optional language label and copy button. Markdown code fences in docs and pages also receive a copy button automatically.

```liquid
{% raw %}{% capture example_code %}<button class="c-button">Save</button>{% endcapture %}
{% include components/code.html code=example_code language="html" %}{% endraw %}
```

{% capture rendered_code %}<button class="c-button">Save</button>{% endcapture %}
{% include components/code.html code=rendered_code language="html" %}

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `code` | string | — | Code content; escaped before output |
| `language` | string | — | Language label and syntax-highlighting class |
| `copyable` | boolean | `true` | Shows the copy action |
| `class` | string | — | Additional CSS classes |
| `id` | string | — | Element id |

Use Liquid `capture` to pass multiline code. Copy actions require JavaScript.
